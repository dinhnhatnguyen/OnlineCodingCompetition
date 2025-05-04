package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseDTO convertToDTO(TestCase testCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setId(testCase.getId());
        dto.setProblemId(testCase.getProblem().getId());
        dto.setInput(testCase.getInput());
        dto.setExpectedOutput(testCase.getExpectedOutput());
        dto.setIsExample(testCase.getIsExample());
        dto.setIsHidden(testCase.getIsHidden());
        dto.setTimeLimit(testCase.getTimeLimit());
        dto.setMemoryLimit(testCase.getMemoryLimit());
        dto.setOrder(testCase.getTestOrder());
        return dto;
    }

    private TestCase convertToEntity(TestCaseDTO dto, Problem problem) {
        TestCase testCase = new TestCase();

        if (dto.getId() != null) {
            testCase.setId(dto.getId());
        }

        testCase.setProblem(problem);
        testCase.setInput(dto.getInput());
        testCase.setExpectedOutput(dto.getExpectedOutput());
        testCase.setIsExample(dto.getIsExample() != null ? dto.getIsExample() : false);
        testCase.setIsHidden(dto.getIsHidden() != null ? dto.getIsHidden() : false);
        testCase.setTimeLimit(dto.getTimeLimit() != null ? dto.getTimeLimit() : 1000);
        testCase.setMemoryLimit(dto.getMemoryLimit() != null ? dto.getMemoryLimit() : 262144);
        testCase.setTestOrder(dto.getOrder() != null ? dto.getOrder() : 0);

        return testCase;
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getAllTestCasesByProblemId(Long problemId) {
        log.debug("Fetching all test cases for problem ID: {}", problemId);
        return testCaseRepository.findByProblemIdOrderByTestOrderAsc(problemId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> getExampleTestCasesByProblemId(Long problemId) {
        log.debug("Fetching example test cases for problem ID: {}", problemId);
        return testCaseRepository.findByProblemIdAndIsExampleTrueOrderByTestOrderAsc(problemId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

    @Transactional
    public TestCaseDTO createTestCase(TestCaseDTO testCaseDTO) {
        log.debug("Creating test case for problem ID: {}", testCaseDTO.getProblemId());
        Problem problem = problemRepository.findById(testCaseDTO.getProblemId())
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", testCaseDTO.getProblemId());
                    return new EntityNotFoundException("Problem not found with id: " + testCaseDTO.getProblemId());
                });

        TestCase testCase = convertToEntity(testCaseDTO, problem);
        TestCase savedTestCase = testCaseRepository.save(testCase);
        log.info("Test case created successfully with ID: {}", savedTestCase.getId());

        return convertToDTO(savedTestCase);
    }

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
    public TestCaseDTO updateTestCase(Long id, TestCaseDTO testCaseDTO) {
        log.debug("Updating test case with ID: {}", id);
        TestCase existingTestCase = testCaseRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Test case not found with ID: {}", id);
                    return new EntityNotFoundException("Test case not found with id: " + id);
                });

        Problem problem = problemRepository.findById(testCaseDTO.getProblemId())
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", testCaseDTO.getProblemId());
                    return new EntityNotFoundException("Problem not found with id: " + testCaseDTO.getProblemId());
                });

        // Update fields
        existingTestCase.setProblem(problem);
        existingTestCase.setInput(testCaseDTO.getInput());
        existingTestCase.setExpectedOutput(testCaseDTO.getExpectedOutput());
        existingTestCase.setIsExample(testCaseDTO.getIsExample());
        existingTestCase.setIsHidden(testCaseDTO.getIsHidden());
        existingTestCase.setTimeLimit(testCaseDTO.getTimeLimit());
        existingTestCase.setMemoryLimit(testCaseDTO.getMemoryLimit());
        existingTestCase.setTestOrder(testCaseDTO.getOrder());

        TestCase updatedTestCase = testCaseRepository.save(existingTestCase);
        log.info("Test case updated successfully with ID: {}", updatedTestCase.getId());

        return convertToDTO(updatedTestCase);
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