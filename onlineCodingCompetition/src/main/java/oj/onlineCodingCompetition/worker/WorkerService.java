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
            "cpp", "cpp-runner",
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

    @Transactional
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

                    // Thêm cơ chế retry với backoff để tìm submission
                    int maxRetries = 3;
                    int retryCount = 0;
                    Submission submission = null;

                    while (retryCount < maxRetries) {
                        try {
                            submission = submissionService.getSubmissionEntityById(submissionId);
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


                    // Cập nhật trạng thái thành PROCESSING
                    log.info("Processing submission {} with status: {}", submissionId, submission.getStatus());
                    submission.setStatus(Submission.SubmissionStatus.PROCESSING);
                    submissionService.updateSubmission(submission);
                    log.info("Submission {} set to PROCESSING", submissionId);

                    // Lấy Problem và User từ database
                    Long problemId = Long.valueOf(messageMap.get("problemId").toString());
                    Long userId = Long.valueOf(messageMap.get("userId").toString());
                    Problem problem = problemRepository.findById(problemId)
                            .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                    // Đảm bảo submission có thông tin đúng
                    submission.setProblem(problem);
                    submission.setUser(user);
                    submission.setLanguage((String) messageMap.get("language"));
                    submission.setSourceCode((String) messageMap.get("sourceCode"));

                    // Lấy test cases
                    List<TestCase> testCases = testCaseRepository.findByProblemIdOrderByTestOrderAsc(problem.getId());
                    int passedTestCases = 0;
                    double totalScore = 0.0;
                    boolean earlyStop = false;
                    long totalRuntimeMs = 0;
                    long totalMemoryUsedKb = 0;

                    List<TestCaseResult> testCaseResults = new ArrayList<>();

                    for (TestCase testCase : testCases) {
                        TestCaseResult result = runTestCase(submission, testCase);

                        totalRuntimeMs += result.getRuntimeMs();
                        totalMemoryUsedKb = Math.max(totalMemoryUsedKb, result.getMemoryUsedKb());

                        if (result.getStatus() == TestCaseResult.TestCaseStatus.PASSED) {
                            passedTestCases++;
                            totalScore += result.getScore() != null ? result.getScore() : 1.0;
                        } else {
                            earlyStop = true;
                            break;
                        }

                        log.debug("Saved test case result for test case {} in submission {}", testCase.getId(), submissionId);
                    }

                    // Tải lại submission để đảm bảo phiên bản mới nhất
                    submission = submissionService.getSubmissionEntityById(submissionId);
                    if (submission == null) {
                        log.error("Submission {} not found after processing test cases", submissionId);
                        continue;
                    }


                    // THAY ĐỔI: Lưu runtimeMs và memoryUsedKb vào submission
                    submission.setRuntimeMs((int) totalRuntimeMs);
                    submission.setMemoryUsedKb((int) totalMemoryUsedKb);


                    // Cập nhật kết quả cuối cùng
                    if (earlyStop) {
                        submission.setStatus(Submission.SubmissionStatus.WRONG_ANSWER);
                    } else {
                        submission.setStatus(passedTestCases == testCases.size() ?
                                Submission.SubmissionStatus.ACCEPTED : Submission.SubmissionStatus.WRONG_ANSWER);
                    }
                    submission.setPassedTestCases(passedTestCases);
                    submission.setTotalTestCases(testCases.size());
                    submission.setScore(totalScore);
                    submission.setCompletedAt(LocalDateTime.now());
                    log.info("Final submission status: {}, passed: {}, total: {}, score: {}",
                            submission.getStatus(), passedTestCases, testCases.size(), totalScore);
                    submissionService.updateSubmission(submission);

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



    private TestCaseResult runTestCase(Submission submission, TestCase testCase) {
        TestCaseResult result = new TestCaseResult();
        result.setSubmission(submission);
        result.setTestCase(testCase);
        result.setIsHidden(testCase.getIsHidden());

        // Khởi tạo compileError mặc định
        submission.setCompileError("");

        String tempDir = "/tmp/submission-" + UUID.randomUUID().toString();
        try {
            Files.createDirectories(Paths.get(tempDir));

            String language = submission.getLanguage().toLowerCase();

            log.debug("Fetching function signature for problem {} and language {}", submission.getProblem().getId(), language);
            FunctionSignature functionSignature = problemService.getFunctionSignature(submission.getProblem().getId(), language);

            if (functionSignature == null) {
                throw new RuntimeException("Function signature not found for language: " + language);
            }

            String executionEnvironment = LANGUAGE_IMAGE_MAP.get(language); // Lấy tên image
            submission.setExecutionEnvironment(executionEnvironment);

            String extension = LANGUAGE_EXTENSION_MAP.get(language);
            String solutionFilePath = tempDir + "/Solution" + extension;
            Files.writeString(Paths.get(solutionFilePath), submission.getSourceCode());

            List<TestCaseService.TestCaseInput> inputs = testCaseService.parseInputData(testCase.getInputData());
            String inputFilePath = tempDir + "/input.txt";
            StringBuilder inputContent = new StringBuilder();
            for (TestCaseService.TestCaseInput input : inputs) {
                inputContent.append(input.getInput()).append("\n");
            }
            Files.writeString(Paths.get(inputFilePath), inputContent.toString());

            String mainProgramPath = tempDir + "/Main" + extension;
            String mainProgramCode = generateMainProgram(language, functionSignature, inputs);
            Files.writeString(Paths.get(mainProgramPath), mainProgramCode);

            ExecutionResult executionResult = runInContainer(language, mainProgramPath, inputFilePath);

            result.setRuntimeMs((int) executionResult.getRuntimeMs());
            result.setMemoryUsedKb((int) executionResult.getMemoryUsedKb());

            if (executionResult.getExitCode() != 0 && !executionResult.getError().isEmpty()) {
                if (executionResult.getError().contains("compile")) {
                    result.setStatus(TestCaseResult.TestCaseStatus.COMPILE_ERROR);
                    result.setErrorMessage(executionResult.getError());
                    submission.setCompileError(executionResult.getError());
                    submission.setStatus(Submission.SubmissionStatus.COMPILE_ERROR);
//                    submissionService.updateSubmission(submission);
                    return result;
                } else {
                    result.setStatus(TestCaseResult.TestCaseStatus.RUNTIME_ERROR);
                    result.setErrorMessage(executionResult.getError());
                    return result;
                }
            }

            if (executionResult.getRuntimeMs() > testCase.getTimeLimit()) {
                result.setStatus(TestCaseResult.TestCaseStatus.TIME_LIMIT_EXCEEDED);
                return result;
            }

            if (executionResult.getMemoryUsedKb() > testCase.getMemoryLimit()) {
                result.setStatus(TestCaseResult.TestCaseStatus.MEMORY_LIMIT_EXCEEDED);
                return result;
            }

            TestCaseService.TestCaseOutput expectedOutput = testCaseService.parseExpectedOutput(testCase.getExpectedOutputData());
            String userOutput = executionResult.getOutput().trim();
            result.setUserOutput(userOutput);

            String expected = expectedOutput.getExpectedOutput().trim();
            if (compareOutput(userOutput, expected, testCase)) {
                result.setStatus(TestCaseResult.TestCaseStatus.PASSED);
                result.setScore(testCase.getWeight() != null ? testCase.getWeight() : 1.0);
            } else {
                result.setStatus(TestCaseResult.TestCaseStatus.FAILED);
                result.setScore(0.0);
            }

        } catch (Exception e) {
            log.error("Error running test case {} for submission {}: {}", testCase.getId(), submission.getId(), e.getMessage());
            result.setStatus(TestCaseResult.TestCaseStatus.SYSTEM_ERROR);
            result.setErrorMessage(e.getMessage());
            result.setScore(0.0);
        } finally {
            try {
                Files.walk(Paths.get(tempDir))
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (Exception e) {
                log.warn("Failed to clean up temp directory: {}", tempDir, e);
            }
        }

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
                javaMain.append("import java.util.Scanner;\n\n");
                javaMain.append("public class Main {\n");
                javaMain.append("    public static void main(String[] args) {\n");
                javaMain.append("        Scanner scanner = new Scanner(System.in);\n");

                StringBuilder paramList = new StringBuilder();
                for (int i = 0; i < paramTypes.size(); i++) {
                    String paramType = paramTypes.get(i);
                    String paramName = "param" + i;
                    switch (paramType.toLowerCase()) {
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
                javaMain.append("        ").append(returnType).append(" result = solution.").append(functionName).append("(").append(paramList.toString()).append(");\n");
                javaMain.append("        System.out.println(result);\n");
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

            long startTime = System.currentTimeMillis();
            Process process = Runtime.getRuntime().exec(dockerCommand);

            StringBuilder output = new StringBuilder();
            StringBuilder error = new StringBuilder();

            try (BufferedReader outputReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String line;
                while ((line = outputReader.readLine()) != null) {
                    output.append(line).append("\n");
                }
                while ((line = errorReader.readLine()) != null) {
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

        } catch (Exception e) {
            log.error("Error running container for language {}: {}", language, e.getMessage());
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
            if (memUsage != null) {
                String used = memUsage.split("/")[0].trim();
                if (used.endsWith("MiB")) {
                    double mb = Double.parseDouble(used.replace("MiB", "").trim());
                    return (long) (mb * 1024);
                } else if (used.endsWith("GiB")) {
                    double gb = Double.parseDouble(used.replace("GiB", "").trim());
                    return (long) (gb * 1024 * 1024);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to measure memory usage for container {}: {}", containerName, e.getMessage());
        }
        return 0;
    }

    private boolean compareOutput(String userOutput, String expectedOutput, TestCase testCase) {
        String comparisonMode = testCase.getComparisonMode() != null ? testCase.getComparisonMode() : "EXACT";
        Double epsilon = testCase.getEpsilon();

        switch (comparisonMode.toUpperCase()) {
            case "EXACT":
                return userOutput.equals(expectedOutput);
            case "FLOAT":
                if (epsilon == null) epsilon = 1e-6;
                try {
                    double userValue = Double.parseDouble(userOutput);
                    double expectedValue = Double.parseDouble(expectedOutput);
                    return Math.abs(userValue - expectedValue) <= epsilon;
                } catch (NumberFormatException e) {
                    return false;
                }
            case "IGNORE_WHITESPACE":
                return userOutput.replaceAll("\\s+", "").equals(expectedOutput.replaceAll("\\s+", ""));
            default:
                return userOutput.equals(expectedOutput);
        }

    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateSubmissionStatus(Long submissionId, Submission.SubmissionStatus status) {
        Submission submission = submissionService.getSubmissionEntityById(submissionId);
        submission.setStatus(status);
        submissionService.updateSubmission(submission);
    }
}