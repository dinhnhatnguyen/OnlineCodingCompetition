package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "language", nullable = false)
    private String language;

    @Column(name = "source_code", columnDefinition = "TEXT", nullable = false)
    private String sourceCode;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    @Column(name = "runtime_ms")
    private Integer runtimeMs;

    @Column(name = "memory_used_kb")
    private Integer memoryUsedKb;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "compile_error", columnDefinition = "TEXT")
    private String compileError;

    // Track passed/failed test cases count
    @Column(name = "passed_test_cases")
    private Integer passedTestCases = 0;

    @Column(name = "total_test_cases")
    private Integer totalTestCases = 0;

    @Column(name = "score")
    private Double score;

    @Column(name = "execution_environment")
    private String executionEnvironment;

    @Column(name = "queue_message_id")
    private String queueMessageId;

    public enum SubmissionStatus {
        PENDING,        // Waiting in queue
        PROCESSING,     // Currently being processed
        ACCEPTED,       // All test cases passed
        WRONG_ANSWER,   // At least one test case failed
        RUNTIME_ERROR,  // Error during execution
        TIME_LIMIT_EXCEEDED,  // Execution took too long
        MEMORY_LIMIT_EXCEEDED, // Used too much memory
        COMPILE_ERROR,  // Failed to compile
        SYSTEM_ERROR    // Something went wrong with our system
    }
}