package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_solved_problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSolvedProblem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "problem_id")
    private Problem problem;
    
    @Column(name = "solved_at")
    private LocalDateTime solvedAt = LocalDateTime.now();
} 