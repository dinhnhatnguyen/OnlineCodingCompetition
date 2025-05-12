package oj.onlineCodingCompetition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final ObjectMapper objectMapper;
    private final ModelMapper modelMapper;

    public ProblemDTO convertToDTO(Problem problem) {
        if (problem == null) {
            return null;
        }

        ProblemDTO dto = modelMapper.map(problem, ProblemDTO.class);
        if (problem.getTestCases() != null) {
            dto.setTestCases(problem.getTestCases().stream()
                    .map(testCase -> modelMapper.map(testCase, TestCaseDTO.class))
                    .collect(Collectors.toList()));
        }

        // Ensure topics are properly mapped
        if (problem.getTopics() != null) {
            dto.setTopics(new HashSet<>(problem.getTopics()));
        } else {
            dto.setTopics(new HashSet<>());
        }

        return dto;
    }

    private Problem convertToEntity(ProblemDTO dto, User creator) {
        if (dto == null) {
            return null;
        }

        Problem problem = modelMapper.map(dto, Problem.class);

        if (dto.getId() != null) {
            problem.setId(dto.getId());
        }

        problem.setCreatedBy(creator);

        // Ensure topics are properly mapped
        if (dto.getTopics() != null) {
            problem.setTopics(new HashSet<>(dto.getTopics()));
        } else {
            problem.setTopics(new HashSet<>());
        }

        if (dto.getId() == null) {
            problem.setCreatedAt(LocalDateTime.now());
        } else {
            Problem existingProblem = problemRepository.findById(dto.getId()).orElse(null);
            if (existingProblem != null) {
                problem.setCreatedAt(existingProblem.getCreatedAt());
            } else {
                problem.setCreatedAt(LocalDateTime.now());
            }
        }

        return problem;
    }

    @Transactional
    public ProblemDTO createProblem(ProblemDTO problemDTO, Long creatorId) {
        log.debug("Creating problem with creator ID: {}", creatorId);
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", creatorId);
                    return new EntityNotFoundException("User not found with id: " + creatorId);
                });

        validateProblemDTO(problemDTO);

        Problem problem = convertToEntity(problemDTO, creator);
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        return convertToDTO(savedProblem);
    }

    @Transactional
    public Problem createProblemWithTestCases(Problem problem) {
        log.debug("Creating problem with constraints: {}", problem.getConstraints());
        log.debug("Creating problem with {} test cases", problem.getTestCases().size());
        log.debug("Creating problem with topics: {}", problem.getTopics());

        validateProblem(problem);

        // Save the Problem first
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        if (!problem.getTestCases().isEmpty()) {
            try {
                // Ensure testCases list in savedProblem is initialized
                if (savedProblem.getTestCases() == null) {
                    savedProblem.setTestCases(new ArrayList<>());
                } else {
                    // Clear all current test cases to avoid ConcurrentModificationException
                    savedProblem.getTestCases().clear();
                }

                // Create a copy of test cases list to avoid ConcurrentModificationException
                List<TestCase> testCasesToAdd = new ArrayList<>(problem.getTestCases());

                for (TestCase testCase : testCasesToAdd) {
                    // Only assign Problem if not already assigned
                    if (testCase.getProblem() == null) {
                        testCase.setProblem(savedProblem);
                    }

                    // Assign defaultTimeLimit and defaultMemoryLimit if not specified
                    testCase.setTimeLimit(testCase.getTimeLimit() != null ? testCase.getTimeLimit() :
                            savedProblem.getDefaultTimeLimit() != null ? savedProblem.getDefaultTimeLimit() : 1000);
                    testCase.setMemoryLimit(testCase.getMemoryLimit() != null ? testCase.getMemoryLimit() :
                            savedProblem.getDefaultMemoryLimit() != null ? savedProblem.getDefaultMemoryLimit() : 262144);

                    // Save testCase to database
                    TestCase savedTestCase = testCaseRepository.save(testCase);

                    // Add saved testCase to savedProblem's testCases list for synchronization
                    savedProblem.getTestCases().add(savedTestCase);
                }

                // Update problem
                problemRepository.save(savedProblem);

                log.info("Successfully created {} test cases for problem ID: {}",
                        testCasesToAdd.size(), savedProblem.getId());
            } catch (Exception e) {
                log.error("Error creating test cases for problem ID: {}", savedProblem.getId(), e);
                throw new RuntimeException("Failed to create test cases for problem ID: " + savedProblem.getId(), e);
            }
        }

        return savedProblem;
    }

    @Transactional
    public ProblemDTO updateProblem(Long id, ProblemDTO problemDTO) {
        log.debug("Updating problem with ID: {}", id);
        Problem existingProblem = problemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", id);
                    return new EntityNotFoundException("Problem not found with id: " + id);
                });

        validateProblemDTO(problemDTO);

        // Save topics before mapping
        Set<String> topics = problemDTO.getTopics();

        modelMapper.map(problemDTO, existingProblem);
        existingProblem.setId(id);

        // Restore topics
        existingProblem.setTopics(topics);

        Problem updatedProblem = problemRepository.save(existingProblem);
        log.info("Problem updated successfully with ID: {}", updatedProblem.getId());

        return convertToDTO(updatedProblem);
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getAllProblems() {
        log.debug("Fetching all problems");
        return problemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Problem.FunctionSignature getFunctionSignature(Long problemId, String language) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + problemId));
        Problem.FunctionSignature signature = problem.getFunctionSignatures().get(language.toLowerCase());
        if (signature == null) {
            throw new RuntimeException("Function signature not found for language: " + language);
        }
        return signature;
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
    public void deleteProblem(Long id) {
        log.debug("Deleting problem with ID: {}", id);
        if (!problemRepository.existsById(id)) {
            log.error("Problem not found with ID: {}", id);
            throw new EntityNotFoundException("Problem not found with id: " + id);
        }

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
        return problemRepository.findByTopicsContaining(topic).stream()
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

    private void validateProblemDTO(ProblemDTO problemDTO) {
        List<String> validDifficulties = Arrays.asList("easy", "medium", "hard");
        if (!validDifficulties.contains(problemDTO.getDifficulty().toLowerCase())) {
            log.error("Invalid difficulty: {}", problemDTO.getDifficulty());
            throw new IllegalArgumentException("Difficulty must be one of: " + validDifficulties);
        }
        if (problemDTO.getSupportedLanguages() == null || problemDTO.getSupportedLanguages().isEmpty()) {
            throw new IllegalArgumentException("At least one supported language is required");
        }
        if (problemDTO.getFunctionSignatures() == null || problemDTO.getFunctionSignatures().isEmpty()) {
            throw new IllegalArgumentException("At least one function signature is required");
        }
    }

    private void validateProblem(Problem problem) {
        List<String> validDifficulties = Arrays.asList("easy", "medium", "hard");
        if (!validDifficulties.contains(problem.getDifficulty().toLowerCase())) {
            log.error("Invalid difficulty: {}", problem.getDifficulty());
            throw new IllegalArgumentException("Difficulty must be one of: " + validDifficulties);
        }
        if (problem.getSupportedLanguages() == null || problem.getSupportedLanguages().isEmpty()) {
            throw new IllegalArgumentException("At least one supported language is required");
        }
        if (problem.getFunctionSignatures() == null || problem.getFunctionSignatures().isEmpty()) {
            throw new IllegalArgumentException("At least one function signature is required");
        }
    }

    @Transactional(readOnly = true)
    public ProblemDTO getProblemWithTestCases(Long id) {
        log.debug("Fetching problem with test cases by ID: {}", id);
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Problem not found with ID: {}", id);
                    return new EntityNotFoundException("Problem not found with id: " + id);
                });
        // Explicitly load test cases (since they are lazily loaded)
        List<TestCase> testCases = testCaseRepository.findByProblemIdOrderByTestOrderAsc(id);
        problem.setTestCases(testCases);
        return convertToDTO(problem);
    }
}