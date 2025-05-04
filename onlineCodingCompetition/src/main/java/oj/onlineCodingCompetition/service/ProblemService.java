package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;

    public ProblemDTO convertToDTO(Problem problem) {
        if (problem == null) {
            return null;
        }

        ProblemDTO dto = new ProblemDTO();
        dto.setId(problem.getId());
        dto.setTitle(problem.getTitle());
        dto.setDescription(problem.getDescription());
        dto.setDifficulty(problem.getDifficulty());
        dto.setTopics(problem.getTopics());
        dto.setConstraints(problem.getConstraints());
        dto.setInputFormat(problem.getInputFormat());
        dto.setOutputFormat(problem.getOutputFormat());
        dto.setExamples(problem.getExamples());
        dto.setCreatedAt(problem.getCreatedAt());

        if (problem.getCreatedBy() != null) {
            dto.setCreatedById(problem.getCreatedBy().getId());
            dto.setCreatedByUsername(problem.getCreatedBy().getUsername());
        }

        return dto;
    }

    private Problem convertToEntity(ProblemDTO dto, User creator) {
        if (dto == null) {
            return null;
        }

        Problem problem = new Problem();

        if (dto.getId() != null) {
            problem.setId(dto.getId());
        }

        problem.setTitle(dto.getTitle());
        problem.setDescription(dto.getDescription());
        problem.setDifficulty(dto.getDifficulty().toLowerCase());
        problem.setTopics(dto.getTopics());
        problem.setConstraints(dto.getConstraints());
        problem.setInputFormat(dto.getInputFormat());
        problem.setOutputFormat(dto.getOutputFormat());
        problem.setExamples(dto.getExamples());
        problem.setCreatedBy(creator);

        // Set creation time only for new problems
        if (dto.getId() == null) {
            problem.setCreatedAt(LocalDateTime.now());
        } else {
            // For updates, preserve the original creation time
            Problem existingProblem = problemRepository.findById(dto.getId()).orElse(null);
            if (existingProblem != null) {
                problem.setCreatedAt(existingProblem.getCreatedAt());
            } else {
                problem.setCreatedAt(LocalDateTime.now());
            }
        }

        return problem;
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getAllProblems() {
        log.debug("Fetching all problems");
        return problemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProblemDTO> getProblemsPage(Pageable pageable) {
        log.debug("Fetching problems page with pageable: {}", pageable);
        return problemRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ProblemDTO getProblemById(Long id) {
        log.debug("Fetching problem by ID: {}", id);
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", id);
                    return new EntityNotFoundException("Problem not found with id: " + id);
                });
        return convertToDTO(problem);
    }

    @Transactional
    public ProblemDTO createProblem(ProblemDTO problemDTO, Long creatorId) {
        log.debug("Creating problem with creator ID: {}", creatorId);
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", creatorId);
                    return new EntityNotFoundException("User not found with id: " + creatorId);
                });

        Problem problem = convertToEntity(problemDTO, creator);
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        return convertToDTO(savedProblem);
    }

    @Transactional
    public ProblemDTO createProblemWithTestCases(ProblemDTO problemDTO, List<TestCaseDTO> testCaseDTOs, Long creatorId) {
        log.debug("Creating problem with {} test cases and creator ID: {}",
                testCaseDTOs != null ? testCaseDTOs.size() : 0, creatorId);

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", creatorId);
                    return new EntityNotFoundException("User not found with id: " + creatorId);
                });

        Problem problem = convertToEntity(problemDTO, creator);
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        if (testCaseDTOs != null && !testCaseDTOs.isEmpty()) {
            try {
                testCaseDTOs.forEach(testCaseDTO -> {
                    TestCase testCase = new TestCase();
                    testCase.setProblem(savedProblem);
                    testCase.setInput(testCaseDTO.getInput());
                    testCase.setExpectedOutput(testCaseDTO.getExpectedOutput());
                    testCase.setIsExample(testCaseDTO.getIsExample() != null ? testCaseDTO.getIsExample() : false);
                    testCase.setIsHidden(testCaseDTO.getIsHidden() != null ? testCaseDTO.getIsHidden() : false);
                    testCase.setTimeLimit(testCaseDTO.getTimeLimit() != null ? testCaseDTO.getTimeLimit() : 1000);
                    testCase.setMemoryLimit(testCaseDTO.getMemoryLimit() != null ? testCaseDTO.getMemoryLimit() : 262144);
                    testCase.setTestOrder(testCaseDTO.getOrder() != null ? testCaseDTO.getOrder() : 0);

                    testCaseRepository.save(testCase);
                });
                log.info("Successfully created {} test cases for problem ID: {}", testCaseDTOs.size(), savedProblem.getId());
            } catch (Exception e) {
                log.error("Error creating test cases for problem ID: {}", savedProblem.getId(), e);
                throw e; // Re-throw to ensure transaction rollback
            }
        }

        return convertToDTO(savedProblem);
    }

    @Transactional
    public ProblemDTO updateProblem(Long id, ProblemDTO problemDTO) {
        log.debug("Updating problem with ID: {}", id);
        Problem existingProblem = problemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", id);
                    return new EntityNotFoundException("Problem not found with id: " + id);
                });

        // Update fields
        existingProblem.setTitle(problemDTO.getTitle());
        existingProblem.setDescription(problemDTO.getDescription());
        existingProblem.setDifficulty(problemDTO.getDifficulty().toLowerCase());
        existingProblem.setTopics(problemDTO.getTopics());
        existingProblem.setConstraints(problemDTO.getConstraints());
        existingProblem.setInputFormat(problemDTO.getInputFormat());
        existingProblem.setOutputFormat(problemDTO.getOutputFormat());
        existingProblem.setExamples(problemDTO.getExamples());

        Problem updatedProblem = problemRepository.save(existingProblem);
        log.info("Problem updated successfully with ID: {}", updatedProblem.getId());

        return convertToDTO(updatedProblem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        log.debug("Deleting problem with ID: {}", id);
        if (!problemRepository.existsById(id)) {
            log.error("Problem not found with ID: {}", id);
            throw new EntityNotFoundException("Problem not found with id: " + id);
        }

        // Delete associated test cases first
        List<TestCase> testCases = testCaseRepository.findByProblemIdOrderByTestOrderAsc(id);
        if (!testCases.isEmpty()) {
            testCaseRepository.deleteAll(testCases);
            log.info("Deleted {} test cases for problem ID: {}", testCases.size(), id);
        }

        problemRepository.deleteById(id);
        log.info("Problem deleted successfully with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getProblemsByDifficulty(String difficulty) {
        log.debug("Fetching problems by difficulty: {}", difficulty);
        return problemRepository.findByDifficulty(difficulty.toLowerCase()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getProblemsByTopic(String topic) {
        log.debug("Fetching problems by topic: {}", topic);
        return problemRepository.findByTopic(topic).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> searchProblemsByTitle(String keyword) {
        log.debug("Searching problems by title keyword: {}", keyword);
        return problemRepository.findByTitleContainingIgnoreCase(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllTopics() {
        log.debug("Fetching all topics");
        return problemRepository.findAllTopics();
    }
}