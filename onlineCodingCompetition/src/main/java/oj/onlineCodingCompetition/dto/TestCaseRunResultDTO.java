package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseRunResultDTO {
    private Long testCaseId;
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private String status; // "PASSED", "FAILED", "ERROR"
    private Integer runtime;
    private Integer memory;
    private String errorMessage;
} 