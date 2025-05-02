package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Problem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    private String difficulty; // easy, medium, hard

    @ElementCollection
    @CollectionTable(name = "problem_topics", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "topic")
    private List<String> topics = new ArrayList<>();

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "input_format", columnDefinition = "TEXT")
    private String inputFormat;

    @Column(name = "output_format", columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "nvarchar(MAX)")
    private String examples;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL)
    private Set<Submission> submissions = new HashSet<>();
}