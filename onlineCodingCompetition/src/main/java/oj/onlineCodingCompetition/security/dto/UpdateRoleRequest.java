package oj.onlineCodingCompetition.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    @NotBlank(message = "Role không được để trống")
    private String role;
} 