package oj.onlineCodingCompetition.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponseDTO {
    private String output;
    private String error;
    private String executionStatus;
    private Integer statusCode;
    private Integer runtimeMs;
    private Integer memoryUsedKb;  // SUCCESS, RUNTIME_ERROR, TIMEOUT, etc.
}
