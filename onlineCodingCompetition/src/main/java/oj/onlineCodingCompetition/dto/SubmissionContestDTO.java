package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionContestDTO {
    private Long id;
    
    @NotNull(message = "ID của bài toán không được để trống")
    private Long problemId;
    
    private Long userId;
    
    @NotNull(message = "ID của cuộc thi không được để trống")
    private Long contestId;
    
    @NotNull(message = "Ngôn ngữ lập trình không được để trống")
    @NotEmpty(message = "Ngôn ngữ lập trình không được để trống")
    private String language;
    
    @NotNull(message = "Mã nguồn không được để trống")
    @NotEmpty(message = "Mã nguồn không được để trống")
    private String sourceCode;
    
    private String status;
    private Integer runtimeMs;
    private Integer memoryUsedKb;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String compileError;
    private Integer passedTestCases;
    private Integer totalTestCases;
    private Double score;
    private String executionEnvironment;
}