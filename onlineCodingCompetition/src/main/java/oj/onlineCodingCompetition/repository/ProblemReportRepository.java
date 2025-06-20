package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemReport;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemReportRepository extends JpaRepository<ProblemReport, Long> {

    /**
     * Tìm tất cả reports của một problem
     * @param problem Problem entity
     * @param pageable Pagination info
     * @return Page of reports
     */
    @Query("SELECT pr FROM ProblemReport pr WHERE pr.problem = :problem AND pr.deleted = false ORDER BY pr.createdAt DESC")
    Page<ProblemReport> findByProblemAndDeletedFalse(@Param("problem") Problem problem, Pageable pageable);

    /**
     * Tìm reports theo status
     * @param status Report status
     * @param pageable Pagination info
     * @return Page of reports
     */
    @Query("SELECT pr FROM ProblemReport pr WHERE pr.status = :status AND pr.deleted = false ORDER BY pr.createdAt DESC")
    Page<ProblemReport> findByStatusAndDeletedFalse(@Param("status") ProblemReport.ReportStatus status, Pageable pageable);

    /**
     * Tìm tất cả reports (cho admin)
     * @param pageable Pagination info
     * @return Page of reports
     */
    @Query("SELECT pr FROM ProblemReport pr WHERE pr.deleted = false ORDER BY pr.createdAt DESC")
    Page<ProblemReport> findAllAndDeletedFalse(Pageable pageable);

    /**
     * Tìm reports của một user
     * @param user User entity
     * @param pageable Pagination info
     * @return Page of reports
     */
    @Query("SELECT pr FROM ProblemReport pr WHERE pr.reportedBy = :user AND pr.deleted = false ORDER BY pr.createdAt DESC")
    Page<ProblemReport> findByReportedByAndDeletedFalse(@Param("user") User user, Pageable pageable);

    /**
     * Đếm số lượng reports pending
     * @return Number of pending reports
     */
    @Query("SELECT COUNT(pr) FROM ProblemReport pr WHERE pr.status = 'PENDING' AND pr.deleted = false")
    Long countPendingReports();

    /**
     * Đếm số lượng reports của một problem
     * @param problem Problem entity
     * @return Number of reports
     */
    @Query("SELECT COUNT(pr) FROM ProblemReport pr WHERE pr.problem = :problem AND pr.deleted = false")
    Long countByProblemAndDeletedFalse(@Param("problem") Problem problem);

    /**
     * Tìm report theo ID và kiểm tra không bị xóa
     * @param id Report ID
     * @return Optional report
     */
    @Query("SELECT pr FROM ProblemReport pr WHERE pr.id = :id AND pr.deleted = false")
    Optional<ProblemReport> findByIdAndDeletedFalse(@Param("id") Long id);

    /**
     * Kiểm tra user đã report problem này chưa
     * @param problem Problem entity
     * @param user User entity
     * @return true if user already reported this problem
     */
    @Query("SELECT COUNT(pr) > 0 FROM ProblemReport pr WHERE pr.problem = :problem AND pr.reportedBy = :user AND pr.deleted = false")
    boolean existsByProblemAndReportedByAndDeletedFalse(@Param("problem") Problem problem, @Param("user") User user);

    /**
     * Đếm tổng số báo cáo chưa bị xóa
     */
    @Query("SELECT COUNT(pr) FROM ProblemReport pr WHERE pr.deleted = false")
    Long countByDeletedFalse();

    /**
     * Đếm báo cáo theo trạng thái
     */
    @Query("SELECT COUNT(pr) FROM ProblemReport pr WHERE pr.status = :status AND pr.deleted = false")
    Long countByStatusAndDeletedFalse(@Param("status") ProblemReport.ReportStatus status);

    /**
     * Đếm báo cáo theo loại
     */
    @Query("SELECT COUNT(pr) FROM ProblemReport pr WHERE pr.reportType = :reportType AND pr.deleted = false")
    Long countByReportTypeAndDeletedFalse(@Param("reportType") ProblemReport.ReportType reportType);
}
