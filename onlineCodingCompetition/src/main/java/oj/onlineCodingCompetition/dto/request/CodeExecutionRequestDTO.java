package oj.onlineCodingCompetition.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionRequestDTO {
    private String language;
    private String sourceCode;
    private String input;  // Optional custom input
}
