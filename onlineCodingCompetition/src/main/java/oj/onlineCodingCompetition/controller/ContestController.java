package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.dto.MessageResponse;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.security.service.UserDetailsImpl;
import oj.onlineCodingCompetition.service.ContestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller class for managing programming contests
 * Lớp controller để quản lý các cuộc thi lập trình
 *
 * This controller handles all contest-related operations including:
 * Controller này xử lý tất cả các hoạt động liên quan đến cuộc thi bao gồm:
 * - Contest CRUD operations (Các thao tác CRUD cho cuộc thi)
 * - Contest registration management (Quản lý đăng ký cuộc thi)
 * - Leaderboard functionality (Chức năng bảng xếp hạng)
 */
@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contest ", description = "API để quản lý Contest")
public class ContestController {

    private final ContestService contestService;
    private final UserRepository userRepository;

    /**
     * Retrieves all contests
     * Lấy tất cả các cuộc thi
     *
     * @return List of all contests (Danh sách tất cả các cuộc thi)
     */
    @GetMapping
    public ResponseEntity<List<ContestDTO>> getAllContests() {
        log.debug("Yêu cầu lấy tất cả cuộc thi");
        return ResponseEntity.ok(contestService.getAllContests());
    }

    /**
     * Retrieves paginated list of contests
     * Lấy danh sách cuộc thi theo trang
     *
     * @param pageable Pagination information (Thông tin phân trang)
     * @return Page of contests (Trang chứa danh sách cuộc thi)
     */
    @GetMapping("/page")
    public ResponseEntity<Page<ContestDTO>> getContestsPage(Pageable pageable) {
        log.debug("Yêu cầu lấy danh sách cuộc thi theo trang");
        return ResponseEntity.ok(contestService.getContestsPage(pageable));
    }

    /**
     * Retrieves a specific contest by its ID
     * Lấy thông tin cuộc thi theo ID
     *
     * @param id Contest ID (ID của cuộc thi)
     * @return Contest information (Thông tin cuộc thi)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable Long id) {
        log.debug("Yêu cầu lấy cuộc thi với ID: {}", id);
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    /**
     * Retrieves the leaderboard for a specific contest
     * Lấy bảng xếp hạng cho một cuộc thi cụ thể
     *
     * @param id Contest ID (ID của cuộc thi)
     * @return List of contest registrations sorted by score (Danh sách đăng ký cuộc thi được sắp xếp theo điểm)
     */
    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<ContestRegistrationDTO>> getLeaderboard(@PathVariable Long id) {
        log.debug("Yêu cầu lấy bảng xếp hạng cho cuộc thi ID: {}", id);
        return ResponseEntity.ok(contestService.getLeaderboard(id));
    }

    /**
     * Retrieves all registrations for a contest (Admin/Instructor only)
     * Lấy tất cả đăng ký cho một cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Contest ID (ID của cuộc thi)
     * @return List of contest registrations (Danh sách đăng ký cuộc thi)
     */
    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ContestRegistrationDTO>> getRegistrations(@PathVariable Long id) {
        log.debug("Yêu cầu lấy danh sách đăng ký cho cuộc thi ID: {}", id);
        return ResponseEntity.ok(contestService.getRegistrations(id));
    }

