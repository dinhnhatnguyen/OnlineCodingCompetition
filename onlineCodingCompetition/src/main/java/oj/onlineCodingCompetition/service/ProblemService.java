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
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.exception.ProblemDeletionException;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing programming problems in the system.
 * Service quản lý các bài toán lập trình trong hệ thống.
 *
 * Main responsibilities / Trách nhiệm chính:
 * - CRUD operations for problems / Thao tác CRUD cho bài toán
 * - Problem-Contest relationship / Quản lý quan hệ bài toán - cuộc thi
 * - Function signature management / Quản lý định dạng hàm
 * - Test case management / Quản lý test case
 */
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

    /**
     * Converts a Problem entity to ProblemDTO
     * Chuyển đổi entity Problem sang ProblemDTO
     */
    public ProblemDTO convertToDTO(Problem problem) {
        if (problem == null) {
            return null;
        }

        ProblemDTO dto = modelMapper.map(problem, ProblemDTO.class);
        
        // Xử lý riêng trường createdBy
        if (problem.getCreatedBy() != null) {
            dto.setCreatedBy(problem.getCreatedBy().getId());
        }
        
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

    /**
     * Converts a ProblemDTO to Problem entity
     * Chuyển đổi ProblemDTO sang entity Problem
     * 
     * @param dto DTO to convert / DTO cần chuyển đổi
     * @param creator User who creates the problem / Người tạo bài toán
     */
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

    /**
     * Creates a new problem with test cases
     * Tạo mới bài toán với các test case
     * 
     * @param problemDTO Problem data / Dữ liệu bài toán
     * @param creatorId ID of creator / ID người tạo
     * @return Created problem / Bài toán đã tạo
     */
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

    /**
     * Updates an existing problem
     * Cập nhật bài toán đã tồn tại
     * 
     * @param id Problem ID / ID bài toán
     * @param problemDTO Updated data / Dữ liệu cập nhật
     */
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
        log.debug("Request to get all Problems");
        return problemRepository.findAllActive().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getProblemsByCreatedBy(Long userId) {
        log.debug("Request to get all Problems created by user: {}", userId);
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return problemRepository.findByCreatedByAndDeletedFalse(creator).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets function signature for a specific language
     * Lấy định dạng hàm cho một ngôn ngữ cụ thể
     */
    @Transactional(readOnly = true)
    public Problem.FunctionSignature getFunctionSignature(Long problemId, String language) {
        log.debug("Request to get function signature for problem {} and language {}", problemId, language);
        Problem problem = problemRepository.findByIdWithFunctionSignatures(problemId)
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
        log.debug("Request to get Problem : {}", id);
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + id));
        if (problem.isDeleted()) {
            throw new EntityNotFoundException("Problem has been deleted");
        }
        return convertToDTO(problem);
    }

    /**
     * Gets all contests that contain a specific problem
     * Lấy tất cả cuộc thi chứa bài toán cụ thể
     *
     * @param problemId Problem ID / ID bài toán
     * @return List of contests containing the problem / Danh sách cuộc thi chứa bài toán
     */
    @Transactional(readOnly = true)
    public List<ContestDTO> getContestsContainingProblem(Long problemId) {
        log.debug("Getting contests containing problem with ID: {}", problemId);

        // Kiểm tra bài toán tồn tại
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + problemId));

        // Lấy danh sách cuộc thi chứa bài toán này
        List<Contest> contests = problem.getContests().stream()
                .filter(contest -> !contest.isDeleted()) // Chỉ lấy cuộc thi chưa bị xóa
                .collect(Collectors.toList());

        // Chuyển đổi sang DTO với thông tin chi tiết
        return contests.stream()
                .map(this::convertContestToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Soft deletes a problem
     * Xóa mềm một bài toán
     *
     * @param id Problem ID / ID bài toán
     * @param userId User performing deletion / ID người xóa
     * @throws ProblemDeletionException if problem is in active contests
     */
    @Transactional
    public void deleteProblem(Long id, Long userId) {
        log.debug("Soft deleting problem with ID: {} by user: {}", id, userId);
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Problem not found with id: " + id));

        // Kiểm tra xem bài toán có đang nằm trong cuộc thi đang diễn ra không
        List<Contest> ongoingContests = problem.getContests().stream()
                .filter(contest -> !contest.isDeleted() && contest.getStatus() == Contest.ContestStatus.ONGOING)
                .collect(Collectors.toList());

        if (!ongoingContests.isEmpty()) {
            // Chuyển đổi sang DTO để trả về thông tin chi tiết
            List<ContestDTO> ongoingContestDTOs = ongoingContests.stream()
                    .map(this::convertContestToDTO)
                    .collect(Collectors.toList());

            String message = String.format(
                "Không thể xóa bài toán này vì đang được sử dụng trong %d cuộc thi đang diễn ra",
                ongoingContests.size()
            );

            throw new ProblemDeletionException(message, ongoingContestDTOs);
        }

        // Đánh dấu problem là đã xóa
        problem.setDeleted(true);
        problem.setDeletedAt(LocalDateTime.now());
        problem.setDeletedBy(userId);

        // Lưu thay đổi
        problemRepository.save(problem);
        log.info("Problem soft deleted successfully with ID: {} by user: {}", id, userId);
    }

    @Transactional(readOnly = true)
    public List<ProblemDTO> getProblemsByDifficulty(String difficulty) {
        log.debug("Fetching problems by difficulty: {}", difficulty);
        return problemRepository.findByDifficultyAndDeletedFalse(difficulty).stream()
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
        log.debug("Searching problems by title containing: {}", keyword);
        return problemRepository.findByTitleContainingIgnoreCaseAndDeletedFalse(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<String> getAllTopics() {
        log.debug("Fetching all topics");
        return problemRepository.findAllTopics();
    }

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

    /**
     * Validates problem data before saving
     * Kiểm tra tính hợp lệ của dữ liệu bài toán trước khi lưu
     * 
     * Checks / Kiểm tra:
     * - Valid difficulty / Độ khó hợp lệ
     * - Supported languages / Ngôn ngữ hỗ trợ
     * - Function signatures / Định dạng hàm
     */
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

    @Transactional(readOnly = true)
    public Problem getProblemEntityById(Long id) {
        log.debug("Fetching problem entity by ID: {}", id);
        return problemRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Problem entity not found with ID: {}", id);
                    return new EntityNotFoundException("Problem not found with id: " + id);
                });
    }

    @Transactional
    public Problem updateProblemWithTestCases(Problem problem) {
        log.debug("Updating problem with ID: {} and test cases", problem.getId());
        
        // Validate problem data
        validateProblem(problem);
        
        // Set updated timestamp
        problem.setUpdatedAt(LocalDateTime.now());
        
        // Save the problem entity with its test cases
        Problem savedProblem = problemRepository.save(problem);
        log.info("Problem updated successfully with ID: {}", savedProblem.getId());
        
        // Update contest associations if needed
        if (savedProblem.getContests() != null) {
            for (Contest contest : savedProblem.getContests()) {
                if (contest.getProblems() == null) {
                    contest.setProblems(new ArrayList<>());
                }
                if (!contest.getProblems().contains(savedProblem)) {
                    contest.getProblems().add(savedProblem);
                    contestRepository.save(contest);
                    log.info("Updated problem {} association with contest {}", savedProblem.getId(), contest.getId());
                }
            }
        }
        
        return savedProblem;
    }

    /**
     * Converts Contest entity to ContestDTO with detailed information
     * Chuyển đổi Contest entity sang ContestDTO với thông tin chi tiết
     *
     * @param contest Contest entity / Contest entity
     * @return ContestDTO with detailed information / ContestDTO với thông tin chi tiết
     */
    private ContestDTO convertContestToDTO(Contest contest) {
        ContestDTO dto = modelMapper.map(contest, ContestDTO.class);

        // Set additional information
        dto.setCreatedById(contest.getCreatedBy().getId());

        // Explicitly set status to ensure proper mapping
        dto.setStatus(contest.getStatus().toString());

        // Count current participants (approved registrations)
        long participantCount = contest.getRegistrations().stream()
                .filter(registration -> "APPROVED".equals(registration.getStatus().toString()))
                .count();
        dto.setCurrentParticipants((int) participantCount);

        // Set problem count (only non-deleted problems)
        if (contest.getProblems() != null) {
            List<Long> problemIds = contest.getProblems().stream()
                    .filter(problem -> !problem.isDeleted())
                    .map(Problem::getId)
                    .collect(Collectors.toList());
            dto.setProblemIds(problemIds);
        }

        return dto;
    }
}