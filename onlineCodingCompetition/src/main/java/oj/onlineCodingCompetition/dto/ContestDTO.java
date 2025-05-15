package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.entity.Problem;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Problems list cannot be null")
    private List<Problem> problems = new ArrayList<>();


    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isActive;
    private Long createdById;
    private String createdByUsername;
    private LocalDateTime createdAt;
}
