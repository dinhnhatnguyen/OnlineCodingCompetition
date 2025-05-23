package oj.onlineCodingCompetition.security.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Tên người dùng không được để trống")
    @Size(max = 20, message = "Tên người dùng không được vượt quá 20 ký tự")
    private String username;
    
    @NotBlank(message = "Email không được để trống")
    @Size(max = 50, message = "Email không được vượt quá 50 ký tự")
    @Email(message = "Email không hợp lệ")
    private String email;
} 