    /**
     * Creates a new contest (Admin/Instructor only)
     * Tạo một cuộc thi mới (Chỉ dành cho Admin/Giảng viên)
     *
     * @param contestDTO Contest data (Dữ liệu cuộc thi)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Created contest information (Thông tin cuộc thi đã tạo)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ContestDTO> createContest(
            @Valid @RequestBody ContestDTO contestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu tạo cuộc thi: {} bởi user: {}", contestDTO.getTitle(), userDetails.getUsername());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        ContestDTO createdContest = contestService.createContest(contestDTO, user.getId());
        return new ResponseEntity<>(createdContest, HttpStatus.CREATED);
    }

    /**
     * Updates an existing contest (Admin/Instructor only)
     * Cập nhật một cuộc thi đã tồn tại (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Contest ID (ID của cuộc thi)
     * @param contestDTO Updated contest data (Dữ liệu cuộc thi cập nhật)
     * @return Updated contest information (Thông tin cuộc thi đã cập nhật)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ContestDTO> updateContest(
            @PathVariable Long id,
            @Valid @RequestBody ContestDTO contestDTO) {
        log.debug("Yêu cầu cập nhật cuộc thi với ID: {}", id);
        return ResponseEntity.ok(contestService.updateContest(id, contestDTO));
    }

    /**
     * Deletes a contest (Admin or contest creator only)
     * Xóa một cuộc thi (Chỉ dành cho Admin hoặc người tạo cuộc thi)
     *
     * @param id Contest ID (ID của cuộc thi)
     * @param authentication Current user authentication (Thông tin xác thực người dùng hiện tại)
     * @return Response message (Thông báo phản hồi)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @contestService.isContestCreator(#id, authentication.principal.id)")
    public ResponseEntity<?> deleteContest(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = ((UserDetailsImpl) authentication.getPrincipal()).getId();
            contestService.deleteContest(id, userId);
            return ResponseEntity.ok()
                    .body(new MessageResponse("Cuộc thi đã được xóa thành công"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Có lỗi xảy ra khi xóa cuộc thi"));
        }
    }

    /**
     * Registers a user for a contest
     * Đăng ký người dùng cho một cuộc thi
     *
     * @param id Contest ID (ID của cuộc thi)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Registration information (Thông tin đăng ký)
     */
    @PostMapping("/{id}/register")
    public ResponseEntity<ContestRegistrationDTO> registerUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu đăng ký user cho cuộc thi ID: {}", id);

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return ResponseEntity.ok(contestService.registerUser(id, user.getId()));
    }

    /**
     * Approves a contest registration (Admin/Instructor only)
     * Phê duyệt đăng ký cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param registrationId Registration ID (ID đăng ký)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     */
    @PostMapping("/registrations/{registrationId}/approve")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> approveRegistration(@PathVariable Long registrationId) {
        log.debug("Yêu cầu duyệt đăng ký với ID: {}", registrationId);
        contestService.approveRegistration(registrationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Rejects a contest registration (Admin/Instructor only)
     * Từ chối đăng ký cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param registrationId Registration ID (ID đăng ký)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     */
    @PostMapping("/registrations/{registrationId}/reject")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> rejectRegistration(@PathVariable Long registrationId) {
        log.debug("Yêu cầu từ chối đăng ký với ID: {}", registrationId);
        contestService.rejectRegistration(registrationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Retrieves all problems that can be added to a contest (Admin/Instructor only)
     * Lấy tất cả các bài toán có thể thêm vào cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param contestId Contest ID (ID của cuộc thi)
     * @return List of available problems (Danh sách các bài toán có sẵn)
     */
    @GetMapping("/{contestId}/available-problems")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ProblemDTO>> getAvailableProblems(@PathVariable Long contestId) {
        log.debug("Yêu cầu lấy tất cả bài toán có thể thêm vào cuộc thi ID: {}", contestId);
        return ResponseEntity.ok(contestService.getAvailableProblemsForContest(contestId));
    }

    /**
     * Retrieves all contests created by the current user (Admin/Instructor only)
     * Lấy tất cả các cuộc thi do người dùng hiện tại tạo (Chỉ dành cho Admin/Giảng viên)
     *
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return List of contests created by the user (Danh sách cuộc thi do người dùng tạo)
     */
    @GetMapping("/my-contests")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ContestDTO>> getMyContests(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu lấy cuộc thi do người dùng hiện tại tạo");
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));
        return ResponseEntity.ok(contestService.getContestsByCreatedBy(user.getId()));
    }

    /**
     * Gets contest by contest code
     * Lấy cuộc thi theo mã cuộc thi
     *
     * @param contestCode Contest code (Mã cuộc thi)
     * @return Contest details (Thông tin cuộc thi)
     */
    @GetMapping("/code/{contestCode}")
    public ResponseEntity<ContestDTO> getContestByCode(@PathVariable String contestCode) {
        log.debug("Yêu cầu lấy cuộc thi theo mã: {}", contestCode);
        return ResponseEntity.ok(contestService.getContestByCode(contestCode));
    }

    /**
     * Registers user for contest using contest code
     * Đăng ký người dùng vào cuộc thi bằng mã cuộc thi
     *
     * @param contestCode Contest code (Mã cuộc thi)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Registration details (Thông tin đăng ký)
     */
    @PostMapping("/code/{contestCode}/register")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN','USER')")
    public ResponseEntity<ContestRegistrationDTO> registerByCode(
            @PathVariable String contestCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu đăng ký cuộc thi bằng mã: {} cho user: {}", contestCode, userDetails != null ? userDetails.getUsername() : "null");
        log.debug("User authorities: {}", userDetails != null ? userDetails.getAuthorities() : "null");

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return ResponseEntity.ok(contestService.registerUserByCode(contestCode, user.getId()));
    }

    /**
     * Gets current user's contest registrations
     * Lấy danh sách đăng ký cuộc thi của người dùng hiện tại
     *
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return List of user's contest registrations (Danh sách đăng ký cuộc thi của người dùng)
     */
    @GetMapping("/my-registrations")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN','USER')")
    public ResponseEntity<List<ContestRegistrationDTO>> getMyRegistrations(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu lấy danh sách đăng ký cuộc thi của user: {}", userDetails.getUsername());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return ResponseEntity.ok(contestService.getUserRegistrations(user.getId()));
    }

    /**
     * Removes a problem from a contest (Admin/Instructor only)
     * Xóa một bài toán khỏi cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param contestId Contest ID (ID của cuộc thi)
     * @param problemId Problem ID (ID của bài toán)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Response message (Thông báo phản hồi)
     */
    @DeleteMapping("/{contestId}/problems/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> removeProblemFromContest(
            @PathVariable Long contestId,
            @PathVariable Long problemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu xóa bài toán {} khỏi cuộc thi {}", problemId, contestId);
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

            contestService.removeProblemFromContest(contestId, problemId, user.getId());
            return ResponseEntity.ok()
                    .body(new MessageResponse("Đã xóa bài toán khỏi cuộc thi thành công"));
        } catch (IllegalStateException e) {
            log.error("Cannot remove problem from contest: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse(e.getMessage()));
        } catch (EntityNotFoundException e) {
            log.error("Contest or problem not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error removing problem from contest", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Có lỗi xảy ra khi xóa bài toán khỏi cuộc thi"));
        }
    }
}