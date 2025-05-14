package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.ContestRegistration;
import oj.onlineCodingCompetition.repository.ContestRegistrationRepository;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;
    private final ContestRegistrationRepository contestRegistrationRepository;
    private final UserRepository userRepository;
    private final ProblemService problemService;
    private final ModelMapper modelMapper;
    private final ProblemRepository problemRepository;

//    @Transactional
//    public ContestDTO createContest(ContestDTO contestDTO, Long creatorId) {
//        log.debug("Creating contest with creator ID: {}", creatorId);
//        User creator = userRepository.findById(creatorId)
//                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + creatorId));
//
//        validateContestDTO(contestDTO);
//
//        Contest contest = convertToEntity(contestDTO);
//        contest.setCreatedAt(LocalDateTime.now());
//        updateContestStatus(contest);
//
//        Contest savedContest = contestRepository.save(contest);
//        log.info("Contest created successfully with ID: {}", savedContest.getId());
//
//        // NEW: Thêm bài toán vào contest
//        if (contestDTO.getProblemIds() != null) {
//            for (Long problemId : contestDTO.getProblemIds()) {
//                try {
//                    problemService.addProblemToContest(problemId, savedContest.getId());
//                } catch (EntityNotFoundException e) {
//                    log.error("Failed to add problem {} to contest {}: {}", problemId, savedContest.getId(), e.getMessage());
//                    throw new IllegalArgumentException("Invalid problem ID: " + problemId, e);
//                }
//            }
//        }
//
//        return convertToDTO(savedContest);
//    }
//    @Transactional
//    public Contest createContest(ContestDTO contestDTO, User creator) {
//        if (creator == null) {
//            log.debug("Attempt to create contest without a valid creator");
//            throw new IllegalArgumentException("Creator cannot be null");
//        }
//
//        log.debug("Creating contest: {} by user: {}", contestDTO.getTitle(), creator.getUsername());
//
//        // Validate problemIds
//        if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
//            // Check if all problems exist
//            boolean allProblemsExist = contestDTO.getProblemIds().stream()
//                    .allMatch(problemId -> problemRepository.existsById(problemId));
//
//            if (!allProblemsExist) {
//                log.debug("Some problem IDs do not exist in the database");
//                throw new IllegalArgumentException("One or more problem IDs are invalid");
//            }
//        }
//
//        // Set creator and ensure other fields are properly set
//        contestDTO.setCreatedById(creator.getId());
//        contestDTO.setCreatedAt(LocalDateTime.now());
//
//        // Set default status if not provided
//        if (contestDTO.getStatus() == null) {
//            contestDTO.setStatus(String.valueOf(Contest.ContestStatus.DRAFT));
//        }
//
//        Contest savedContets = convertToEntity(contestDTO);
//        log.debug("Saving contest to database");
//        return contestRepository.save(savedContets);
//    }

    @Transactional
    public Contest createContest(ContestDTO contestDTO, Long creatorId) {
        if (creatorId == null) {
            log.error("Attempt to create contest without a valid creator");
            throw new IllegalArgumentException("Creator cannot be null");
        }

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + creatorId));

        log.debug("Creating contest: {} by user: {}", contestDTO.getTitle(), creator.getUsername());

        // THAY ĐỔI: Validate và lấy danh sách Problem thay vì chỉ kiểm tra exists
        List<Problem> problems = new ArrayList<>();
        if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
            problems = problemRepository.findAllById(contestDTO.getProblemIds());
            if (problems.size() != contestDTO.getProblemIds().size()) {
                log.error("Some problem IDs do not exist in the database: {}", contestDTO.getProblemIds());
                throw new IllegalArgumentException("One or more problem IDs are invalid");
            }
        }

        // Convert DTO to entity
        Contest contest = convertToEntity(contestDTO);
        contest.setCreatedBy(creator);
        contest.setCreatedAt(LocalDateTime.now());
        // THAY ĐỔI: Đặt danh sách problems trực tiếp thay vì gọi addProblemToContest
        contest.setProblems(problems);

        // Set default status if not provided
        if (contestDTO.getStatus() == null) {
            contest.setStatus(Contest.ContestStatus.DRAFT);
        } else {
            try {
                contest.setStatus(Contest.ContestStatus.valueOf(contestDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                log.error("Invalid contest status: {}", contestDTO.getStatus());
                throw new IllegalArgumentException("Invalid contest status: " + contestDTO.getStatus());
            }
        }

        // Save contest
        log.debug("Saving contest to database");
        Contest savedContest = contestRepository.save(contest);
        log.debug("Contest saved with ID: {}", savedContest.getId());

        return savedContest;
    }
//@Transactional
//public Contest createContest(ContestDTO contestDTO, Long creatorId) {
//    if (creatorId == null) {
//        log.error("Attempt to create contest without a valid creator");
//        throw new IllegalArgumentException("Creator cannot be null");
//    }
//
//    log.debug("Creating contest: {} by user: {}", contestDTO.getTitle(),  creatorId);
//
//    // Validate problemIds
//    if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
//        boolean allProblemsExist = contestDTO.getProblemIds().stream()
//                .allMatch(problemId -> problemRepository.existsById(problemId));
//        if (!allProblemsExist) {
//            log.error("Some problem IDs do not exist in the database: {}", contestDTO.getProblemIds());
//            throw new IllegalArgumentException("One or more problem IDs are invalid");
//        }
//    }
//    contestDTO.setCreatedById(creatorId);
//
//    // Convert DTO to entity
//    Contest contest = convertToEntity(contestDTO);

    /// /    contest.setCreatedBy(creatorId); // Explicitly set creator
//    contest.setCreatedAt(LocalDateTime.now());
//
//    // Set default status if not provided
//    if (contestDTO.getStatus() == null) {
//        contest.setStatus(Contest.ContestStatus.DRAFT);
//    } else {
//        try {
//            contest.setStatus(Contest.ContestStatus.valueOf(contestDTO.getStatus()));
//        } catch (IllegalArgumentException e) {
//            log.error("Invalid contest status: {}", contestDTO.getStatus());
//            throw new IllegalArgumentException("Invalid contest status: " + contestDTO.getStatus());
//        }
//    }
//
//    // Save contest
//    log.debug("Saving contest to database");
//    Contest savedContest = contestRepository.save(contest);
//
//    // Update problems in contest
//    if (contestDTO.getProblemIds() != null) {
//        for (Long problemId : contestDTO.getProblemIds()) {
//            problemService.addProblemToContest(problemId, savedContest.getId());
//        }
//    }
//
//    return savedContest;
//}
    @Transactional
    public ContestDTO updateContest(Long id, ContestDTO contestDTO) {
        log.debug("Updating contest with ID: {}", id);
        Contest existingContest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + id));

        validateContestDTO(contestDTO);

        List<Long> currentProblemIds = existingContest.getProblemIds();
        List<Long> newProblemIds = contestDTO.getProblemIds() != null ? contestDTO.getProblemIds() : List.of();

        modelMapper.map(contestDTO, existingContest);
        existingContest.setId(id);
        updateContestStatus(existingContest);

        Contest updatedContest = contestRepository.save(existingContest);
        log.info("Contest updated successfully with ID: {}", updatedContest.getId());

        // NEW: Cập nhật danh sách bài toán
        for (Long problemId : newProblemIds) {
            if (!currentProblemIds.contains(problemId)) {
                problemService.addProblemToContest(problemId, updatedContest.getId());
            }
        }
        for (Long problemId : currentProblemIds) {
            if (!newProblemIds.contains(problemId)) {
                problemService.removeProblemFromContest(problemId, updatedContest.getId());
            }
        }

        return convertToDTO(updatedContest);
    }

    @Transactional
    public void deleteContest(Long id) {
        log.debug("Deleting contest with ID: {}", id);
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + id));

        // NEW: Xóa registrations
        contestRegistrationRepository.deleteAll(contest.getRegistrations());
        log.info("Deleted {} registrations for contest ID: {}", contest.getRegistrations().size(), id);

        // NEW: Xóa contest khỏi problems
        for (Long problemId : contest.getProblemIds()) {
            problemService.removeProblemFromContest(problemId, id);
        }

        contestRepository.deleteById(id);
        log.info("Contest deleted successfully with ID: {}", id);
    }

    @Transactional
    public ContestRegistrationDTO registerUser(Long contestId, Long userId) {
        log.debug("Registering user {} for contest {}", userId, contestId);
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + contestId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        if (contestRegistrationRepository.findByContestIdAndUserId(contestId, userId).isPresent()) {
            throw new IllegalStateException("User is already registered for this contest");
        }

        ContestRegistration registration = new ContestRegistration();
        registration.setContest(contest);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus(ContestRegistration.RegistrationStatus.PENDING);
        registration.setTotalScore(0.0);

        ContestRegistration savedRegistration = contestRegistrationRepository.save(registration);
        log.info("User {} registered for contest {} with registration ID: {}", userId, contestId, savedRegistration.getId());

        return convertToRegistrationDTO(savedRegistration);
    }

    @Transactional
    public void approveRegistration(Long registrationId) {
        log.debug("Approving registration with ID: {}", registrationId);
        ContestRegistration registration = contestRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));
        registration.setStatus(ContestRegistration.RegistrationStatus.APPROVED);
        contestRegistrationRepository.save(registration);
        log.info("Registration {} approved", registrationId);
    }

    @Transactional
    public void rejectRegistration(Long registrationId) {
        log.debug("Rejecting registration with ID: {}", registrationId);
        ContestRegistration registration = contestRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new EntityNotFoundException("Registration not found with id: " + registrationId));
        registration.setStatus(ContestRegistration.RegistrationStatus.REJECTED);
        contestRegistrationRepository.save(registration);
        log.info("Registration {} rejected", registrationId);
    }

    @Transactional(readOnly = true)
    public List<ContestDTO> getAllContests() {
        log.debug("Fetching all contests");
        return contestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ContestDTO> getContestsPage(Pageable pageable) {
        log.debug("Fetching contests page with pageable: {}", pageable);
        return contestRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ContestDTO getContestById(Long id) {
        log.debug("Fetching contest by ID: {}", id);
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contest not found with id: " + id));
        return convertToDTO(contest);
    }

    @Transactional(readOnly = true)
    public List<ContestRegistrationDTO> getLeaderboard(Long contestId) {
        log.debug("Fetching leaderboard for contest ID: {}", contestId);
        return contestRegistrationRepository.findByContestIdOrderByTotalScoreDesc(contestId).stream()
                .map(this::convertToRegistrationDTO)
                .collect(Collectors.toList());
    }

    public ContestDTO convertToDTO(Contest contest) {
        ContestDTO dto = modelMapper.map(contest, ContestDTO.class);
        dto.setProblemIds(contest.getProblemIds());
        return dto;
    }

//    private Contest convertToEntity(ContestDTO dto) {
//        Contest contest = modelMapper.map(dto, Contest.class);
//        if (dto.getProblemIds() != null) {
//            contest.setProblemIds(new ArrayList<>(dto.getProblemIds()));
//        }
//        // Ensure createdBy is not set here; it will be set in createContest
//        contest.setCreatedBy(null);
//        return contest;
//    }

    private Contest convertToEntity(ContestDTO dto) {
        Contest contest = modelMapper.map(dto, Contest.class);
//        if (dto.getProblemIds() != null) {
//            contest.setProblemIds(new ArrayList<>(dto.getProblemIds()));
//        }
        return contest;
    }

    private ContestRegistrationDTO convertToRegistrationDTO(ContestRegistration registration) {
        ContestRegistrationDTO dto = modelMapper.map(registration, ContestRegistrationDTO.class);
        dto.setContestId(registration.getContest().getId());
        dto.setUserId(registration.getUser().getId());
        return dto;
    }

    private void validateContestDTO(ContestDTO contestDTO) {
        if (contestDTO.getStartTime() == null || contestDTO.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (contestDTO.getEndTime().isBefore(contestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void updateContestStatus(Contest contest) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(contest.getStartTime())) {
            contest.setStatus(Contest.ContestStatus.UPCOMING);
        } else if (now.isAfter(contest.getEndTime())) {
            contest.setStatus(Contest.ContestStatus.COMPLETED);
        } else {
            contest.setStatus(Contest.ContestStatus.ONGOING);
        }
    }
}