package oj.onlineCodingCompetition.dto.request;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class CodeExecutionRequest {
    private String code;
    private String language;
    private String testInput; // Tùy chọn

    // getters, setters, constructors
}