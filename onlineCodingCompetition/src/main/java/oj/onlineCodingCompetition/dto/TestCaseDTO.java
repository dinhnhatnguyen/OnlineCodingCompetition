package oj.onlineCodingCompetition.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestCaseDTO {
    private Long id;

    private Long problemId;

    @NotBlank(message = "Input is required")
    private String input;

    @NotBlank(message = "Expected output is required")
    private String expectedOutput;

    private Boolean isExample = false;
    private Boolean isHidden = false;

    @Min(value = 100, message = "Time limit must be at least 100ms")
    private Integer timeLimit = 1000; // Default: 1000ms

    @Min(value = 1024, message = "Memory limit must be at least 1MB (1024KB)")
    private Integer memoryLimit = 262144; // Default: 256MB in KB

    @Min(value = 0, message = "Order must be non-negative")
    private Integer order = 0;
}