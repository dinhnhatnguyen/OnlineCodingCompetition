package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "contests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @NotNull
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContestStatus status = ContestStatus.DRAFT;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "contest_code", unique = true, length = 8)
    private String contestCode;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdBy;

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<ContestRegistration> registrations = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "contest_problems",
            joinColumns = @JoinColumn(name = "contest_id"),
            inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Problem> problems = new ArrayList<>();

    // Thêm các trường cho soft delete
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    // Chat feature control
    @Column(name = "chat_enabled", nullable = false)
    private boolean chatEnabled = false;

    public enum ContestStatus {
        DRAFT,      // Nháp
        UPCOMING,   // Sắp diễn ra
        ONGOING,    // Đang diễn ra
        COMPLETED,  // Đã kết thúc
        READY, CANCELLED   // Đã huỷ
    }

    // Helper method để lấy problemIds
    public List<Long> getProblemIds() {
        if (this.problems == null) {
            return new ArrayList<>();
        }
        return this.problems.stream()
                .map(Problem::getId)
                .collect(Collectors.toList());
    }

    public Integer getCurrentParticipants() {
        if (this.registrations == null) {
            return 0;
        }
        return (int) this.registrations.stream()
                .filter(r -> r.getStatus() == ContestRegistration.RegistrationStatus.APPROVED)
                .count();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Contest contest = (Contest) o;
        return Objects.equals(id, contest.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}