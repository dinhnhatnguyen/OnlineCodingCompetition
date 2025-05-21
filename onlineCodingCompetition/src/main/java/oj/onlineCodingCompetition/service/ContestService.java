package oj.onlineCodingCompetition.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.ContestRegistration;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.repository.ContestRegistrationRepository;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContestService {

    private final ContestRepository contestRepository;
    private final ContestRegistrationRepository contestRegistrationRepository;
    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ContestDTO createContest(ContestDTO contestDTO, Long creatorId) {
        log.debug("Tạo cuộc thi mới bởi user ID: {}", creatorId);

        // Kiểm tra người tạo
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy user với ID: " + creatorId));

        // Kiểm tra dữ liệu đầu vào
        validateContestDTO(contestDTO);

        // Tạo entity Contest - KHÔNG sử dụng modelMapper cho toàn bộ đối tượng
        Contest contest = new Contest();
        contest.setTitle(contestDTO.getTitle());
        contest.setDescription(contestDTO.getDescription());
        contest.setStartTime(contestDTO.getStartTime());
        contest.setEndTime(contestDTO.getEndTime());
        contest.setCreatedBy(creator);
        contest.setCreatedAt(LocalDateTime.now());
        contest.setPublic(contestDTO.isPublic());
        contest.setMaxParticipants(contestDTO.getMaxParticipants());

        // Đặt trạng thái mặc định
        if (contestDTO.getStatus() == null) {
            contest.setStatus(Contest.ContestStatus.DRAFT);
        } else {
            try {
                contest.setStatus(Contest.ContestStatus.valueOf(contestDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                log.error("Trạng thái cuộc thi không hợp lệ: {}", contestDTO.getStatus());
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + contestDTO.getStatus());
            }
        }

        // Kiểm tra và thêm bài toán
        List<Problem> problems = List.of();
        if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
            problems = problemRepository.findAllById(contestDTO.getProblemIds());
            if (problems.size() != contestDTO.getProblemIds().size()) {
                log.error("Một số bài toán không tồn tại: {}", contestDTO.getProblemIds());
                throw new IllegalArgumentException("Một hoặc nhiều ID bài toán không hợp lệ");
            }
        }
        contest.setProblems(problems);

        // Log nội dung cuộc thi trước khi lưu để debug
        log.debug("Chuẩn bị lưu cuộc thi: title={}, startTime={}, endTime={}",
                contest.getTitle(), contest.getStartTime(), contest.getEndTime());

        // Lưu cuộc thi
        Contest savedContest = contestRepository.save(contest);
        log.info("Tạo cuộc thi thành công với ID: {}", savedContest.getId());

        return convertToDTO(savedContest);
    }

    @Transactional
    public ContestDTO updateContest(Long id, ContestDTO contestDTO) {
        log.debug("Cập nhật cuộc thi với ID: {}", id);

        // Kiểm tra cuộc thi tồn tại
        Contest existingContest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + id));

        // Kiểm tra dữ liệu đầu vào
        validateContestDTO(contestDTO);

        // Cập nhật thông tin - KHÔNG dùng modelMapper để tránh lỗi
        if (contestDTO.getTitle() != null) {
            existingContest.setTitle(contestDTO.getTitle());
        }
        if (contestDTO.getDescription() != null) {
            existingContest.setDescription(contestDTO.getDescription());
        }

        // Đảm bảo cập nhật các trường thời gian
        existingContest.setStartTime(contestDTO.getStartTime());
        existingContest.setEndTime(contestDTO.getEndTime());
        existingContest.setPublic(contestDTO.isPublic());

        if (contestDTO.getMaxParticipants() != null) {
            existingContest.setMaxParticipants(contestDTO.getMaxParticipants());
        }

        // Cập nhật trạng thái
        if (contestDTO.getStatus() != null) {
            try {
                existingContest.setStatus(Contest.ContestStatus.valueOf(contestDTO.getStatus()));
            } catch (IllegalArgumentException e) {
                log.error("Trạng thái cuộc thi không hợp lệ: {}", contestDTO.getStatus());
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + contestDTO.getStatus());
            }
        }

        // Cập nhật danh sách bài toán
        List<Problem> problems = List.of();
        if (contestDTO.getProblemIds() != null && !contestDTO.getProblemIds().isEmpty()) {
            problems = problemRepository.findAllById(contestDTO.getProblemIds());
            if (problems.size() != contestDTO.getProblemIds().size()) {
                log.error("Một số bài toán không tồn tại: {}", contestDTO.getProblemIds());
                throw new IllegalArgumentException("Một hoặc nhiều ID bài toán không hợp lệ");
            }
            existingContest.setProblems(problems);
        }

        // Log trước khi lưu để debug
        log.debug("Chuẩn bị lưu cập nhật cuộc thi: title={}, startTime={}, endTime={}",
                existingContest.getTitle(), existingContest.getStartTime(), existingContest.getEndTime());

        // Lưu cập nhật
        Contest updatedContest = contestRepository.save(existingContest);
        log.info("Cập nhật cuộc thi thành công với ID: {}", updatedContest.getId());

        return convertToDTO(updatedContest);
    }

    // Các phương thức còn lại giữ nguyên
    @Transactional
    public void deleteContest(Long id) {
        log.debug("Xóa cuộc thi với ID: {}", id);

        // Kiểm tra cuộc thi tồn tại
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy cuộc thi với ID: " + id));

        // Xóa tất cả đăng ký
        contestRegistrationRepository.deleteAll(contest.getRegistrations());
        log.info("Xóa {} đăng ký cho cuộc thi ID: {}", contest.getRegistrations().size(), id);

        // Xóa cuộc thi
        contestRepository.deleteById(id);
        log.info("Xóa cuộc thi thành công với ID: {}", id);
    }

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

        // Kiểm tra đăng ký
        log.debug("Kiểm tra xem user đã đăng ký chưa");
        if (contestRegistrationRepository.findByContestIdAndUserId(contestId, userId).isPresent()) {
            throw new IllegalStateException("User đã đăng ký cho cuộc thi này");
        }

        // Kiểm tra giới hạn người tham gia
        log.debug("Kiểm tra giới hạn người tham gia");
        long approvedCount = contestRegistrationRepository.countByContestIdAndStatus(contestId, ContestRegistration.RegistrationStatus.APPROVED);
        if (contest.getMaxParticipants() != null && approvedCount >= contest.getMaxParticipants()) {
            throw new IllegalStateException("Đã đạt số lượng người tham gia tối đa");
        }

        // Tạo đăng ký
        log.debug("Tạo bản ghi đăng ký mới");
        ContestRegistration registration = new ContestRegistration();
        registration.setContest(contest);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus(ContestRegistration.RegistrationStatus.PENDING);
        registration.setTotalScore(0.0);

        // Lưu đăng ký
        log.debug("Lưu bản ghi đăng ký");
        ContestRegistration savedRegistration = contestRegistrationRepository.save(registration);
        log.info("Đăng ký thành công cho user {} trong cuộc thi {} với ID đăng ký: {}", userId, contestId, savedRegistration.getId());

        // Chuyển đổi DTO
        log.debug("Chuyển đổi sang DTO");
        return convertToRegistrationDTO(savedRegistration);
    }
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

    @Transactional(readOnly = true)
    public List<ContestRegistrationDTO> getLeaderboard(Long contestId) {
        log.debug("Lấy bảng xếp hạng cho cuộc thi ID: {}", contestId);
        return contestRegistrationRepository.findByContestIdOrderByTotalScoreDesc(contestId).stream()
                .map(this::convertToRegistrationDTO)
                .collect(Collectors.toList());
    }

    private ContestDTO convertToDTO(Contest contest) {
        ContestDTO dto = modelMapper.map(contest, ContestDTO.class);
        dto.setProblemIds(contest.getProblemIds());
        dto.setCreatedById(contest.getCreatedBy().getId());
        // Đảm bảo các trường thời gian được chuyển đổi đúng
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        
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
}