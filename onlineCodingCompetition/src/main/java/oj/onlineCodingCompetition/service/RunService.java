package oj.onlineCodingCompetition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.RunCodeDTO;
import oj.onlineCodingCompetition.dto.RunCodeResultDTO;
import oj.onlineCodingCompetition.dto.TestCaseRunResultDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.worker.WorkerService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * Service for executing code submissions in isolated environments.
 * Service thực thi mã nguồn trong môi trường độc lập.
 *
 * Main features / Tính năng chính:
 * - Code execution in Docker / Thực thi code trong Docker
 * - Resource monitoring / Giám sát tài nguyên
 * - Security isolation / Cách ly bảo mật
 * - Multiple language support / Hỗ trợ nhiều ngôn ngữ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RunService {
    
    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestCaseService testCaseService;
    private final ObjectMapper objectMapper;
    
    // Shared volume name for backend <-> runner file exchange (mounted at /app/temp in backend, /app/code in runners)
    @Value("${docker.shared-volume:occs_temp}")
    private String sharedVolumeName;
    
    /**
     * Maps programming languages to Docker images
     * Ánh xạ ngôn ngữ lập trình với Docker image
     */
    private static final Map<String, String> LANGUAGE_IMAGE_MAP = Map.of(
            "java", "java-runner",
            "python", "python-runner",
            "cpp", "cpp-runner",
            "javascript", "js-runner"
    );

    /**
     * Maps programming languages to file extensions
     * Ánh xạ ngôn ngữ lập trình với phần mở rộng file
     */
    private static final Map<String, String> LANGUAGE_EXTENSION_MAP = Map.of(
            "java", ".java",
            "python", ".py",
            "cpp", ".cpp",
            "javascript", ".js"
    );

    /**
     * Maps programming languages to main class/file names
     * Ánh xạ ngôn ngữ lập trình với tên file/class chính
     */
    private static final Map<String, String> LANGUAGE_MAIN_CLASS_MAP = Map.of(
            "java", "Solution",
            "python", "solution",
            "cpp", "solution",
            "javascript", "solution"
    );
    
    /**
     * DTO for scratch pad code execution
     * DTO cho thực thi code trực tiếp
     */
    public static class ScratchCodeDTO {
        private String code;
        private String language;
        private String input;
        
        // Getters and setters
        public String getCode() {
            return code;
        }
        
        public void setCode(String code) {
            this.code = code;
        }
        
        public String getLanguage() {
            return language;
        }
        
        public void setLanguage(String language) {
            this.language = language;
        }
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
    }
    
    /**
     * DTO for scratch pad execution results
     * DTO cho kết quả thực thi code trực tiếp
     */
    public static class ScratchResultDTO {
        private String status;
        private String output;
        private String errorMessage;
        private Integer runtime;
        private Integer memory;
        
        public ScratchResultDTO() {
        }
        
        public ScratchResultDTO(String status, String output, String errorMessage, Integer runtime, Integer memory) {
            this.status = status;
            this.output = output;
            this.errorMessage = errorMessage;
            this.runtime = runtime;
            this.memory = memory;
        }
        
        // Getters and setters
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getOutput() {
            return output;
        }
        
        public void setOutput(String output) {
            this.output = output;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public void setErrorMessage(String errorMessage) {
            this.errorMessage = errorMessage;
        }
        
        public Integer getRuntime() {
            return runtime;
        }
        
        public void setRuntime(Integer runtime) {
            this.runtime = runtime;
        }
        
        public Integer getMemory() {
            return memory;
        }
        
        public void setMemory(Integer memory) {
            this.memory = memory;
        }
    }
    
    /**
     * Executes code in scratch pad mode
     * Thực thi code ở chế độ thử nghiệm
     * 
     * Features / Tính năng:
     * - Direct code execution / Thực thi code trực tiếp
     * - Resource limits / Giới hạn tài nguyên
     * - Error handling / Xử lý lỗi
     */
    public ScratchResultDTO runScratchCode(ScratchCodeDTO scratchCodeDTO) {
        try {
            // Write scratch files into shared named volume mounted in backend at /app/temp
            // Runner will mount the same volume at /app/code
            String baseTempDirPath = "/app/temp"; // inside backend container (shared named volume)
            // Create an isolated subdirectory to avoid cross-run interference
            String subDirName = "scratch_" + UUID.randomUUID().toString().replace("-", "");
            Path tempDir = Paths.get(baseTempDirPath, subDirName);
            Files.createDirectories(tempDir);
            
            try {
                // Save source code to file
                String language = scratchCodeDTO.getLanguage();
                String extension = LANGUAGE_EXTENSION_MAP.getOrDefault(language, ".txt");
                
                // For C++ specifically, use Main.cpp instead of solution.cpp
                String filename = "solution";
                if ("cpp".equals(language)) {
                    filename = "Main";
                }
                
                File sourceFile = new File(tempDir.toString(), filename + extension);
                try (BufferedWriter writer = new BufferedWriter(new FileWriter(sourceFile))) {
                    writer.write(scratchCodeDTO.getCode());
                }
                
                // Save input to file
                File inputFile = new File(tempDir.toString(), "input.txt");
                try (BufferedWriter writer = new BufferedWriter(new FileWriter(inputFile))) {
                    writer.write(scratchCodeDTO.getInput());
                }
                
                // Run Docker container
                ProcessBuilder pb;
                String containerName = "scratch_" + UUID.randomUUID().toString().replace("-", "");
                String imageToUse = LANGUAGE_IMAGE_MAP.getOrDefault(language, "java-runner");
                
                // Mount the shared named volume at /app/code in the runner. EntryPoint will compile from /app/code
                pb = new ProcessBuilder(
                        "docker", "run", "--name", containerName, "-m", "1024m", "--cpus=1",
                        "-v", sharedVolumeName + ":/app/code",
                        imageToUse, "scratch", subDirName
                );
                
                pb.redirectErrorStream(true);
                Process process = pb.start();
                
                // Read output
                String output = new String(process.getInputStream().readAllBytes());
                int exitCode = process.waitFor();
                
                // Measure memory usage
                long memoryUsedKb = measureMemoryUsage(containerName);
                
                // Clean up container
                new ProcessBuilder("docker", "rm", "-f", containerName).start().waitFor();
                
                ScratchResultDTO result = new ScratchResultDTO();
                
                if (exitCode != 0) {
                    // If exit code is not 0, there was an error
                    if (output.toLowerCase().contains("compilation failed") || 
                        output.toLowerCase().contains("syntaxerror") ||
                        output.toLowerCase().contains("compile error")) {
                        
                        result.setStatus("COMPILE_ERROR");
                        result.setErrorMessage(output);
                    } else {
                        result.setStatus("ERROR");
                        // Check if error is OOM
                        if (output.toLowerCase().contains("out of memory") || 
                            output.toLowerCase().contains("oom") || 
                            output.toLowerCase().contains("fatal process oom")) {
                            result.setErrorMessage("Vượt quá giới hạn bộ nhớ cho phép. Vui lòng tối ưu code của bạn.");
                        } else {
                            result.setErrorMessage("Runtime error: " + output);
                        }
                    }
                    result.setRuntime(0);
                    result.setMemory((int) memoryUsedKb);
                    return result;
                }
                
                // Parse JSON from output - for scratch mode, expect direct output
                try {
                    // First try to parse as JSON (for backward compatibility)
                    Map<String, Object> outputMap = objectMapper.readValue(output, Map.class);
                    String userOutput = (String) outputMap.get("output");
                    int runtimeMs = (Integer) outputMap.getOrDefault("runtime_ms", 0);
                    
                    result.setStatus("SUCCESS");
                    result.setOutput(userOutput);
                    result.setRuntime(runtimeMs);
                    result.setMemory((int) memoryUsedKb);
                } catch (Exception e) {
                    // If not JSON, assume it's direct output
                    result.setStatus("SUCCESS");
                    result.setOutput(output);
                    result.setRuntime(0); // Runtime measurement will require updates to runners
                    result.setMemory((int) memoryUsedKb);
                }
                
                return result;
                
            } finally {
                // Clean up the per-run temp directory
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (Exception e) {
                    log.error("Error cleaning up temp directory: {}", e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Error running scratch code: {}", e.getMessage(), e);
            return new ScratchResultDTO("ERROR", null, 
                    "System error: " + e.getMessage(), 0, 0);
        }
    }
    
    /**
     * Executes code against test cases
     * Thực thi code với các test case
     * 
     * Process / Quy trình:
     * 1. Setup environment / Chuẩn bị môi trường
     * 2. Run test cases / Chạy test case
     * 3. Collect results / Thu thập kết quả
     */
    public RunCodeResultDTO runCode(RunCodeDTO runCodeDTO) {
        try {
            Problem problem = problemRepository.findById(runCodeDTO.getProblemId())
                    .orElseThrow(() -> new RuntimeException("Problem not found: " + runCodeDTO.getProblemId()));
            
            List<TestCase> testCases;
            if (runCodeDTO.getTestCaseIds() != null && !runCodeDTO.getTestCaseIds().isEmpty()) {
                testCases = testCaseRepository.findAllById(runCodeDTO.getTestCaseIds());
            } else {
                // Nếu không cung cấp test case IDs, sử dụng các example test cases
                testCases = testCaseRepository.findByProblemIdAndIsExampleTrueOrderByTestOrderAsc(runCodeDTO.getProblemId());
            }
            
            if (testCases.isEmpty()) {
                return new RunCodeResultDTO("ERROR", Collections.emptyList(), 
                        "No test cases found", 0, 0);
            }
            
            RunCodeResultDTO result = new RunCodeResultDTO();
            result.setStatus("SUCCESS");
            List<TestCaseRunResultDTO> testResults = new ArrayList<>();
            
            // Tạo directory tạm cho việc compile và chạy code
            String tempDirPath = System.getProperty("java.io.tmpdir") + "/run_" + UUID.randomUUID();
            Path tempDir = Files.createDirectory(Paths.get(tempDirPath));
            
            try {
                // Lưu source code vào file
                String extension = LANGUAGE_EXTENSION_MAP.getOrDefault(runCodeDTO.getLanguage(), ".txt");
                String mainClass = LANGUAGE_MAIN_CLASS_MAP.getOrDefault(runCodeDTO.getLanguage(), "solution");
                File sourceFile = new File(tempDirPath, mainClass + extension);
                try (BufferedWriter writer = new BufferedWriter(new FileWriter(sourceFile))) {
                    writer.write(runCodeDTO.getSourceCode());
                }
                
                // Xử lý từng test case
                int totalRuntime = 0;
                int maxMemory = 0;
                
                for (TestCase testCase : testCases) {
                    TestCaseRunResultDTO testResult = runSingleTestCase(
                            testCase, tempDirPath, sourceFile.getAbsolutePath(), runCodeDTO.getLanguage(), problem);
                    testResults.add(testResult);
                    
                    // Cộng dồn runtime và lấy max memory
                    totalRuntime += testResult.getRuntime() != null ? testResult.getRuntime() : 0;
                    maxMemory = Math.max(maxMemory, testResult.getMemory() != null ? testResult.getMemory() : 0);
                    
                    // Nếu gặp lỗi compile, dừng lại luôn
                    if ("COMPILE_ERROR".equals(testResult.getStatus())) {
                        result.setStatus("COMPILE_ERROR");
                        result.setCompileError(testResult.getErrorMessage());
                        break;
                    }
                }
                
                // Tính trung bình runtime nếu có nhiều test case
                if (!testResults.isEmpty()) {
                    totalRuntime /= testResults.size();
                }
                
                result.setResults(testResults);
                result.setRuntime(totalRuntime);
                result.setMemory(maxMemory);
                
                return result;
                
            } finally {
                // Xóa thư mục tạm khi đã xong
                try {
                    Files.walk(tempDir)
                            .sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                } catch (Exception e) {
                    log.error("Error cleaning up temp directory: {}", e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Error running code: {}", e.getMessage(), e);
            return new RunCodeResultDTO("ERROR", Collections.emptyList(), 
                    "System error: " + e.getMessage(), 0, 0);
        }
    }
    
    /**
     * Runs a single test case
     * Thực thi một test case
     * 
     * Steps / Các bước:
     * 1. Prepare input / Chuẩn bị đầu vào
     * 2. Execute code / Thực thi code
     * 3. Validate output / Kiểm tra đầu ra
     */
    private TestCaseRunResultDTO runSingleTestCase(
            TestCase testCase, String tempDirPath, String sourceFilePath, String language, Problem problem) {
        
        TestCaseRunResultDTO result = new TestCaseRunResultDTO();
        result.setTestCaseId(testCase.getId());
        
        try {
            // Chuyển đổi input data từ JSON format thành dữ liệu có thể đọc được
            List<TestCaseService.TestCaseInput> inputs = 
                    testCaseService.parseInputData(testCase.getInputData());
            String inputStr = objectMapper.writeValueAsString(inputs);
            
            // Lưu input vào file
            File inputFile = new File(tempDirPath, "input.json");
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(inputFile))) {
                writer.write(inputStr);
            }
            
            // Gọi Docker để chạy code
            ProcessBuilder pb;
            String containerName = "run_" + UUID.randomUUID().toString().replace("-", "");
            
            String imageToUse = LANGUAGE_IMAGE_MAP.getOrDefault(language, "java-runner");
            
            pb = new ProcessBuilder(
                    "docker", "run", "--name", containerName, "-m", "1024m", "--cpus=1", 
                    "-v", sourceFilePath + ":/app/solution" + LANGUAGE_EXTENSION_MAP.getOrDefault(language, ".txt"), 
                    "-v", inputFile.getAbsolutePath() + ":/app/input.json",
                    imageToUse
            );
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // Đọc output từ process
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            
            // Đọc memory usage từ container
            long memoryUsedKb = measureMemoryUsage(containerName);
            
            // Xóa container sau khi chạy xong
            new ProcessBuilder("docker", "rm", "-f", containerName).start().waitFor();
            
            if (exitCode != 0) {
                // Nếu exit code không phải 0, có lỗi
                if (output.toLowerCase().contains("compilation failed") || 
                    output.toLowerCase().contains("syntaxerror") ||
                    output.toLowerCase().contains("compile error")) {
                    
                    result.setStatus("COMPILE_ERROR");
                    result.setErrorMessage(output);
                    return result;
                } else {
                    result.setStatus("ERROR");
                    // Kiểm tra nếu lỗi là OOM
                    if (output.toLowerCase().contains("out of memory") || 
                        output.toLowerCase().contains("oom") || 
                        output.toLowerCase().contains("fatal process oom")) {
                        result.setErrorMessage("Runtime error: Vượt quá giới hạn bộ nhớ cho phép. Vui lòng tối ưu code của bạn.");
                    } else {
                        result.setErrorMessage("Runtime error: " + output);
                    }
                    result.setRuntime(0);
                    result.setMemory((int) memoryUsedKb);
                    return result;
                }
            }
            
            // Parse JSON từ output
            Map<String, Object> outputMap = objectMapper.readValue(output, Map.class);
            String userOutput = (String) outputMap.get("output");
            int runtimeMs = (Integer) outputMap.getOrDefault("runtime_ms", 0);
            
            // So sánh kết quả với expected output
            String expectedOutput = objectMapper.readValue(testCase.getExpectedOutputData(), Map.class)
                    .get("expectedOutput").toString();
            
            boolean passed = compareOutputs(userOutput, expectedOutput, testCase);
            
            result.setInput(inputStr);
            result.setExpectedOutput(expectedOutput);
            result.setActualOutput(userOutput);
            result.setStatus(passed ? "PASSED" : "FAILED");
            result.setRuntime(runtimeMs);
            result.setMemory((int) memoryUsedKb);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error running test case {}: {}", testCase.getId(), e.getMessage(), e);
            result.setStatus("ERROR");
            result.setErrorMessage("System error: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * Measures Docker container memory usage
     * Đo lường bộ nhớ sử dụng của container Docker
     * 
     * Units / Đơn vị:
     * - Input: B/KiB/MiB/GiB
     * - Output: KB
     */
    private long measureMemoryUsage(String containerName) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "stats", containerName, "--no-stream", "--format", "{{.MemUsage}}"
            );
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            process.waitFor();
            
            // Parse memory usage (format: 10.4MiB / 512MiB)
            String memUsage = output.trim();
            String[] parts = memUsage.split("/")[0].trim().split(" ");
            double value = Double.parseDouble(parts[0]);
            String unit = parts[1].toUpperCase();
            
            // Convert to KB
            switch (unit) {
                case "B":
                    return (long) value / 1024;
                case "KIB":
                case "KB":
                    return (long) value;
                case "MIB":
                case "MB":
                    return (long) (value * 1024);
                case "GIB":
                case "GB":
                    return (long) (value * 1024 * 1024);
                default:
                    return 0;
            }
        } catch (Exception e) {
            log.error("Error measuring memory usage: {}", e.getMessage());
            return 0;
        }
    }
    
    /**
     * Compares outputs with different comparison modes
     * So sánh kết quả với các chế độ khác nhau
     * 
     * Modes / Chế độ:
     * - EXACT: Exact match / Khớp chính xác
     * - FLOAT: With epsilon / Với sai số
     * - IGNORE_WHITESPACE: Ignore spaces / Bỏ qua khoảng trắng
     */
    private boolean compareOutputs(String userOutput, String expectedOutput, TestCase testCase) {
        if (userOutput == null && expectedOutput == null) return true;
        if (userOutput == null || expectedOutput == null) return false;
        
        String comparisonMode = testCase.getComparisonMode();
        if (comparisonMode == null) comparisonMode = "EXACT";
        
        switch (comparisonMode) {
            case "FLOAT":
                try {
                    double userVal = Double.parseDouble(userOutput.trim());
                    double expectedVal = Double.parseDouble(expectedOutput.trim());
                    double epsilon = testCase.getEpsilon() != null ? testCase.getEpsilon() : 1e-6;
                    return Math.abs(userVal - expectedVal) <= epsilon;
                } catch (NumberFormatException e) {
                    return false;
                }
            case "IGNORE_WHITESPACE":
                return userOutput.trim().replaceAll("\\s+", " ")
                        .equals(expectedOutput.trim().replaceAll("\\s+", " "));
            case "EXACT":
            default:
                return userOutput.equals(expectedOutput);
        }
    }
} 