package oj.onlineCodingCompetition.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContestRegistrationDTO {
    private Long id;
    private Long contestId;
    private Long userId;
    private String username;
    private String email;
    private LocalDateTime registeredAt;
    private String status;
    private Double totalScore;
}