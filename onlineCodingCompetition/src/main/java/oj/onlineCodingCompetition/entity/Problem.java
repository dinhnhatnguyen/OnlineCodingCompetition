package oj.onlineCodingCompetition.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.utils.FunctionSignatureJsonConverter;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "problems")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "difficulty")
    private String difficulty; // Ví dụ: EASY, MEDIUM, HARD

    @ElementCollection
    @CollectionTable(name = "problem_supported_languages", joinColumns = @JoinColumn(name = "problem_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "is_supported")
    private Map<String, Boolean> supportedLanguages; // Ví dụ: { "java": true, "python": true }

    @ElementCollection
    @CollectionTable(name = "problem_function_signatures", joinColumns = @JoinColumn(name = "problem_id"))
    @MapKeyColumn(name = "language")
    @Column(name = "signature", columnDefinition = "text") // Changed from jsonb to text
    @Convert(converter = FunctionSignatureJsonConverter.class)
    private Map<String, FunctionSignature> functionSignatures;
//    @ElementCollection
//    @CollectionTable(name = "problem_function_signatures", joinColumns = @JoinColumn(name = "problem_id"))
//    @MapKeyColumn(name = "language")
//    @Column(name = "signature", columnDefinition = "jsonb")
//    @Convert(converter = FunctionSignatureJsonConverter.class)
//    private Map<String, FunctionSignature> functionSignatures;// JSON chứa functionName, parameterTypes, returnType

    @ElementCollection
    @CollectionTable(name = "problem_topics", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "topic")
    private Set<String> topics;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestCase> testCases;

    @Column(name = "constraints", columnDefinition = "TEXT")
    private String constraints;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();


    @Column(name = "default_time_limit")
    private Integer defaultTimeLimit = 5000;

    @Column(name = "default_memory_limit")
    private Integer defaultMemoryLimit = 262144;

    @Column(name = "contest_id")
    private Long contestId;

    @ManyToMany
    @JoinTable(
            name = "contest_problems",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "contest_id")
    )
    private List<Contest> contests = new ArrayList<>();

    // Nested class for function signature (optional, dùng để parse JSON)
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FunctionSignature {
        private String functionName;
        private List<String> parameterTypes;
        private String returnType;

        // Add toString method to help with debugging
        @Override
        public String toString() {
            return "FunctionSignature{" +
                    "functionName='" + functionName + '\'' +
                    ", parameterTypes=" + parameterTypes +
                    ", returnType='" + returnType + '\'' +
                    '}';
        }
    }
}