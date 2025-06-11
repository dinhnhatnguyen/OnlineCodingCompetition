package oj.onlineCodingCompetition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing test cases in the system.
 * Service quản lý các test case trong hệ thống.
 *
 * Main features / Tính năng chính:
 * - Test case CRUD operations / Thao tác CRUD cho test case
 * - Input/Output parsing / Xử lý đầu vào/đầu ra
 * - Test case validation / Kiểm tra tính hợp lệ
 * - Example test case management / Quản lý test case mẫu
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;
    private final ObjectMapper objectMapper;

    /**
     * Data class for test case input
     * Class dữ liệu cho đầu vào test case
     */
    @Data
    public static class TestCaseInput {
        private String input;      // Input value / Giá trị đầu vào
        private String dataType;   // Data type / Kiểu dữ liệu
    }

    /**
     * Data class for test case output
     * Class dữ liệu cho đầu ra test case
     */
    @Data
    public static class TestCaseOutput {
        private String expectedOutput;  // Expected output / Đầu ra mong đợi
        private String dataType;        // Data type / Kiểu dữ liệu
    }

    /**
     * Parses input data from JSON format
     * Phân tích dữ liệu đầu vào từ định dạng JSON
     */
    public List<TestCaseInput> parseInputData(String inputDataJson) {
        try {
            return objectMapper.readValue(inputDataJson, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, TestCaseInput.class));
        } catch (Exception e) {
            log.error("Error parsing inputData JSON: {}", inputDataJson, e);
            throw new RuntimeException("Failed to parse inputData", e);
        }
    }

    /**
     * Parses expected output from JSON format
     * Phân tích dữ liệu đầu ra mong đợi từ định dạng JSON
     */
    public TestCaseOutput parseExpectedOutput(String expectedOutputJson) {
        try {
            return objectMapper.readValue(expectedOutputJson, TestCaseOutput.class);
        } catch (Exception e) {
            log.error("Error parsing expectedOutputData JSON: {}", expectedOutputJson, e);
            throw new RuntimeException("Failed to parse expectedOutputData", e);
        }
    }

    /**
     * Converts TestCase entity to DTO
     * Chuyển đổi entity TestCase sang DTO
     */
    public TestCaseDTO convertToDTO(TestCase testCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setId(testCase.getId());
        dto.setProblemId(testCase.getProblem().getId());
        dto.setInputData(testCase.getInputData());
        dto.setExpectedOutputData(testCase.getExpectedOutputData());
        dto.setInputType(testCase.getInputType());
        dto.setOutputType(testCase.getOutputType());
        dto.setDescription(testCase.getDescription());
        dto.setDependsOn(testCase.getDependsOn());
        dto.setIsExample(testCase.getIsExample());
        dto.setIsHidden(testCase.getIsHidden());
        dto.setTimeLimit(testCase.getTimeLimit());
        dto.setMemoryLimit(testCase.getMemoryLimit());
        dto.setWeight(testCase.getWeight());
        dto.setTestOrder(testCase.getTestOrder());
        dto.setComparisonMode(testCase.getComparisonMode());
        dto.setEpsilon(testCase.getEpsilon());
        return dto;
    }

    private TestCase convertToEntity(TestCaseDTO dto, Problem problem) {
        TestCase testCase = new TestCase();
        testCase.setId(dto.getId());
        testCase.setProblem(problem);
        testCase.setInputData(dto.getInputData());
        testCase.setExpectedOutputData(dto.getExpectedOutputData());
        testCase.setInputType(dto.getInputType());
        testCase.setOutputType(dto.getOutputType());
        testCase.setDescription(dto.getDescription());
        testCase.setDependsOn(dto.getDependsOn());
        testCase.setIsExample(dto.getIsExample() != null ? dto.getIsExample() : false);
        testCase.setIsHidden(dto.getIsHidden() != null ? dto.getIsHidden() : false);
        testCase.setTimeLimit(dto.getTimeLimit() != null ? dto.getTimeLimit() : 1000);
        testCase.setMemoryLimit(dto.getMemoryLimit() != null ? dto.getMemoryLimit() : 262144);
        testCase.setWeight(dto.getWeight());
        testCase.setTestOrder(dto.getTestOrder() != null ? dto.getTestOrder() : 0);
        testCase.setComparisonMode(dto.getComparisonMode());
        testCase.setEpsilon(dto.getEpsilon());
        return testCase;
    }

    /**
     * Creates a new test case
     * Tạo mới test case
     * 
     * @param testCaseDTO Test case data / Dữ liệu test case
     * @return Created test case / Test case đã tạo
     */
    @Transactional
    public TestCaseDTO createTestCase(TestCaseDTO testCaseDTO) {
        log.debug("Creating test case for problem ID: {}", testCaseDTO.getProblemId());
        Problem problem = problemRepository.findById(testCaseDTO.getProblemId())
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", testCaseDTO.getProblemId());
                    return new EntityNotFoundException("Problem not found: " + testCaseDTO.getProblemId());
                });
        TestCase testCase = convertToEntity(testCaseDTO, problem);
        TestCase savedTestCase = testCaseRepository.save(testCase);
        log.info("Test case created successfully with ID: {}", savedTestCase.getId());
        return convertToDTO(savedTestCase);
    }

    /**
     * Updates an existing test case
     * Cập nhật test case đã tồn tại
     * 
     * @param id Test case ID / ID test case
     * @param testCaseDTO Updated data / Dữ liệu cập nhật
     */
    @Transactional
    public TestCaseDTO updateTestCase(Long id, TestCaseDTO testCaseDTO) {
        log.debug("Updating test case with ID: {}", id);
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Test case not found with ID: {}", id);
                    return new EntityNotFoundException("Test case not found: " + id);
                });
        Problem problem = problemRepository.findById(testCaseDTO.getProblemId())
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", testCaseDTO.getProblemId());
                    return new EntityNotFoundException("Problem not found: " + testCaseDTO.getProblemId());
                });
        TestCase updatedTestCase = convertToEntity(testCaseDTO, problem);
        updatedTestCase.setId(id);
        TestCase savedTestCase = testCaseRepository.save(updatedTestCase);
        log.info("Test case updated successfully with ID: {}", savedTestCase.getId());
        return convertToDTO(savedTestCase);
    }

    /**
     * Gets all test cases for a problem
     * Lấy tất cả test case của một bài toán
     * 
     * @param problemId Problem ID / ID bài toán
     */
    @Transactional(readOnly = true)
    public List<TestCaseDTO> getAllTestCasesByProblemId(Long problemId) {
        log.debug("Fetching all test cases for problem ID: {}", problemId);
        return testCaseRepository.findByProblemIdOrderByTestOrderAsc(problemId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets example test cases for a problem
     * Lấy các test case mẫu của một bài toán
     */
    @Transactional(readOnly = true)
    public List<TestCaseDTO> getExampleTestCasesByProblemId(Long problemId) {
        log.debug("Fetching example test cases for problem ID: {}", problemId);
        return testCaseRepository.findByProblemIdAndIsExampleTrueOrderByTestOrderAsc(problemId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets visible (non-hidden) test cases
     * Lấy các test case hiển thị (không ẩn)
     */
    @Transactional(readOnly = true)
    public List<TestCaseDTO> getVisibleTestCasesByProblemId(Long problemId) {
        log.debug("Fetching visible test cases for problem ID: {}", problemId);
        return testCaseRepository.findByProblemIdAndIsHiddenFalseOrderByTestOrderAsc(problemId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestCaseDTO getTestCaseById(Long id) {
        log.debug("Fetching test case by ID: {}", id);
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Test case not found with ID: {}", id);
                    return new EntityNotFoundException("Test case not found with id: " + id);
                });
        return convertToDTO(testCase);
    }

    /**
     * Creates multiple test cases for a problem
     * Tạo nhiều test case cho một bài toán
     * 
     * @param testCaseDTOs List of test cases / Danh sách test case
     * @param problemId Problem ID / ID bài toán
     */
    @Transactional
    public List<TestCaseDTO> createTestCases(List<TestCaseDTO> testCaseDTOs, Long problemId) {
        log.debug("Creating {} test cases for problem ID: {}", testCaseDTOs.size(), problemId);
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", problemId);
                    return new EntityNotFoundException("Problem not found with id: " + problemId);
                });

        List<TestCase> testCasesToSave = testCaseDTOs.stream()
                .map(dto -> {
                    dto.setProblemId(problemId);
                    return convertToEntity(dto, problem);
                })
                .collect(Collectors.toList());

        List<TestCase> savedTestCases = testCaseRepository.saveAll(testCasesToSave);
        log.info("Successfully created {} test cases for problem ID: {}", savedTestCases.size(), problemId);

        return savedTestCases.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTestCase(Long id) {
        log.debug("Deleting test case with ID: {}", id);
        if (!testCaseRepository.existsById(id)) {
            log.error("Test case not found with ID: {}", id);
            throw new EntityNotFoundException("Test case not found with id: " + id);
        }
        testCaseRepository.deleteById(id);
        log.info("Test case deleted successfully with ID: {}", id);
    }

    /**
     * Deletes all test cases for a problem
     * Xóa tất cả test case của một bài toán
     */
    @Transactional
    public void deleteAllTestCasesByProblemId(Long problemId) {
        log.debug("Deleting all test cases for problem ID: {}", problemId);
        List<TestCase> testCases = testCaseRepository.findByProblemIdOrderByTestOrderAsc(problemId);
        if (testCases.isEmpty()) {
            log.warn("No test cases found for problem ID: {}", problemId);
            return;
        }
        testCaseRepository.deleteAll(testCases);
        log.info("Successfully deleted {} test cases for problem ID: {}", testCases.size(), problemId);
    }
}