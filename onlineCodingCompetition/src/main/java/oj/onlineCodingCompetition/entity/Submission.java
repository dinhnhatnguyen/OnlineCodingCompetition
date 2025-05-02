package oj.onlineCodingCompetition.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private Contest contest;

    private String language; // python, javascript, java, cpp

    @Column(columnDefinition = "TEXT")
    private String code;

    private String status; // accepted, wrong_answer, time_limit_exceeded, etc.

    private Integer runtime; // in milliseconds

    private Integer memory; // in KB

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
