package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "test_case_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private TestCaseStatus status;

    @Column(name = "runtime_ms")
    private Integer runtimeMs;

    @Column(name = "memory_used_kb")
    private Integer memoryUsedKb;

    @Column(name = "user_output", columnDefinition = "TEXT")
    private String userOutput;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "is_hidden")
    private Boolean isHidden = false;

    @Column(name = "score")
    private Double score;

    public enum TestCaseStatus {
        PASSED,
        FAILED,
        RUNTIME_ERROR,
        TIME_LIMIT_EXCEEDED,
        MEMORY_LIMIT_EXCEEDED,
        COMPILE_ERROR,
        SYSTEM_ERROR
    }
}