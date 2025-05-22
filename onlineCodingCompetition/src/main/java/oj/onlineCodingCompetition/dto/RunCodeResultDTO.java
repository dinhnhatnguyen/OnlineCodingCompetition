package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RunCodeResultDTO {
    private String status; // "SUCCESS", "ERROR", "COMPILE_ERROR" 
    private List<TestCaseRunResultDTO> results;
    private String compileError;
    private Integer runtime;
    private Integer memory;
} 