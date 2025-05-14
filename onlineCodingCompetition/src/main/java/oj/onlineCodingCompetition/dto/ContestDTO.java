package oj.onlineCodingCompetition.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContestDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime createdAt;
    private String status;
    private List<Long> problemIds;
    private Long createdById;
}