package oj.onlineCodingCompetition.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class SubmissionDTO {
    private Long id;
    private Long problemId;
    private Long userId;
    private Long contestId;
    private String language;
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