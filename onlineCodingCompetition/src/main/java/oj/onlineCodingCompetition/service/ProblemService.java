package oj.onlineCodingCompetition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.repository.ContestRepository;
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

    private final ContestRepository contestRepository;

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

        if (problem.getTopics() != null) {
            dto.setTopics(new HashSet<>(problem.getTopics()));
        } else {
            dto.setTopics(new HashSet<>());
        }

        if (problem.getContests() != null) {
            dto.setContestIds(problem.getContests().stream()
                    .map(Contest::getId)
                    .collect(Collectors.toSet()));
        } else {
            dto.setContestIds(new HashSet<>());
        }

        dto.setContestId(problem.getContestId());

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

        if (dto.getTopics() != null) {
            problem.setTopics(new HashSet<>(dto.getTopics()));
        } else {
            problem.setTopics(new HashSet<>());
        }

        if (dto.getContestIds() != null && !dto.getContestIds().isEmpty()) {
            List<Contest> contests = dto.getContestIds().stream()
                    .map(contestId -> contestRepository.findById(contestId)
                            .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId)))
                    .collect(Collectors.toList());
            problem.setContests(contests);
        } else {
            problem.setContests(new ArrayList<>());
        }

        problem.setContestId(dto.getContestId());

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

        if (problemDTO.getContestId() != null) {
            contestRepository.findById(problemDTO.getContestId())
                    .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + problemDTO.getContestId()));
        }

        Problem problem = convertToEntity(problemDTO, creator);
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        if (problem.getContests() != null) {
            for (Contest contest : problem.getContests()) {
                if (contest.getProblems() == null) {
                    contest.setProblems(new ArrayList<>());
                }
                if (!contest.getProblems().contains(savedProblem)) {
                    contest.getProblems().add(savedProblem);
                    contestRepository.save(contest);
                    log.info("Added problem {} to contest {}", savedProblem.getId(), contest.getId());
                }
            }
        }

        return convertToDTO(savedProblem);
    }

    @Transactional
    public Problem createProblemWithTestCases(Problem problem) {
        log.debug("Creating problem with constraints: {}", problem.getConstraints());
        log.debug("Creating problem with {} test cases", problem.getTestCases().size());
        log.debug("Creating problem with topics: {}", problem.getTopics());

        validateProblem(problem);

        if (problem.getContestId() != null) {
            contestRepository.findById(problem.getContestId())
                    .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + problem.getContestId()));
        }

        if (problem.getContests() != null && !problem.getContests().isEmpty()) {
            Set<Contest> validContests = problem.getContests().stream()
                    .map(contest -> contestRepository.findById(contest.getId())
                            .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contest.getId())))
                    .collect(Collectors.toSet());
            problem.setContests(new ArrayList<>(validContests));
        }

        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem created successfully with ID: {}", savedProblem.getId());

        if (savedProblem.getContests() != null) {
            for (Contest contest : savedProblem.getContests()) {
                if (contest.getProblems() == null) {
                    contest.setProblems(new ArrayList<>());
                }
                if (!contest.getProblems().contains(savedProblem)) {
                    contest.getProblems().add(savedProblem);
                    contestRepository.save(contest);
                    log.info("Added problem {} to contest {}", savedProblem.getId(), contest.getId());
                }
            }
        }

        if (!problem.getTestCases().isEmpty()) {
            try {
                if (savedProblem.getTestCases() == null) {
                    savedProblem.setTestCases(new ArrayList<>());
                } else {
                    savedProblem.getTestCases().clear();
                }

                List<TestCase> testCasesToAdd = new ArrayList<>(problem.getTestCases());

                for (TestCase testCase : testCasesToAdd) {
                    if (testCase.getProblem() == null) {
                        testCase.setProblem(savedProblem);
                    }

                    testCase.setTimeLimit(testCase.getTimeLimit() != null ? testCase.getTimeLimit() :
                            savedProblem.getDefaultTimeLimit() != null ? savedProblem.getDefaultTimeLimit() : 1000);
                    testCase.setMemoryLimit(testCase.getMemoryLimit() != null ? testCase.getMemoryLimit() :
                            savedProblem.getDefaultMemoryLimit() != null ? savedProblem.getDefaultMemoryLimit() : 262144);

                    TestCase savedTestCase = testCaseRepository.save(testCase);
                    savedProblem.getTestCases().add(savedTestCase);
                }

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

        Set<Long> currentContestIds = existingProblem.getContests().stream()
                .map(Contest::getId)
                .collect(Collectors.toSet());
        Set<Long> newContestIds = problemDTO.getContestIds() != null ? problemDTO.getContestIds() : new HashSet<>();


        modelMapper.map(problemDTO, existingProblem);
        existingProblem.setId(id);

        // Restore topics
        existingProblem.setTopics(topics);

        List<Contest> newContests = newContestIds.stream()
                .map(contestId -> contestRepository.findById(contestId)
                        .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId)))
                .collect(Collectors.toList());
        existingProblem.setContests(newContests);

        Problem updatedProblem = problemRepository.save(existingProblem);
        log.info("Problem updated successfully with ID: {}", updatedProblem.getId());

        // Đồng bộ problemIds trong Contest
        for (Long newContestId : newContestIds) {
            if (!currentContestIds.contains(newContestId)) {
                Contest contest = contestRepository.findById(newContestId).orElse(null);
                if (contest != null) {
                    if (contest.getProblems() == null) {
                        contest.setProblems(new ArrayList<>());
                    }
                    if (!contest.getProblems().contains(updatedProblem)) {
                        contest.getProblems().add(updatedProblem);
                        contestRepository.save(contest);
                        log.info("Added problem {} to contest {}", updatedProblem.getId(), newContestId);
                    }
                }
            }
        }
        for (Long oldContestId : currentContestIds) {
            if (!newContestIds.contains(oldContestId)) {
                Contest contest = contestRepository.findById(oldContestId).orElse(null);
                if (contest != null && contest.getProblems() != null) {
                    contest.getProblems().remove(updatedProblem);
                    contestRepository.save(contest);
                    log.info("Removed problem {} from contest {}", updatedProblem.getId(), oldContestId);
                }
            }
        }
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

