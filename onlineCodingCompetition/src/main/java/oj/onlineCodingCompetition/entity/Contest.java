package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
    private String title;

    private String description;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private ContestStatus status;

    private String difficulty;

    private Integer maxParticipants;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ContestRegistration> registrations = new HashSet<>();

    // THAY ĐỔI: Thay List<Long> problemIds bằng @ManyToMany với Problem
    @ManyToMany(mappedBy = "contests")
    private List<Problem> problems = new ArrayList<>();

    public enum ContestStatus {
        DRAFT, UPCOMING, ONGOING, COMPLETED
    }

    // THAY ĐỔI: Giữ getProblemIds() để tương thích với ContestDTO
    public List<Long> getProblemIds() {
        return problems.stream().map(Problem::getId).collect(Collectors.toList());
    }

    // THAY ĐỔI: setProblemIds() không cần implement, chỉ để tương thích
    public void setProblemIds(List<Long> problemIds) {
        // Không cần ánh xạ, problems sẽ được đặt trực tiếp
    }
}
//public class Contest {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @NotNull
//    @Column(name = "title", nullable = false)
//    private String title;
//
//    @Column(name = "description", columnDefinition = "TEXT")
//    private String description;
//
//    @NotNull
//    @Column(name = "start_time", nullable = false)
//    private LocalDateTime startTime;
//
//    @NotNull
//    @Column(name = "end_time", nullable = false)
//    private LocalDateTime endTime;
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    @NotNull
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", nullable = false)
//    private ContestStatus status = ContestStatus.UPCOMING;
//
//    //Mối quan hệ @ManyToOne với User
//    @NotNull
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "created_by_id", nullable = false)
//    private User createdBy;
//
//    // Danh sách ID bài toán
//    @ElementCollection
//    @CollectionTable(name = "contest_problem_ids", joinColumns = @JoinColumn(name = "contest_id"))
//    @Column(name = "problem_id")
//    private List<Long> problemIds = new ArrayList<>();
//
//    // Mối quan hệ @ManyToMany với Problem
//    @ManyToMany
//    @JoinTable(
//            name = "contest_problems",
//            joinColumns = @JoinColumn(name = "contest_id"),
//            inverseJoinColumns = @JoinColumn(name = "problem_id")
//    )
//    private Set<Problem> problems = new HashSet<>();
//
//    // Mối quan hệ @OneToMany với ContestRegistration
//    @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private Set<ContestRegistration> registrations = new HashSet<>();
//
//    @Column(name = "max_participants")
//    private Integer maxParticipants;
//
//    @Column(name = "is_public")
//    private boolean isPublic = false;
//
//    public enum ContestStatus {
//        DRAFT,          // Cuộc thi chưa được công bố
//        UPCOMING,       // Cuộc thi sắp diễn ra
//        ONGOING,        // Cuộc thi đang diễn ra
//        COMPLETED,      // Cuộc thi đã kết thúc
//        CANCELLED       // Cuộc thi bị hủy
//    }
//
//    // Kiểm tra xem contest có thể đăng ký hay không
//    public boolean isRegistrationOpen() {
//        return status == ContestStatus.UPCOMING &&
//                startTime != null &&
//                startTime.isAfter(LocalDateTime.now()) &&
//                (maxParticipants == null || registrations.size() < maxParticipants);
//    }
//
//    // Kiểm tra xem contest có đang diễn ra hay không
//    public boolean isOngoing() {
//        LocalDateTime now = LocalDateTime.now();
//        return startTime != null && endTime != null &&
//                now.isAfter(startTime) && now.isBefore(endTime);
//    }
//
//    // Kiểm tra xem contest đã hoàn thành chưa
//    public boolean isCompleted() {
//        return endTime != null && LocalDateTime.now().isAfter(endTime);
//    }
//}