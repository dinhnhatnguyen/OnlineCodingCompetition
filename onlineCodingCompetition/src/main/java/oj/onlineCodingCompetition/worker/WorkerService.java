package oj.onlineCodingCompetition.worker;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.TestCaseResultRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import oj.onlineCodingCompetition.entity.Submission;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.entity.TestCaseResult;
import oj.onlineCodingCompetition.entity.Problem.FunctionSignature;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.service.SubmissionService;
import oj.onlineCodingCompetition.service.TestCaseService;
import oj.onlineCodingCompetition.service.ProblemService;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkerService {

    private final AmazonSQS amazonSQS;
    private final SubmissionService submissionService;
    private final TestCaseRepository testCaseRepository;
    private final TestCaseResultRepository testCaseResultRepository;
    private final TestCaseService testCaseService;
    private final ProblemService problemService;
    private final ObjectMapper objectMapper;
    // Thêm vào phần dependency injection (fields) của WorkerService
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;

    @Value("${aws.sqs.queue-url}")
    private String queueUrl;

    private static final Map<String, String> LANGUAGE_IMAGE_MAP = Map.of(
            "java", "java-runner",
            "python", "python-runner",
            "cpp", "docker build -t cpp-runner .\n",
            "javascript", "js-runner"
    );

    private static final Map<String, String> LANGUAGE_EXTENSION_MAP = Map.of(
            "java", ".java",
            "python", ".py",
            "cpp", ".cpp",
            "javascript", ".js"
    );

    private static final Map<String, String> LANGUAGE_MAIN_CLASS_MAP = Map.of(
            "java", "Solution",
            "python", "solution",
            "cpp", "solution",
            "javascript", "solution"
    );

    @Data
    public static class ExecutionResult {
        private String output;
        private String error;
        private int exitCode;
        private long runtimeMs;
        private long memoryUsedKb;
    }

    public void processSubmissions() {
        while (true) {
            ReceiveMessageRequest receiveMessageRequest = new ReceiveMessageRequest(queueUrl)
                    .withMaxNumberOfMessages(1)
                    .withWaitTimeSeconds(20);
            log.info("Worker is polling queue: {}", queueUrl);
            List<Message> messages = amazonSQS.receiveMessage(receiveMessageRequest).getMessages();
            log.info("Number of messages received: {}", messages.size());

            for (Message message : messages) {
                try {
                    // Đọc dữ liệu từ message SQS
                    Map<String, Object> messageMap = objectMapper.readValue(message.getBody(),
                            new TypeReference<Map<String, Object>>() {});
                    log.info("Received message for submission: {}", messageMap);

                    // Lấy submission từ cơ sở dữ liệu
                    Long submissionId = Long.valueOf(messageMap.get("submissionId").toString());
                    Long problemId = Long.valueOf(messageMap.get("problemId").toString());
                    Long userId = Long.valueOf(messageMap.get("userId").toString());

                    // Thêm cơ chế retry với backoff để tìm submission
                    int maxRetries = 3;
                    int retryCount = 0;
                    Submission submission = null;

                    while (retryCount < maxRetries) {
                        try {
                            submission = fetchSubmission(submissionId);
                            break; // Thoát vòng lặp nếu tìm thấy
                        } catch (Exception e) {
                            retryCount++;
                            log.warn("Retry {}/{} - Submission {} not found, waiting...",
                                    retryCount, maxRetries, submissionId);
                            if (retryCount >= maxRetries) {
                                throw e; // Ném lại exception nếu đã hết số lần retry
                            }
                            try {
                                // Tăng dần thời gian chờ (exponential backoff)
                                Thread.sleep(1000 * retryCount);
                            } catch (InterruptedException ie) {
                                Thread.currentThread().interrupt();
                            }
                        }
                    }

                    // Use a new transaction to update status to PROCESSING
                    updateSubmissionStatus(submissionId, Submission.SubmissionStatus.PROCESSING);
                    log.info("Submission {} set to PROCESSING", submissionId);

                    // Fetch problem in a separate transaction
                    Problem problem = fetchProblem(problemId);
                    
                    // Use the data we need outside of transaction
                    String language = submission.getLanguage();
                    String sourceCode = submission.getSourceCode();
                    
                    // Load test cases in a separate transaction
                    List<TestCase> testCases = fetchTestCases(problemId);
                    
                    // These operations happen outside any transaction boundary
                    int passedTestCases = 0;
                    int totalTestCases = testCases.size();
                    boolean earlyStop = false;
                    double totalScore = 0.0;
                    long totalMemoryUsedKb = 0;
                    List<Long> runtimeMsList = new ArrayList<>();
                    List<TestCaseResult> testCaseResults = new ArrayList<>();

                    // Process each test case - this is the CPU intensive part that should be outside transactions
                    for (TestCase testCase : testCases) {
                        TestCaseResult result = runTestCase(submission, testCase);
                        testCaseResults.add(result);
                        
                        if (result.getStatus() == TestCaseResult.TestCaseStatus.PASSED) {
                            passedTestCases++;
                            totalScore += testCase.getWeight() != null ? testCase.getWeight() : 1.0;
                        } else if (testCase.getIsExample() && result.getStatus() == TestCaseResult.TestCaseStatus.FAILED) {
                            // Nếu test case ví dụ không pass, dừng sớm
                            earlyStop = true;
                            break;
                        }
                        
                        // Safely handle null values for runtimeMs and memoryUsedKb
                        if (result.getRuntimeMs() != null) {
                            runtimeMsList.add((long) result.getRuntimeMs());
                        }
                        if (result.getMemoryUsedKb() != null) {
                            totalMemoryUsedKb += result.getMemoryUsedKb();
                        }
                    }

                    // Calculate final results
                    int averageRuntimeMs = 0;
                    if (!runtimeMsList.isEmpty()) {
                        long sumRuntimeMs = runtimeMsList.stream().mapToLong(Long::longValue).sum();
                        averageRuntimeMs = (int) (sumRuntimeMs / runtimeMsList.size());
                    }

                    // Update final results in a new transaction
                    updateFinalResults(
                        submissionId, 
                        earlyStop ? Submission.SubmissionStatus.WRONG_ANSWER : 
                            (passedTestCases == testCases.size() ? 
                                Submission.SubmissionStatus.ACCEPTED : Submission.SubmissionStatus.WRONG_ANSWER),
                        passedTestCases,
                        totalTestCases,
                        totalScore,
                        averageRuntimeMs,
                        (int) totalMemoryUsedKb,
                        testCaseResults
                    );

                    // Xóa message khỏi queue sau khi xử lý thành công
                    amazonSQS.deleteMessage(queueUrl, message.getReceiptHandle());
                    log.info("Processed and deleted message for submission {}", submission.getId());
                } catch (Exception e) {
                    log.error("Error processing submission for message {}: {}", message.getMessageId(), e.getMessage(), e);
                    // Không xóa message để SQS chuyển sang DLQ sau khi hết retry
                }
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected Submission fetchSubmission(Long submissionId) {
        return submissionService.getSubmissionEntityById(submissionId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected Problem fetchProblem(Long problemId) {
        return problemRepository.findByIdWithFunctionSignatures(problemId)
            .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));
        
        // No need to force initialization anymore as we're using LEFT JOIN FETCH
        // if (problem.getFunctionSignatures() != null) {
        //     problem.getFunctionSignatures().size();
        // }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected List<TestCase> fetchTestCases(Long problemId) {
        return testCaseRepository.findByProblemIdOrderByTestOrderAsc(problemId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateSubmissionStatus(Long submissionId, Submission.SubmissionStatus status) {
        Submission submission = submissionService.getSubmissionEntityById(submissionId);
        submission.setStatus(status);
        submissionService.updateSubmission(submission);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateFinalResults(
            Long submissionId,
            Submission.SubmissionStatus status,
            int passedTestCases,
            int totalTestCases,
            double score,
            int runtimeMs,
            int memoryUsedKb,
            List<TestCaseResult> testCaseResults
    ) {
        Submission submission = submissionService.getSubmissionEntityById(submissionId);
        submission.setStatus(status);
        submission.setPassedTestCases(passedTestCases);
        submission.setTotalTestCases(totalTestCases);
        submission.setScore(score);
        submission.setRuntimeMs(runtimeMs);
        submission.setMemoryUsedKb(memoryUsedKb);
        submission.setCompletedAt(LocalDateTime.now());
        submissionService.updateSubmission(submission);
        
        // Save test case results in the same transaction
        for (TestCaseResult result : testCaseResults) {
            result.setSubmission(submission);
            // Don't save the test case itself, which is likely causing confusion
            // testCaseRepository.save(result.getTestCase());
            
            // Instead, save the test case result
            testCaseResultRepository.save(result);
        }
    }

    private TestCaseResult runTestCase(Submission submission, TestCase testCase) {
        TestCaseResult result = new TestCaseResult();
        result.setSubmission(submission);
        result.setTestCase(testCase);
        result.setIsHidden(testCase.getIsHidden());

        // Khởi tạo compileError mặc định
        submission.setCompileError("");

        log.info("====== Running test case {} for submission {} ======", testCase.getId(), submission.getId());
        log.info("Test case description: {}", testCase.getDescription());
        log.info("Input data: {}", testCase.getInputData());
        log.info("Expected output: {}", testCase.getExpectedOutputData());

        String tempDir = "/tmp/submission-" + UUID.randomUUID().toString();
        try {
            Files.createDirectories(Paths.get(tempDir));
            log.info("Created temp directory: {}", tempDir);

            String language = submission.getLanguage().toLowerCase();
            log.info("Submission language: {}", language);

            log.debug("Fetching function signature for problem {} and language {}", submission.getProblem().getId(), language);
            FunctionSignature functionSignature = problemService.getFunctionSignature(submission.getProblem().getId(), language);

            if (functionSignature == null) {
                log.error("Function signature is null for problem {} and language {}", submission.getProblem().getId(), language);
                throw new RuntimeException("Function signature not found for language: " + language);
            }
            log.info("Function signature: {}", functionSignature);

            String executionEnvironment = LANGUAGE_IMAGE_MAP.get(language); // Lấy tên image
            submission.setExecutionEnvironment(executionEnvironment);
            log.info("Using execution environment: {}", executionEnvironment);

            String extension = LANGUAGE_EXTENSION_MAP.get(language);
            String solutionFilePath = tempDir + "/Solution" + extension;
            Files.writeString(Paths.get(solutionFilePath), submission.getSourceCode());
            log.info("Written solution code to: {}", solutionFilePath);

            List<TestCaseService.TestCaseInput> inputs = testCaseService.parseInputData(testCase.getInputData());
            String inputFilePath = tempDir + "/input.txt";
            StringBuilder inputContent = new StringBuilder();
            for (TestCaseService.TestCaseInput input : inputs) {
                inputContent.append(input.getInput()).append("\n");
                log.info("Test input: {} (type: {})", input.getInput(), input.getDataType());
            }
            Files.writeString(Paths.get(inputFilePath), inputContent.toString());
            log.info("Written input to file: {}", inputFilePath);
            log.info("Input content: {}", inputContent.toString());

            String mainProgramPath = tempDir + "/Main" + extension;
            String mainProgramCode = generateMainProgram(language, functionSignature, inputs);
            Files.writeString(Paths.get(mainProgramPath), mainProgramCode);
            log.info("Generated main program file: {}", mainProgramPath);
            log.info("Main program code: \n{}", mainProgramCode);

            ExecutionResult executionResult = runInContainer(language, mainProgramPath, inputFilePath);
            log.info("Execution result - exit code: {}", executionResult.getExitCode());
            log.info("Execution result - output: '{}'", executionResult.getOutput());
            log.info("Execution result - error: '{}'", executionResult.getError());
            log.info("Execution result - runtime: {}ms", executionResult.getRuntimeMs());
            log.info("Execution result - memory: {}KB", executionResult.getMemoryUsedKb());

            // Thiết lập kết quả thực thi
            if (executionResult.getRuntimeMs() > 0) {
                result.setRuntimeMs((int) executionResult.getRuntimeMs());
            } else {
                log.warn("Runtime is zero or negative, setting a default value of 1");
                result.setRuntimeMs(1);
            }
            
            if (executionResult.getMemoryUsedKb() > 0) {
                result.setMemoryUsedKb((int) executionResult.getMemoryUsedKb());
            } else {
                log.warn("Memory usage is zero or negative, setting a default value of 1024");
                result.setMemoryUsedKb(1024);
            }

            if (executionResult.getExitCode() != 0 && !executionResult.getError().isEmpty()) {
                if (executionResult.getError().contains("compile")) {
                    log.error("Compile error: {}", executionResult.getError());
                    result.setStatus(TestCaseResult.TestCaseStatus.COMPILE_ERROR);
                    result.setErrorMessage(executionResult.getError());
                    submission.setCompileError(executionResult.getError());
                    submission.setStatus(Submission.SubmissionStatus.COMPILE_ERROR);
                    return result;
                } else {
                    log.error("Runtime error: {}", executionResult.getError());
                    result.setStatus(TestCaseResult.TestCaseStatus.RUNTIME_ERROR);
                    result.setErrorMessage(executionResult.getError());
                    return result;
                }
            }

            if (executionResult.getRuntimeMs() > testCase.getTimeLimit()) {
                log.warn("Time limit exceeded: {}ms > {}ms", executionResult.getRuntimeMs(), testCase.getTimeLimit());
                result.setStatus(TestCaseResult.TestCaseStatus.TIME_LIMIT_EXCEEDED);
                return result;
            }

            if (executionResult.getMemoryUsedKb() > testCase.getMemoryLimit()) {
                log.warn("Memory limit exceeded: {}KB > {}KB", executionResult.getMemoryUsedKb(), testCase.getMemoryLimit());
                result.setStatus(TestCaseResult.TestCaseStatus.MEMORY_LIMIT_EXCEEDED);
                return result;
            }

            TestCaseService.TestCaseOutput expectedOutput = testCaseService.parseExpectedOutput(testCase.getExpectedOutputData());
            String userOutput = executionResult.getOutput().trim();
            result.setUserOutput(userOutput);
            
            log.info("Comparing outputs:");
            log.info("User output: '{}' (length: {})", userOutput, userOutput.length());
            
            String expected = expectedOutput.getExpectedOutput().trim();
            log.info("Expected output: '{}' (length: {})", expected, expected.length());

            boolean isCorrect = compareOutput(userOutput, expected, testCase);
            log.info("Comparison result: {}", isCorrect ? "PASSED" : "FAILED");
            
            if (isCorrect) {
                result.setStatus(TestCaseResult.TestCaseStatus.PASSED);
                result.setScore(testCase.getWeight() != null ? testCase.getWeight() : 1.0);
            } else {
                result.setStatus(TestCaseResult.TestCaseStatus.FAILED);
                result.setScore(0.0);
            }

        } catch (Exception e) {
            log.error("Error running test case {} for submission {}: {}", testCase.getId(), submission.getId(), e.getMessage(), e);
            result.setStatus(TestCaseResult.TestCaseStatus.SYSTEM_ERROR);
            result.setErrorMessage(e.getMessage());
            result.setScore(0.0);
        } finally {
            try {
                Files.walk(Paths.get(tempDir))
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
                log.debug("Cleaned up temp directory: {}", tempDir);
            } catch (Exception e) {
                log.warn("Failed to clean up temp directory: {}", tempDir, e);
            }
        }

        log.info("Test case {} result: {}", testCase.getId(), result.getStatus());
        return result;
    }

    private String generateMainProgram(String language, FunctionSignature functionSignature, List<TestCaseService.TestCaseInput> inputs) {
        String functionName = functionSignature.getFunctionName();
        List<String> paramTypes = functionSignature.getParameterTypes();
        String returnType = functionSignature.getReturnType();
        String mainClassName = LANGUAGE_MAIN_CLASS_MAP.get(language);

        switch (language.toLowerCase()) {
            case "java":
                StringBuilder javaMain = new StringBuilder();
                javaMain.append("import java.util.Scanner;\n");
                javaMain.append("import java.util.Arrays;\n\n");
                javaMain.append("public class Main {\n");
                javaMain.append("    public static void main(String[] args) {\n");
                javaMain.append("        Scanner scanner = new Scanner(System.in);\n");

                StringBuilder paramList = new StringBuilder();
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i).toLowerCase();
                    String paramName = "param" + i;
                    switch (paramType) {
                        case "int[]":
                            // Parse array input like "[2,7,11,15]"
                            javaMain.append("        String ").append(paramName).append("Str = scanner.nextLine();\n");
                            javaMain.append("        ").append(paramName).append("Str = ").append(paramName).append("Str.replace(\"[\", \"\").replace(\"]\", \"\");\n");
                            javaMain.append("        String[] ").append(paramName).append("Parts = ").append(paramName).append("Str.split(\",\");\n");
                            javaMain.append("        int[] ").append(paramName).append(" = new int[").append(paramName).append("Parts.length];\n");
                            javaMain.append("        for (int i = 0; i < ").append(paramName).append("Parts.length; i++) {\n");
                            javaMain.append("            ").append(paramName).append("[i] = Integer.parseInt(").append(paramName).append("Parts[i].trim());\n");
                            javaMain.append("        }\n");
                            break;
                        case "string":
                            javaMain.append("        String ").append(paramName).append(" = scanner.nextLine();\n");
                            break;
                        case "int":
                            javaMain.append("        int ").append(paramName).append(" = Integer.parseInt(scanner.nextLine());\n");
                            break;
                        case "double":
                            javaMain.append("        double ").append(paramName).append(" = Double.parseDouble(scanner.nextLine());\n");
                            break;
                        default:
                            throw new UnsupportedOperationException("Unsupported parameter type in Java: " + paramType);
                    }
                    paramList.append(paramName);
                    if (i < paramTypes.size() - 1) paramList.append(", ");
                }

                javaMain.append("        ").append(mainClassName).append(" solution = new ").append(mainClassName).append("();\n");
                javaMain.append("        ").append(returnType).append(" result = solution.").append(functionName).append("(").append(paramList).append(");\n");

                // Handle output based on returnType
                if (returnType.toLowerCase().equals("int[]")) {
                    javaMain.append("        System.out.println(Arrays.toString(result).replace(\" \", \"\"));\n");
                } else {
                    javaMain.append("        System.out.println(result);\n");
                }
                javaMain.append("    }\n");
                javaMain.append("}\n");
                return javaMain.toString();

            case "python":
                StringBuilder pythonMain = new StringBuilder();
                pythonMain.append("from ").append(mainClassName).append(" import ").append(functionName).append("\n\n");

                StringBuilder paramListPy = new StringBuilder();
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i);
                    String paramName = "param" + i;
                    pythonMain.append(paramName).append(" = input().strip()\n");
                    switch (paramType.toLowerCase()) {
                        case "int":
                            pythonMain.append(paramName).append(" = int(").append(paramName).append(")\n");
                            break;
                        case "double":
                            pythonMain.append(paramName).append(" = float(").append(paramName).append(")\n");
                            break;
                    }
                    paramListPy.append(paramName);
                    if (i < paramTypes.size() - 1) paramListPy.append(", ");
                }

                pythonMain.append("result = ").append(functionName).append("(").append(paramListPy.toString()).append(")\n");
                pythonMain.append("print(result)\n");
                return pythonMain.toString();

            case "cpp":
                StringBuilder cppMain = new StringBuilder();
                cppMain.append("#include <iostream>\n");
                cppMain.append("#include <string>\n");
                cppMain.append("using namespace std;\n\n");
                cppMain.append("extern ").append(returnType).append(" ").append(functionName).append("(");
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i);
                    String paramName = "param" + i;
                    switch (paramType.toLowerCase()) {
                        case "string":
                            cppMain.append("string ").append(paramName);
                            break;
                        case "int":
                            cppMain.append("int ").append(paramName);
                            break;
                        case "double":
                            cppMain.append("double ").append(paramName);
                            break;
                        default:
                            throw new UnsupportedOperationException("Unsupported parameter type in C++: " + paramType);
                    }
                    if (i < paramTypes.size() - 1) cppMain.append(", ");
                }
                cppMain.append(");\n\n");

                cppMain.append("int main() {\n");

                StringBuilder paramListCpp = new StringBuilder();
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i);
                    String paramName = "param" + i;
                    switch (paramType.toLowerCase()) {
                        case "string":
                            cppMain.append("    string ").append(paramName).append(";\n");
                            cppMain.append("    getline(cin, ").append(paramName).append(");\n");
                            break;
                        case "int":
                            cppMain.append("    int ").append(paramName).append(";\n");
                            cppMain.append("    string line").append(i).append("; getline(cin, line").append(i).append("); ");
                            cppMain.append(paramName).append(" = stoi(line").append(i).append(");\n");
                            break;
                        case "double":
                            cppMain.append("    double ").append(paramName).append(";\n");
                            cppMain.append("    string line").append(i).append("; getline(cin, line").append(i).append("); ");
                            cppMain.append(paramName).append(" = stod(line").append(i).append(");\n");
                            break;
                    }
                    paramListCpp.append(paramName);
                    if (i < paramTypes.size() - 1) paramListCpp.append(", ");
                }

                cppMain.append("    ").append(returnType).append(" result = ").append(functionName).append("(").append(paramListCpp.toString()).append(");\n");
                cppMain.append("    cout << result << endl;\n");
                cppMain.append("    return 0;\n");
                cppMain.append("}\n");
                return cppMain.toString();

            case "javascript":
                StringBuilder jsMain = new StringBuilder();
                jsMain.append("const { ").append(functionName).append(" } = require('./").append(mainClassName).append("');\n");
                jsMain.append("const readline = require('readline');\n");
                jsMain.append("const rl = readline.createInterface({\n");
                jsMain.append("    input: process.stdin,\n");
                jsMain.append("    output: process.stdout,\n");
                jsMain.append("    terminal: false\n");
                jsMain.append("});\n\n");

                jsMain.append("let inputs = [];\n");
                jsMain.append("rl.on('line', (line) => {\n");
                jsMain.append("    inputs.push(line.trim());\n");
                jsMain.append("});\n\n");
                jsMain.append("rl.on('close', () => {\n");

                StringBuilder paramListJs = new StringBuilder();
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i);
                    String paramName = "param" + i;
                    jsMain.append("    let ").append(paramName).append(" = inputs[").append(i).append("];\n");
                    switch (paramType.toLowerCase()) {
                        case "int":
                            jsMain.append("    ").append(paramName).append(" = parseInt(").append(paramName).append(");\n");
                            break;
                        case "double":
                            jsMain.append("    ").append(paramName).append(" = parseFloat(").append(paramName).append(");\n");
                            break;
                    }
                    paramListJs.append(paramName);
                    if (i < paramTypes.size() - 1) paramListJs.append(", ");
                }

                jsMain.append("    let result = ").append(functionName).append("(").append(paramListJs.toString()).append(");\n");
                jsMain.append("    console.log(result);\n");
                jsMain.append("    process.exit(0);\n");
                jsMain.append("});\n");
                return jsMain.toString();

            default:
                throw new UnsupportedOperationException("Language not supported: " + language);
        }
    }

    private ExecutionResult runInContainer(String language, String codeFilePath, String inputFilePath) {
        ExecutionResult result = new ExecutionResult();
        String imageName = LANGUAGE_IMAGE_MAP.get(language);

        try {
            String containerName = "submission-" + UUID.randomUUID().toString();
            String dockerCommand = String.format(
                    "docker run --rm --name %s " +
                            "--memory=256m " +
                            "--cpus=1 " +
                            "--ulimit nofile=1024:1024 " +
                            "--network none " +
                            "-v %s:/app/code " +
                            "%s /app/code/Main%s /app/code/input.txt",
                    containerName, Paths.get(codeFilePath).getParent().toAbsolutePath(), imageName, LANGUAGE_EXTENSION_MAP.get(language)
            );
            log.info("Executing Docker command: {}", dockerCommand);

            // Log more Docker details
            log.debug("Container name: {}", containerName);
            log.debug("Mount path: {}", Paths.get(codeFilePath).getParent().toAbsolutePath());
            log.debug("Container path: /app/code/Main{}", LANGUAGE_EXTENSION_MAP.get(language));
            
            // Check if the main file exists
            File mainFile = new File(codeFilePath);
            log.debug("Main file exists: {}, size: {} bytes", mainFile.exists(), mainFile.length());
            
            // Check if the input file exists
            File inputFile = new File(inputFilePath);
            log.debug("Input file exists: {}, size: {} bytes", inputFile.exists(), inputFile.length());

            long startTime = System.currentTimeMillis();
            Process process = Runtime.getRuntime().exec(dockerCommand);

            StringBuilder output = new StringBuilder();
            StringBuilder error = new StringBuilder();

            try (BufferedReader outputReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = outputReader.readLine()) != null) {
                    log.debug("Docker stdout: {}", line);
                    output.append(line).append("\n");
                }
                while ((line = errorReader.readLine()) != null) {
                    log.debug("Docker stderr: {}", line);
                    error.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            long endTime = System.currentTimeMillis();

            result.setRuntimeMs(endTime - startTime);
            long memoryUsedKb = measureMemoryUsage(containerName);
            result.setMemoryUsedKb(memoryUsedKb);

            result.setOutput(output.toString());
            result.setError(error.toString());
            result.setExitCode(exitCode);

            log.info("Docker execution completed. Exit code: {}", exitCode);
            log.info("Runtime: {}ms, Memory usage: {}KB", result.getRuntimeMs(), result.getMemoryUsedKb());

        } catch (Exception e) {
            log.error("Error running container for language {}: {}", language, e.getMessage(), e);
            result.setError(e.getMessage());
            result.setExitCode(1);
        }

        return result;
    }

    private long measureMemoryUsage(String containerName) {
        try {
            Process process = Runtime.getRuntime().exec("docker stats --no-stream --format \"{{.MemUsage}}\" " + containerName);
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String memUsage = reader.readLine();
            log.info("Memory usage raw output: {}", memUsage);
            
            if (memUsage == null || memUsage.trim().isEmpty()) {
                log.warn("Empty memory usage output for container {}", containerName);
                return 0;
            }
            
            // Xử lý format như "10.5MiB / 100MiB"
            String used = memUsage.split("/")[0].trim();
            log.info("Extracted memory usage: {}", used);
            
            // Xử lý các đơn vị khác nhau
            if (used.endsWith("B")) {
                return extractMemoryInKB(used);
            } else if (used.endsWith("KiB")) {
                double kb = Double.parseDouble(used.replace("KiB", "").trim());
                return Math.round(kb);
            } else if (used.endsWith("MiB")) {
                double mb = Double.parseDouble(used.replace("MiB", "").trim());
                return Math.round(mb * 1024);
            } else if (used.endsWith("GiB")) {
                double gb = Double.parseDouble(used.replace("GiB", "").trim());
                return Math.round(gb * 1024 * 1024);
            } else {
                // Nếu không có đơn vị, coi là KB
                log.warn("Unknown memory format: {}, assuming KB", used);
                return Math.round(Double.parseDouble(used.trim()));
            }
        } catch (Exception e) {
            log.warn("Failed to measure memory usage for container {}: {}", containerName, e.getMessage());
            return 0;
        }
    }
    
    // Helper method to extract memory value in KB
    private long extractMemoryInKB(String memoryString) {
        try {
            if (memoryString.equals("0B")) {
                return 0;
            }
            
            if (memoryString.endsWith("B")) {
                double bytes = Double.parseDouble(memoryString.replace("B", "").trim());
                return Math.round(bytes / 1024.0);
            }
            
            return 0;
        } catch (Exception e) {
            log.warn("Failed to parse memory string {}: {}", memoryString, e.getMessage());
            return 0;
        }
    }

    private boolean compareOutput(String userOutput, String expectedOutput, TestCase testCase) {
        String comparisonMode = testCase.getComparisonMode() != null ? testCase.getComparisonMode() : "EXACT";
        Double epsilon = testCase.getEpsilon();

        log.debug("Using comparison mode: {}", comparisonMode);
        log.debug("Epsilon: {}", epsilon);
        log.debug("User output (hex): {}", bytesToHexString(userOutput.getBytes()));
        log.debug("Expected output (hex): {}", bytesToHexString(expectedOutput.getBytes()));

        switch (comparisonMode.toUpperCase()) {
            case "EXACT":
                boolean isEqual = userOutput.equals(expectedOutput);
                log.debug("EXACT comparison result: {}", isEqual);
                return isEqual;
            case "FLOAT":
                if (epsilon == null) epsilon = 1e-6;
                try {
                    double userValue = Double.parseDouble(userOutput);
                    double expectedValue = Double.parseDouble(expectedOutput);
                    boolean isWithinEpsilon = Math.abs(userValue - expectedValue) <= epsilon;
                    log.debug("FLOAT comparison: |{} - {}| = {} <= {}: {}", 
                        userValue, expectedValue, Math.abs(userValue - expectedValue), epsilon, isWithinEpsilon);
                    return isWithinEpsilon;
                } catch (NumberFormatException e) {
                    log.error("Error parsing float values: {}", e.getMessage());
                    return false;
                }
            case "IGNORE_WHITESPACE":
                boolean isEqualNoWhitespace = userOutput.replaceAll("\\s+", "")
                    .equals(expectedOutput.replaceAll("\\s+", ""));
                log.debug("IGNORE_WHITESPACE comparison result: {}", isEqualNoWhitespace);
                return isEqualNoWhitespace;
            default:
                log.debug("Using default EXACT comparison for unknown mode: {}", comparisonMode);
                return userOutput.equals(expectedOutput);
        }
    }

    // Helper method to convert bytes to hex string for better debugging
    private String bytesToHexString(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}