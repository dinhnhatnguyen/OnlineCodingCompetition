package oj.onlineCodingCompetition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProblemWithTestCasesDTO {
    @NotNull(message = "Problem cannot be null")
    @Valid
    private ProblemDTO problem;

    @NotNull(message = "Test cases list cannot be null")
    @Size(min = 2, message = "At least 2 test cases are required")
    @Valid
    private List<TestCaseDTO> testCases;
}