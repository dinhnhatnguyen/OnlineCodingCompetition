package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemDTO {
    private Long id;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotBlank(message = "Độ khó không được để trống")
    private String difficulty;

    private Set<String> topics;

    @NotEmpty(message = "Danh sách ngôn ngữ hỗ trợ không được để trống")
    private Map<String, Boolean> supportedLanguages;

    private Map<String, FunctionSignatureDTO> functionSignatures;
    private List<TestCaseDTO> testCases;
    private String constraints;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer defaultTimeLimit;
    private Integer defaultMemoryLimit;
    private Long contestId;
    private Set<Long> contestIds;
    private boolean deleted;
    private LocalDateTime deletedAt;
    private Long deletedBy;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunctionSignatureDTO {
        private String functionName;
        private List<String> parameterTypes;
        private String returnType;
    }

}