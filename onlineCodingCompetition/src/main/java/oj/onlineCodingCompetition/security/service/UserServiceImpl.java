package oj.onlineCodingCompetition.security.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.security.dto.ChangePasswordRequest;
import oj.onlineCodingCompetition.security.dto.ResetPasswordRequest;
import oj.onlineCodingCompetition.security.dto.UpdateProfileRequest;
import oj.onlineCodingCompetition.security.dto.UserProfileResponse;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        log.debug("Lấy thông tin hồ sơ người dùng với ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        return convertToUserProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        log.debug("Cập nhật hồ sơ người dùng với ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra xem username mới đã tồn tại chưa (nếu thay đổi)
        if (!user.getUsername().equals(request.getUsername()) 
                && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên người dùng đã được sử dụng");
        }
        
        // Kiểm tra xem email mới đã tồn tại chưa (nếu thay đổi)
        if (!user.getEmail().equals(request.getEmail()) 
                && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }
        
        // Cập nhật thông tin người dùng
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        User updatedUser = userRepository.save(user);
        log.info("Đã cập nhật hồ sơ người dùng với ID: {}", userId);
        
        return convertToUserProfileResponse(updatedUser);
    }

    @Override
    @Transactional
    public boolean changePassword(Long userId, ChangePasswordRequest request) {
        log.debug("Đổi mật khẩu cho người dùng với ID: {}", userId);
        
        // Validate request
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với ID: " + userId));
        
        // Xác minh mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Đã đổi mật khẩu cho người dùng với ID: {}", userId);
        return true;
    }

    @Override
    @Transactional
    public boolean resetPassword(ResetPasswordRequest request) {
        log.debug("Đặt lại mật khẩu cho email: {}", request.getEmail());
        
        // Validate request
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        // Xác minh captcha (đơn giản hóa - chỉ kiểm tra không trống)
        if (request.getCaptchaToken() == null || request.getCaptchaToken().isBlank()) {
            throw new IllegalArgumentException("Mã captcha không hợp lệ");
        }
        
        // Tìm người dùng bằng email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng với email: " + request.getEmail()));
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Đã đặt lại mật khẩu cho người dùng với email: {}", request.getEmail());
        return true;
    }
    
    // Phương thức helper để chuyển đổi User sang UserProfileResponse
    private UserProfileResponse convertToUserProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
} 