package oj.onlineCodingCompetition.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO cho yêu cầu chạy mã.
 */
@Data
public class RunCodeRequestDTO {
    @NotBlank(message = "Mã nguồn không được để trống")
    private String code;

    @NotBlank(message = "Ngôn ngữ không được để trống")
    private String language;

    private String input;
    private String inputFormat;
    private Integer timeLimit;
    private Integer memoryLimit;
}