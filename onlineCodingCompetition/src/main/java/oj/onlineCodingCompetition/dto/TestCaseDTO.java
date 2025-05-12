package oj.onlineCodingCompetition.dto;

import lombok.Data;

@Data
public class TestCaseDTO {
    private Long id;
    private Long problemId;
    private String inputData;
    private String expectedOutputData;
    private String inputType;
    private String outputType;
    private String description;
    private Long dependsOn;
    private Boolean isExample;
    private Boolean isHidden;
    private Integer timeLimit;
    private Integer memoryLimit;
    private Double weight;
    private Integer testOrder;
    private String comparisonMode;
    private Double epsilon;
}