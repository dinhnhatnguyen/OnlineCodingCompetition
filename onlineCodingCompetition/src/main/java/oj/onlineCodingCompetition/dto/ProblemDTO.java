package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Difficulty is required")
    @Pattern(regexp = "^(easy|medium|hard)$", message = "Difficulty must be 'easy', 'medium', or 'hard'")
    private String difficulty;

    @NotNull(message = "Topics list cannot be null")
    private List<String> topics = new ArrayList<>();

    private String constraints;
    private String inputFormat;
    private String outputFormat;
    private String examples;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
}