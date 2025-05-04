package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_cases")
@Data
@NoArgsConstructor
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String input;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String expectedOutput;

    @Column(nullable = false)
    private Boolean isExample = false;

    @Column(nullable = false)
    private Boolean isHidden = false;

    @Column(nullable = false)
    private Integer timeLimit = 1000; // milliseconds

    @Column(nullable = false)
    private Integer memoryLimit = 262144; // KB (256MB default)

    // Fix: Rename column to avoid SQL keyword conflict
    @Column(name = "test_order", nullable = false)
    private Integer testOrder = 0;
}