package oj.onlineCodingCompetition.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller class for testing role-based access control
 * Lớp controller để kiểm tra kiểm soát truy cập dựa trên vai trò
 *
 * This controller provides test endpoints for different access levels:
 * Controller này cung cấp các điểm cuối kiểm tra cho các mức truy cập khác nhau:
 * - Public access (Truy cập công khai)
 * - User-level access (Truy cập cấp người dùng)
 * - Instructor-level access (Truy cập cấp giảng viên)
 * - Admin-level access (Truy cập cấp quản trị viên)
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

    /**
     * Test endpoint for public access
     * Điểm cuối kiểm tra truy cập công khai
     *
     * @return Public content message (Thông điệp nội dung công khai)
     */
    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    /**
     * Test endpoint for user-level access (Student/Instructor/Admin)
     * Điểm cuối kiểm tra truy cập cấp người dùng (Sinh viên/Giảng viên/Quản trị viên)
     *
     * @return User content message (Thông điệp nội dung người dùng)
     */
    @GetMapping("/user")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public String userAccess() {
        return "User Content.";
    }

    /**
     * Test endpoint for instructor-level access (Instructor/Admin)
     * Điểm cuối kiểm tra truy cập cấp giảng viên (Giảng viên/Quản trị viên)
     *
     * @return Instructor content message (Thông điệp nội dung giảng viên)
     */
    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR') or hasRole('ADMIN')")
    public String instructorAccess() {
        return "Instructor Board.";
    }

    /**
     * Test endpoint for admin-level access
     * Điểm cuối kiểm tra truy cập cấp quản trị viên
     *
     * @return Admin content message (Thông điệp nội dung quản trị viên)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board.";
    }

    /**
     * Test endpoint to check current user authentication and roles
     */
    @GetMapping("/whoami")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> whoAmI(@AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = new HashMap<>();
        response.put("username", userDetails.getUsername());
        response.put("authorities", userDetails.getAuthorities());
        response.put("isEnabled", userDetails.isEnabled());
        response.put("isAccountNonExpired", userDetails.isAccountNonExpired());
        response.put("isAccountNonLocked", userDetails.isAccountNonLocked());
        response.put("isCredentialsNonExpired", userDetails.isCredentialsNonExpired());
        return ResponseEntity.ok(response);
    }
}