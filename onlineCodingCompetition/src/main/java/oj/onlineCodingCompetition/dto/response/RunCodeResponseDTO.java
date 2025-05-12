package oj.onlineCodingCompetition.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for code execution responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RunCodeResponseDTO {

    /**
     * The standard output from the program execution
     */
    private String output;

    /**
     * The standard error output from the program execution
     */
    private String errorOutput;

    /**
     * The status of the execution (SUCCESS, COMPILATION_ERROR, RUNTIME_ERROR, etc.)
     */
    private String status;

    /**
     * The execution time in milliseconds
     */
    private Integer executionTime;

    /**
     * The memory used in kilobytes
     */
    private Integer memoryUsed;
}