package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemTranslationDTO {
    private Long id;
    private Long problemId;
    private String language;
    private String title;
    private String description;
    private String constraints;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
