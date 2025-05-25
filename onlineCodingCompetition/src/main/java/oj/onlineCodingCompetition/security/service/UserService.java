package oj.onlineCodingCompetition.security.service;

import oj.onlineCodingCompetition.security.dto.ChangePasswordRequest;
import oj.onlineCodingCompetition.security.dto.ResetPasswordRequest;
import oj.onlineCodingCompetition.security.dto.UpdateProfileRequest;
import oj.onlineCodingCompetition.security.dto.UserProfileResponse;
import oj.onlineCodingCompetition.security.dto.UpdateRoleRequest;
import java.util.List;

public interface UserService {
    
    /**
     * Get user profile information by ID
     * 
     * @param userId the ID of the user
     * @return user profile information
     */
    UserProfileResponse getUserProfile(Long userId);
    
    /**
     * Update user profile information
     * 
     * @param userId the ID of the user
     * @param request the update profile request
     * @return updated user profile information
     */
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    
    /**
     * Change user password
     * 
     * @param userId the ID of the user
     * @param request the change password request
     * @return true if password changed successfully
     */
    boolean changePassword(Long userId, ChangePasswordRequest request);
    
    /**
     * Reset user password using captcha verification
     * 
     * @param request the reset password request with captcha token
     * @return true if password reset successfully
     */
    boolean resetPassword(ResetPasswordRequest request);

    /**
     * Get all users in the system
     * 
     * @return list of all users
     */
    List<UserProfileResponse> getAllUsers();

    /**
     * Update user role
     * 
     * @param userId the ID of the user to update
     * @param request the update role request
     * @return updated user profile
     */
    UserProfileResponse updateUserRole(Long userId, UpdateRoleRequest request);
} 