//    @Transactional
//    public void deleteProblem(Long id) {
//        log.debug("Deleting problem with ID: {}", id);
//        if (!problemRepository.existsById(id)) {
//            log.error("Problem not found with ID: {}", id);
//            throw new EntityNotFoundException("Problem not found with id: " + id);
//        }
//
//
//
//        List<TestCase> testCases = testCaseRepository.findByProblemIdOrderByTestOrderAsc(id);
//        if (!testCases.isEmpty()) {
//            testCaseRepository.deleteAll(testCases);
//            log.info("Deleted {} test cases for problem ID: {}", testCases.size(), id);
//        }
//
//        problemRepository.deleteById(id);
//        log.info("Problem deleted successfully with ID: {}", id);
//    }

    @Transactional
    public void deleteProblem(Long id) {
        log.debug("Deleting problem with ID: {}", id);
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + id));

        // NEW: Kiểm tra contests
        if (!problem.getContests().isEmpty()) {
            throw new IllegalStateException("Cannot delete problem used in active contests: " +
                    problem.getContests().stream().map(Contest::getId).collect(Collectors.toList()));
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

    // Thêm problem vào contest
//    @Transactional
//    public void addProblemToContest(Long problemId, Long contestId) {
//        log.debug("Adding problem {} to contest {}", problemId, contestId);
//        Problem problem = problemRepository.findById(problemId)
//                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + problemId));
//        Contest contest = contestRepository.findById(contestId)
//                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId));
//
//        problem.getContests().add(contest);
//        contest.getProblemIds().add(problemId);
//
//        problemRepository.save(problem);
//        contestRepository.save(contest);
//        log.info("Successfully added problem {} to contest {}", problemId, contestId);
//    }
    @Transactional
    public void addProblemToContest(Long problemId, Long contestId) {
        log.debug("Adding problem {} to contest {}", problemId, contestId);
        try {
            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + problemId));
            Contest contest = contestRepository.findById(contestId)
                    .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId));


            if (contest.getProblems() == null) {
                contest.setProblems(new ArrayList<>());
            }
            if (!contest.getProblems().contains(problem)) {
                contest.getProblems().add(problem);
            }

            // Lưu chỉ phía Problem, không cần lưu Contest vì @ManyToMany sẽ xử lý
            problemRepository.save(problem);

            log.info("Successfully added problem {} to contest {}", problemId, contestId);
        } catch (Exception e) {
            // THAY ĐỔI: Thêm try-catch để ghi log lỗi
            log.error("Failed to add problem {} to contest {}: {}", problemId, contestId, e.getMessage());
            throw new IllegalStateException("Failed to add problem to contest: " + problemId, e);
        }
    }

    // Xóa problem khỏi contest
    @Transactional
    public void removeProblemFromContest(Long problemId, Long contestId) {
        log.debug("Removing problem {} from contest {}", problemId, contestId);
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + problemId));
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId));

        if (problem.getContests() != null) {
            problem.getContests().remove(contest);
        }

        if (contest.getProblems() != null) {
            contest.getProblems().remove(problem);
        }

        problemRepository.save(problem);
        contestRepository.save(contest);
        log.info("Successfully removed problem {} from contest {}", problemId, contestId);
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