package oj.onlineCodingCompetition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import oj.onlineCodingCompetition.security.entity.User;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "problem_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Problem problem;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reportedBy;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @NotBlank
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank
    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    // Admin response
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reviewedBy;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Soft delete
    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Long deletedBy;

    public enum ReportType {
        INCORRECT_TEST_CASE("Test case không chính xác"),
        UNCLEAR_PROBLEM_STATEMENT("Đề bài không rõ ràng"),
        WRONG_EXPECTED_OUTPUT("Kết quả mong đợi sai"),
        MISSING_CONSTRAINTS("Thiếu ràng buộc"),
        TYPO_OR_GRAMMAR("Lỗi chính tả/ngữ pháp"),
        OTHER("Khác");

        private final String displayName;

        ReportType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum ReportStatus {
        PENDING("Đang chờ xử lý"),
        IN_REVIEW("Đang xem xét"),
        RESOLVED("Đã giải quyết"),
        REJECTED("Từ chối"),
        CLOSED("Đã đóng");

        private final String displayName;

        ReportStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProblemReport that = (ProblemReport) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
