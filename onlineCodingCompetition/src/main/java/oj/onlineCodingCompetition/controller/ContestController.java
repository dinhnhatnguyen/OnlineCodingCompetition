package oj.onlineCodingCompetition.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
import oj.onlineCodingCompetition.dto.ContestRegistrationDTO;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.ContestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
@Slf4j
public class ContestController {

    private final ContestService contestService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ContestDTO>> getAllContests() {
        log.debug("Yêu cầu lấy tất cả cuộc thi");
        return ResponseEntity.ok(contestService.getAllContests());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ContestDTO>> getContestsPage(Pageable pageable) {
        log.debug("Yêu cầu lấy danh sách cuộc thi theo trang");
        return ResponseEntity.ok(contestService.getContestsPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestDTO> getContestById(@PathVariable Long id) {
        log.debug("Yêu cầu lấy cuộc thi với ID: {}", id);
        return ResponseEntity.ok(contestService.getContestById(id));
    }

    @GetMapping("/{id}/leaderboard")
    public ResponseEntity<List<ContestRegistrationDTO>> getLeaderboard(@PathVariable Long id) {
        log.debug("Yêu cầu lấy bảng xếp hạng cho cuộc thi ID: {}", id);
        return ResponseEntity.ok(contestService.getLeaderboard(id));
    }

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

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ContestDTO> updateContest(
            @PathVariable Long id,
            @Valid @RequestBody ContestDTO contestDTO) {
        log.debug("Yêu cầu cập nhật cuộc thi với ID: {}", id);
        return ResponseEntity.ok(contestService.updateContest(id, contestDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteContest(@PathVariable Long id) {
        log.debug("Yêu cầu xóa cuộc thi với ID: {}", id);
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ContestRegistrationDTO> registerUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu đăng ký user cho cuộc thi ID: {}", id);

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        return ResponseEntity.ok(contestService.registerUser(id, user.getId()));
    }

    @PostMapping("/registrations/{registrationId}/approve")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> approveRegistration(@PathVariable Long registrationId) {
        log.debug("Yêu cầu duyệt đăng ký với ID: {}", registrationId);
        contestService.approveRegistration(registrationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registrations/{registrationId}/reject")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> rejectRegistration(@PathVariable Long registrationId) {
        log.debug("Yêu cầu từ chối đăng ký với ID: {}", registrationId);
        contestService.rejectRegistration(registrationId);
        return ResponseEntity.ok().build();
    }
}