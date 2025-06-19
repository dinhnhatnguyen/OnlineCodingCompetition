package oj.onlineCodingCompetition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    // Contest information fields
    private String contestTitle;
    private String contestDescription;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime contestStartTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    private LocalDateTime contestEndTime;

    private String contestStatus;
    private boolean contestPublic;
}