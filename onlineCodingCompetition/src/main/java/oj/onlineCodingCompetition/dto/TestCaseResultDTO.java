package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.entity.TestCaseResult;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResultDTO {
    private Long id;
    private Long submissionId;
    private Long testCaseId;
    private String status;
    private Integer runtimeMs;
    private Integer memoryUsedKb;
    private String userOutput;
    private String errorMessage;
    private Boolean isHidden = false;
    private Double score;
    private String input;
    private String expectedOutput;
} 