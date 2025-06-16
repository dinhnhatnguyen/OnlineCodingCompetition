package oj.onlineCodingCompetition.security.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.security.dto.*;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.security.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    /**
     * Lấy danh sách tất cả người dùng (chỉ admin)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        log.debug("Yêu cầu lấy danh sách tất cả người dùng");
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Cập nhật role của người dùng (chỉ admin)
     */
    @PatchMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request) {
        log.debug("Yêu cầu cập nhật role cho người dùng ID {}: {}", userId, request.getRole());
        return ResponseEntity.ok(userService.updateUserRole(userId, request));
    }

    /**
     * Lấy thông tin người dùng hiện tại (cho Firebase data collection)
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu lấy thông tin người dùng hiện tại: {}", userDetails.getUsername());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        UserInfoDTO userInfo = new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getCreatedAt()
        );

        return ResponseEntity.ok(userInfo);
    }

    /**
     * Lấy thông tin hồ sơ người dùng hiện tại
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Yêu cầu lấy hồ sơ người dùng hiện tại: {}", userDetails.getUsername());

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return ResponseEntity.ok(userService.getUserProfile(user.getId()));
    }

    /**
     * Cập nhật thông tin hồ sơ người dùng hiện tại
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.debug("Yêu cầu cập nhật hồ sơ người dùng: {}", userDetails.getUsername());
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
                
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }

    /**
     * Đổi mật khẩu người dùng hiện tại
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.debug("Yêu cầu đổi mật khẩu cho người dùng: {}", userDetails.getUsername());
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        boolean success = userService.changePassword(user.getId(), request);
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Đổi mật khẩu thành công"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Đổi mật khẩu thất bại"));
        }
    }

    /**
     * Đặt lại mật khẩu người dùng (quên mật khẩu) với captcha
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.debug("Yêu cầu đặt lại mật khẩu cho email: {}", request.getEmail());
        
        try {
            boolean success = userService.resetPassword(request);
            if (success) {
                return ResponseEntity.ok(new MessageResponse("Đặt lại mật khẩu thành công"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Đặt lại mật khẩu thất bại"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
} 