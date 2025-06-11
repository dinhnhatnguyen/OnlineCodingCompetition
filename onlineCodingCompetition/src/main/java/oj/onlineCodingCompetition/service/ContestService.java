package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.ContestRegistration;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.Submission;
import oj.onlineCodingCompetition.repository.ContestRegistrationRepository;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.SubmissionRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing programming contests in the system.
 * Service quản lý các cuộc thi lập trình trong hệ thống.
 *
 * Main features / Tính năng chính:
 * - Contest management / Quản lý cuộc thi
 * - Registration handling / Xử lý đăng ký
 * - Leaderboard tracking / Theo dõi bảng xếp hạng
 * - Status automation / Tự động hóa trạng thái
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;
    private final ContestRegistrationRepository contestRegistrationRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final ModelMapper modelMapper;

    /**
     * Creates a new contest
     * Tạo mới cuộc thi
     * 
     * Steps / Các bước:
     * 1. Validate input / Kiểm tra đầu vào
     * 2. Create contest / Tạo cuộc thi
     * 3. Add problems / Thêm bài toán
     * 4. Set status / Đặt trạng thái
     */
    @Transactional
    public ContestDTO createContest(ContestDTO contestDTO, Long creatorId) {
        log.debug("Tạo cuộc thi mới bởi user ID: {}", creatorId);

        // Kiểm tra người tạo
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + creatorId));

        // Kiểm tra dữ liệu đầu vào
        validateContestDTO(contestDTO);
        validateContestStatus(contestDTO.getStatus());

        // Tạo entity Contest
        Contest contest = new Contest();
        contest.setTitle(contestDTO.getTitle());
        contest.setDescription(contestDTO.getDescription());
        contest.setStartTime(contestDTO.getStartTime());
        contest.setEndTime(contestDTO.getEndTime());
        contest.setCreatedBy(creator);
        contest.setCreatedAt(LocalDateTime.now());
        contest.setPublic(contestDTO.isPublic());
        contest.setMaxParticipants(contestDTO.getMaxParticipants());

        // Xử lý trạng thái
        Contest.ContestStatus requestedStatus = contestDTO.getStatus() != null 
            ? Contest.ContestStatus.valueOf(contestDTO.getStatus()) 
            : Contest.ContestStatus.DRAFT;
        
        contest.setStatus(determineContestStatus(requestedStatus, contest.getStartTime(), contest.getEndTime()));

        // Kiểm tra và thêm bài toán
        if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
            // Only add non-deleted problems
            List<Problem> problems = problemRepository.findAllById(contestDTO.getProblemIds()).stream()
                    .filter(problem -> !problem.isDeleted())
                    .collect(Collectors.toList());
            if (problems.isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy bài toán hợp lệ nào");
            }
            contest.setProblems(problems);
        }

        Contest savedContest = contestRepository.save(contest);
        log.info("Tạo cuộc thi thành công với ID: {}", savedContest.getId());

        return convertToDTO(savedContest);
    }

    /**
     * Updates an existing contest
     * Cập nhật cuộc thi đã tồn tại
     * 
     * Updates / Cập nhật:
     * - Basic info / Thông tin cơ bản
     * - Problems / Bài toán
     * - Status / Trạng thái
     * - Time settings / Cài đặt thời gian
     */
    @Transactional
    public ContestDTO updateContest(Long id, ContestDTO contestDTO) {
        log.debug("Cập nhật cuộc thi với ID: {}", id);

        Contest existingContest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + id));

        validateContestDTO(contestDTO);
        validateContestStatus(contestDTO.getStatus());

        // Cập nhật thông tin cơ bản
        if (contestDTO.getTitle() != null) {
            existingContest.setTitle(contestDTO.getTitle());
        }
        if (contestDTO.getDescription() != null) {
            existingContest.setDescription(contestDTO.getDescription());
        }

        existingContest.setStartTime(contestDTO.getStartTime());
        existingContest.setEndTime(contestDTO.getEndTime());
        
        // Cập nhật thuộc tính public
        existingContest.setPublic(contestDTO.isPublic());

        if (contestDTO.getMaxParticipants() != null) {
            existingContest.setMaxParticipants(contestDTO.getMaxParticipants());
        }

        // Xử lý trạng thái
        if (contestDTO.getStatus() != null) {
            Contest.ContestStatus requestedStatus = Contest.ContestStatus.valueOf(contestDTO.getStatus());
            existingContest.setStatus(determineContestStatus(requestedStatus, 
                existingContest.getStartTime(), existingContest.getEndTime()));
        }

        // Cập nhật danh sách bài toán
        if (contestDTO.getProblemIds() != null) {
            // Only add non-deleted problems
            List<Problem> problems = problemRepository.findAllById(contestDTO.getProblemIds()).stream()
                    .filter(problem -> !problem.isDeleted())
                    .collect(Collectors.toList());
            if (problems.isEmpty() && !contestDTO.getProblemIds().isEmpty()) {
                throw new IllegalArgumentException("Không tìm thấy bài toán hợp lệ nào");
            }
            existingContest.setProblems(problems);
        }

        Contest updatedContest = contestRepository.save(existingContest);
        return convertToDTO(updatedContest);
    }

    @Transactional
    public void deleteContest(Long id, Long userId) {
        log.debug("Soft deleting contest with ID: {} by user: {}", id, userId);
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + id));

        // Kiểm tra nếu cuộc thi đang diễn ra thì không cho xóa
        if (contest.getStatus() == Contest.ContestStatus.ONGOING) {
            throw new IllegalStateException("Không thể xóa cuộc thi đang diễn ra");
        }

        // Đánh dấu contest là đã xóa
        contest.setDeleted(true);
        contest.setDeletedAt(LocalDateTime.now());
        contest.setDeletedBy(userId);
        
        // Lưu thay đổi
        contestRepository.save(contest);
        log.info("Contest soft deleted successfully with ID: {} by user: {}", id, userId);
    }

    /**
     * Registers a user for a contest
     * Đăng ký người dùng vào cuộc thi
     * 
     * Checks / Kiểm tra:
     * - Contest exists / Cuộc thi tồn tại
     * - User exists / Người dùng tồn tại
     * - Registration limits / Giới hạn đăng ký
     * - Previous registration / Đăng ký trước đó
     */
    @Transactional
    public ContestRegistrationDTO registerUser(Long contestId, Long userId) {
        log.debug("Đăng ký user {} cho cuộc thi {}", userId, contestId);

        // Kiểm tra cuộc thi
        log.debug("Tìm kiếm cuộc thi với ID: {}", contestId);
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + contestId));
        log.debug("Tìm thấy cuộc thi: {}", contest.getTitle());

        // Kiểm tra người dùng
        log.debug("Tìm kiếm user với ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + userId));
        log.debug("Tìm thấy user: {}", user.getUsername());

        // Kiểm tra đăng ký hiện có
        log.debug("Kiểm tra xem user đã đăng ký chưa");
        Optional<ContestRegistration> existingRegistration = contestRegistrationRepository.findByContestIdAndUserId(contestId, userId);
        if (existingRegistration.isPresent()) {
            return convertToRegistrationDTO(existingRegistration.get());
        }

        // Kiểm tra giới hạn người tham gia
        log.debug("Kiểm tra giới hạn người tham gia");
        long approvedCount = contestRegistrationRepository.countByContestIdAndStatus(contestId, ContestRegistration.RegistrationStatus.APPROVED);
        if (contest.getMaxParticipants() != null && approvedCount >= contest.getMaxParticipants()) {
            throw new IllegalStateException("Đã đạt số lượng người tham gia tối đa");
        }

        // Tạo đăng ký mới
        ContestRegistration registration = new ContestRegistration();
        registration.setContest(contest);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setTotalScore(0.0);
        registration.setStatus(ContestRegistration.RegistrationStatus.PENDING);

        // Lưu đăng ký
        log.debug("Lưu bản ghi đăng ký");
        ContestRegistration savedRegistration = contestRegistrationRepository.save(registration);
        log.info("Đăng ký thành công cho user {} trong cuộc thi {} với ID đăng ký: {}", userId, contestId, savedRegistration.getId());

        return convertToRegistrationDTO(savedRegistration);
    }

    /**
     * Approves a contest registration
     * Duyệt đăng ký cuộc thi
     * 
     * Validations / Kiểm tra:
     * - Registration exists / Đăng ký tồn tại
     * - Participant limit / Giới hạn người tham gia
     * - Contest status / Trạng thái cuộc thi
     */
    @Transactional
    public void approveRegistration(Long registrationId) {
        log.debug("Duyệt đăng ký với ID: {}", registrationId);

        try {
            // Tìm thông tin đăng ký và nạp luôn các thông tin liên quan
            ContestRegistration registration = contestRegistrationRepository.findById(registrationId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đăng ký với ID: " + registrationId));

            // In thông tin để debug
            log.debug("Tìm thấy đăng ký với ID: {}, status: {}", registrationId, registration.getStatus());

            // Lấy thông tin contest với xử lý LazyInitializationException
            Contest contest = registration.getContest();
            if (contest == null) {
                throw new IllegalStateException("Không tìm thấy thông tin cuộc thi cho đăng ký này");
            }

            log.debug("Contest ID: {}, maxParticipants: {}", contest.getId(), contest.getMaxParticipants());

            // Đếm số lượng đăng ký đã duyệt trước khi kiểm tra (không sử dụng stream để tránh LazyInitializationException)
            long approvedCount = 0;
            if (contest.getMaxParticipants() != null) {
                approvedCount = contestRegistrationRepository.countByContestIdAndStatus(
                        contest.getId(), ContestRegistration.RegistrationStatus.APPROVED);

                log.debug("Số lượng đăng ký đã duyệt: {}, giới hạn: {}", approvedCount, contest.getMaxParticipants());

                if (approvedCount >= contest.getMaxParticipants()) {
                    throw new IllegalStateException("Đã đạt số lượng người tham gia tối đa");
                }
            }

            // Cập nhật trạng thái
            registration.setStatus(ContestRegistration.RegistrationStatus.APPROVED);
            contestRegistrationRepository.save(registration);
            log.info("Duyệt đăng ký {} thành công", registrationId);
        } catch (Exception e) {
            log.error("Lỗi khi duyệt đăng ký ID {}: {}", registrationId, e.getMessage(), e);
            throw e; // Re-throw để transaction rollback
        }
    }

    @Transactional
    public void rejectRegistration(Long registrationId) {
        log.debug("Từ chối đăng ký với ID: {}", registrationId);

        try {
            ContestRegistration registration = contestRegistrationRepository.findById(registrationId)
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đăng ký với ID: " + registrationId));

            registration.setStatus(ContestRegistration.RegistrationStatus.REJECTED);
            contestRegistrationRepository.save(registration);
            log.info("Từ chối đăng ký {} thành công", registrationId);
        } catch (Exception e) {
            log.error("Lỗi khi từ chối đăng ký ID {}: {}", registrationId, e.getMessage(), e);
            throw e;
        }
    }


    @Transactional(readOnly = true)
    public List<ContestDTO> getAllContests() {
        log.debug("Lấy tất cả cuộc thi");
        return contestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ContestDTO> getContestsPage(Pageable pageable) {
        log.debug("Lấy danh sách cuộc thi theo trang với pageable: {}", pageable);
        return contestRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ContestDTO getContestById(Long id) {
        log.debug("Lấy cuộc thi theo ID: {}", id);
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + id));
        return convertToDTO(contest);
    }

    /**
     * Gets contest leaderboard
     * Lấy bảng xếp hạng cuộc thi
     * 
     * Includes / Bao gồm:
     * - User info / Thông tin người dùng
     * - Total score / Điểm tổng
     * - Registration status / Trạng thái đăng ký
     */
    @Transactional(readOnly = true)
    public List<ContestRegistrationDTO> getLeaderboard(Long contestId) {
        log.debug("Lấy bảng xếp hạng cho cuộc thi ID: {}", contestId);
        return contestRegistrationRepository.findByContestIdOrderByTotalScoreDesc(contestId)
                .stream()
                .map(registration -> {
                    ContestRegistrationDTO dto = modelMapper.map(registration, ContestRegistrationDTO.class);
                    dto.setContestId(registration.getContest().getId());
                    dto.setUserId(registration.getUser().getId());
                    dto.setUsername(registration.getUser().getUsername());
                    dto.setEmail(registration.getUser().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContestRegistrationDTO> getRegistrations(Long contestId) {
        log.debug("Lấy danh sách đăng ký cho cuộc thi ID: {}", contestId);
        return contestRegistrationRepository.findByContestId(contestId)
                .stream()
                .map(registration -> {
                    ContestRegistrationDTO dto = modelMapper.map(registration, ContestRegistrationDTO.class);
                    dto.setContestId(registration.getContest().getId());
                    dto.setUserId(registration.getUser().getId());
                    dto.setUsername(registration.getUser().getUsername());
                    dto.setEmail(registration.getUser().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra xem người dùng có thể tham gia cuộc thi không
     * @param contestId ID của cuộc thi
     * @param userId ID của người dùng
     * @return true nếu người dùng có thể tham gia, false nếu không
     */
    @Transactional(readOnly = true)
    public boolean canUserParticipateInContest(Long contestId, Long userId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + contestId));

        // Nếu là cuộc thi public và đang diễn ra, cho phép tham gia ngay
        if (contest.isPublic() == true && contest.getStatus() == Contest.ContestStatus.ONGOING) {
            return true;
        }

        // Nếu là cuộc thi private, kiểm tra đăng ký
        return contestRegistrationRepository
                .findByContestIdAndUserId(contestId, userId)
                .map(registration -> registration.getStatus() == ContestRegistration.RegistrationStatus.APPROVED)
                .orElse(false);
    }

    /**
     * Updates contest score for a user
     * Cập nhật điểm cuộc thi cho người dùng
     * 
     * Process / Quy trình:
     * 1. Find/Create registration / Tìm/Tạo đăng ký
     * 2. Calculate scores / Tính toán điểm số
     * 3. Update total score / Cập nhật tổng điểm
     */
    @Transactional
    public void updateContestScore(Long contestId, Long userId, Long problemId, Double score) {
        log.debug("Cập nhật điểm cho cuộc thi ID: {}, user ID: {}, problem ID: {}, điểm: {}", 
                contestId, userId, problemId, score);
        
        // Tìm thông tin cuộc thi
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + contestId));

        // Tìm thông tin người dùng
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + userId));

        // Tìm hoặc tạo đăng ký cho user
        ContestRegistration registration = contestRegistrationRepository
                .findByContestIdAndUserId(contestId, userId)
                .orElseGet(() -> {
                    // Tạo đăng ký mới
                    ContestRegistration newRegistration = new ContestRegistration();
                    newRegistration.setContest(contest);
                    newRegistration.setUser(user);
                    newRegistration.setRegisteredAt(LocalDateTime.now());
                    newRegistration.setTotalScore(0.0);
                    
                    // Nếu là cuộc thi public và đang diễn ra, tự động approve
                    if (contest.isPublic() && contest.getStatus() == Contest.ContestStatus.ONGOING) {
                        newRegistration.setStatus(ContestRegistration.RegistrationStatus.APPROVED);
                    } else {
                        newRegistration.setStatus(ContestRegistration.RegistrationStatus.PENDING);
                    }
                    
                    return contestRegistrationRepository.save(newRegistration);
                });
        
        // Lấy điểm tối đa cho bài toán này từ submission của user
        List<Submission> submissions = submissionRepository
                .findByContestIdAndUserIdAndProblemIdOrderByScoreDescSubmittedAtAsc(contestId, userId, problemId);
        
        if (submissions.isEmpty()) {
            log.debug("Không tìm thấy bài nộp nào cho bài toán {} của user {} trong cuộc thi {}", 
                    problemId, userId, contestId);
            return;
        }
        
        // Sử dụng điểm số mới nhất và cao nhất
        Double highestScore = score;
        
        // Tính tổng điểm cho tất cả các bài toán user đã giải trong cuộc thi
        List<Submission> allUserContestSubmissions = submissionRepository
                .findByContestIdAndUserIdOrderBySubmittedAtDesc(contestId, userId);
        
        // Dùng Map để theo dõi điểm số cao nhất cho mỗi bài toán
        Map<Long, Double> problemScores = new HashMap<>();
        
        // Đặt điểm cho bài toán hiện tại
        problemScores.put(problemId, highestScore);
        
        // Thêm điểm cao nhất của các bài toán khác đã giải
        for (Submission submission : allUserContestSubmissions) {
            Long subProblemId = submission.getProblem().getId();
            if (!problemId.equals(subProblemId) && submission.getScore() != null) {
                problemScores.put(subProblemId, 
                        Math.max(problemScores.getOrDefault(subProblemId, 0.0), submission.getScore()));
            }
        }
        
        // Tính tổng điểm
        double totalScore = problemScores.values().stream().mapToDouble(Double::doubleValue).sum();
        
        // Cập nhật điểm tổng cho registration
        registration.setTotalScore(totalScore);
        contestRegistrationRepository.save(registration);
        
        log.info("Đã cập nhật điểm cho user {} trong cuộc thi {} thành {}", 
                userId, contestId, totalScore);
    }

    private ContestDTO convertToDTO(Contest contest) {
        ContestDTO dto = modelMapper.map(contest, ContestDTO.class);
        
        // Only include non-deleted problems in problemIds
        if (contest.getProblems() != null) {
            List<Long> problemIds = contest.getProblems().stream()
                    .filter(problem -> !problem.isDeleted())
                    .map(Problem::getId)
                    .collect(Collectors.toList());
            dto.setProblemIds(problemIds);
        }
        
        dto.setCreatedById(contest.getCreatedBy().getId());
        // Đảm bảo các trường thời gian được chuyển đổi đúng
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setPublic(contest.isPublic()); // Sửa lại: không đảo ngược giá trị
        
        // Tính số người tham gia hiện tại (đã được duyệt)
        long approvedCount = contestRegistrationRepository.countByContestIdAndStatus(
                contest.getId(), ContestRegistration.RegistrationStatus.APPROVED);
        dto.setCurrentParticipants((int) approvedCount);
        
        return dto;
    }

    private ContestRegistrationDTO convertToRegistrationDTO(ContestRegistration registration) {
        ContestRegistrationDTO dto = modelMapper.map(registration, ContestRegistrationDTO.class);
        dto.setContestId(registration.getContest().getId());
        dto.setUserId(registration.getUser().getId());
        
        // Thêm thông tin người dùng
        User user = registration.getUser();
        if (user != null) {
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
        }
        
        return dto;
    }

    /**
     * Validates contest data before saving
     * Kiểm tra dữ liệu cuộc thi trước khi lưu
     * 
     * Checks / Kiểm tra:
     * - Time validity / Tính hợp lệ thời gian
     * - Participant limit / Giới hạn người tham gia
     * - Status validity / Tính hợp lệ trạng thái
     */
    private void validateContestDTO(ContestDTO contestDTO) {
        if (contestDTO.getStartTime() == null || contestDTO.getEndTime() == null) {
            throw new IllegalArgumentException("Thời gian bắt đầu và kết thúc là bắt buộc");
        }
        if (contestDTO.getEndTime().isBefore(contestDTO.getStartTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
        if (contestDTO.getMaxParticipants() != null && contestDTO.getMaxParticipants() <= 0) {
            throw new IllegalArgumentException("Số lượng người tham gia tối đa phải lớn hơn 0");
        }
    }

    /**
     * Lấy danh sách các bài toán có thể thêm vào cuộc thi
     * @param contestId ID của cuộc thi
     * @return Danh sách các bài toán có thể thêm vào
     */
    @Transactional(readOnly = true)
    public List<ProblemDTO> getAvailableProblemsForContest(Long contestId) {
        log.debug("Lấy danh sách bài toán có thể thêm vào cuộc thi ID: {}", contestId);
        
        // Kiểm tra cuộc thi tồn tại
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + contestId));
        
        // Lấy danh sách ID các bài toán đã có trong cuộc thi
        Set<Long> existingProblemIds = contest.getProblems().stream()
                .filter(problem -> !problem.isDeleted()) // Only consider non-deleted problems
                .map(Problem::getId)
                .collect(Collectors.toSet());
        
        // Lấy tất cả bài toán chưa bị xoá và lọc ra những bài toán chưa có trong cuộc thi
        List<Problem> availableProblems = problemRepository.findAllActive().stream()
                .filter(problem -> !existingProblemIds.contains(problem.getId()))
                .collect(Collectors.toList());
        
        // Chuyển đổi sang DTO và trả về
        return availableProblems.stream()
                .map(this::convertToProblemDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Chuyển đổi Problem entity sang ProblemDTO
     * @param problem Problem entity cần chuyển đổi
     * @return ProblemDTO đã được chuyển đổi
     */
    private ProblemDTO convertToProblemDTO(Problem problem) {
        if (problem == null) {
            return null;
        }
        
        ProblemDTO dto = modelMapper.map(problem, ProblemDTO.class);
        
        // Chuyển đổi topics nếu cần
        if (problem.getTopics() != null) {
            dto.setTopics(new HashSet<>(problem.getTopics()));
        } else {
            dto.setTopics(new HashSet<>());
        }
        
        // Chuyển đổi contestIds nếu cần
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
     * Lấy danh sách các cuộc thi do người dùng cụ thể tạo ra
     * @param userId ID của người dùng cần lấy danh sách cuộc thi
     * @return Danh sách các cuộc thi do người dùng tạo ra
     */
    @Transactional(readOnly = true)
    public List<ContestDTO> getContestsByCreatedBy(Long userId) {
        log.debug("Lấy danh sách cuộc thi do người dùng ID: {} tạo", userId);
        
        // Tìm user
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + userId));
        
        // Lấy danh sách cuộc thi theo người tạo
        List<Contest> contests = contestRepository.findByCreatedBy(creator);
        
        // Chuyển đổi sang DTO và trả về
        return contests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Updates contest status based on time
     * Cập nhật trạng thái cuộc thi dựa trên thời gian
     * 
     * States / Trạng thái:
     * - UPCOMING: Before start / Chưa bắt đầu
     * - ONGOING: In progress / Đang diễn ra
     * - COMPLETED: Finished / Đã kết thúc
     */
    @Transactional
    public void updateContestStatus(Contest contest) {
        LocalDateTime now = LocalDateTime.now();
        
        // Chỉ cập nhật trạng thái cho các trạng thái tự động
        if (contest.getStatus() == Contest.ContestStatus.UPCOMING ||
            contest.getStatus() == Contest.ContestStatus.ONGOING) {
            
            if (now.isBefore(contest.getStartTime())) {
                contest.setStatus(Contest.ContestStatus.UPCOMING);
            } else if (now.isAfter(contest.getStartTime()) && now.isBefore(contest.getEndTime())) {
                contest.setStatus(Contest.ContestStatus.ONGOING);
            } else if (now.isAfter(contest.getEndTime())) {
                contest.setStatus(Contest.ContestStatus.COMPLETED);
            }
            
            contestRepository.save(contest);
        }
    }

    @Transactional
    public void updateAllContestStatuses() {
        List<Contest> contests = contestRepository.findAll();
        for (Contest contest : contests) {
            updateContestStatus(contest);
        }
    }

    private void validateContestStatus(String status) {
        if (status != null) {
            try {
                Contest.ContestStatus newStatus = Contest.ContestStatus.valueOf(status);
                // Cho phép DRAFT, CANCELLED, READY và UPCOMING
                if (newStatus != Contest.ContestStatus.DRAFT && 
                    newStatus != Contest.ContestStatus.CANCELLED &&
                    newStatus != Contest.ContestStatus.READY &&
                    newStatus != Contest.ContestStatus.UPCOMING) {
                    throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
                }
            } catch (IllegalArgumentException e) {
                log.error("Trạng thái cuộc thi không hợp lệ: {}", status);
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status);
            }
        }
    }

    /**
     * Determines contest status based on time and requested status
     * Xác định trạng thái cuộc thi dựa trên thời gian và yêu cầu
     * 
     * Rules / Quy tắc:
     * - Manual states: DRAFT, CANCELLED / Trạng thái thủ công: DRAFT, CANCELLED
     * - Auto states: UPCOMING, ONGOING, COMPLETED / Trạng thái tự động: UPCOMING, ONGOING, COMPLETED
     */
    private Contest.ContestStatus determineContestStatus(Contest.ContestStatus requestedStatus, LocalDateTime startTime, LocalDateTime endTime) {
        if (requestedStatus == Contest.ContestStatus.DRAFT || 
            requestedStatus == Contest.ContestStatus.CANCELLED ||
            requestedStatus == Contest.ContestStatus.UPCOMING) {
            return requestedStatus;
        }

        // Nếu trạng thái là READY, tự động xác định trạng thái dựa vào thời gian
        LocalDateTime now = LocalDateTime.now();
        
        if (endTime.isBefore(now)) {
            return Contest.ContestStatus.COMPLETED;
        } else if (startTime.isBefore(now)) {
            return Contest.ContestStatus.ONGOING;
        } else {
            return Contest.ContestStatus.UPCOMING;
        }
    }
}