package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "contest_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "contest_id")
    private Contest contest;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt = LocalDateTime.now();
}
