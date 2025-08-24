package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "problem_translations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "language", nullable = false, length = 10)
    private String language; // "vi", "en", "zh", etc.

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor for easy creation
    public ProblemTranslation(Problem problem, String language, String title, String description, String constraints) {
        this.problem = problem;
        this.language = language;
        this.title = title;
        this.description = description;
        this.constraints = constraints;
        this.createdAt = LocalDateTime.now();
    }
}
