package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.CreateReportRequest;
import oj.onlineCodingCompetition.dto.ProblemReportDTO;
import oj.onlineCodingCompetition.dto.ReviewReportRequest;
import oj.onlineCodingCompetition.entity.ProblemReport;
import oj.onlineCodingCompetition.service.ProblemReportService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/problems/reports")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Problem Reports", description = "API để quản lý báo cáo lỗi problems")
public class ProblemReportController {

    private final ProblemReportService reportService;

    /**
     * Tạo báo cáo mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo báo cáo mới", description = "Tạo báo cáo lỗi cho một problem")
    public ResponseEntity<ProblemReportDTO> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to create report for problem: {} by user: {}", 
                request.getProblemId(), userDetails.getUsername());
        
        ProblemReportDTO result = reportService.createReport(request, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách tất cả báo cáo (Admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy tất cả báo cáo", description = "Lấy danh sách tất cả báo cáo (Admin only)")
    public ResponseEntity<Page<ProblemReportDTO>> getAllReports(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng báo cáo mỗi trang") @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get all reports - page: {}, size: {}", page, size);
        
        Page<ProblemReportDTO> result = reportService.getAllReports(page, size, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy báo cáo theo trạng thái (Admin only)
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy báo cáo theo trạng thái", description = "Lấy danh sách báo cáo theo trạng thái cụ thể")
    public ResponseEntity<Page<ProblemReportDTO>> getReportsByStatus(
            @Parameter(description = "Trạng thái báo cáo") @PathVariable ProblemReport.ReportStatus status,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng báo cáo mỗi trang") @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get reports by status: {} - page: {}, size: {}", status, page, size);
        
        Page<ProblemReportDTO> result = reportService.getReportsByStatus(status, page, size, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy báo cáo của user hiện tại
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy báo cáo của tôi", description = "Lấy danh sách báo cáo của user hiện tại")
    public ResponseEntity<Page<ProblemReportDTO>> getMyReports(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng báo cáo mỗi trang") @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get my reports - page: {}, size: {}", page, size);
        
        Page<ProblemReportDTO> result = reportService.getMyReports(page, size, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy báo cáo theo ID
     */
    @GetMapping("/{reportId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy báo cáo theo ID", description = "Lấy thông tin chi tiết của một báo cáo")
    public ResponseEntity<ProblemReportDTO> getReportById(
            @Parameter(description = "ID của báo cáo") @PathVariable Long reportId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get report: {}", reportId);
        
        String username = userDetails != null ? userDetails.getUsername() : null;
        ProblemReportDTO result = reportService.getReportById(reportId, username);
        return ResponseEntity.ok(result);
    }

    /**
     * Xem xét báo cáo (Admin only)
     */
    @PutMapping("/{reportId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xem xét báo cáo", description = "Admin xem xét và phản hồi báo cáo")
    public ResponseEntity<ProblemReportDTO> reviewReport(
            @Parameter(description = "ID của báo cáo") @PathVariable Long reportId,
            @Valid @RequestBody ReviewReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to review report: {} by admin: {}", reportId, userDetails.getUsername());
        
        ProblemReportDTO result = reportService.reviewReport(reportId, request, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Xóa báo cáo
     */
    @DeleteMapping("/{reportId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa báo cáo", description = "Xóa báo cáo (chỉ người tạo hoặc admin)")
    public ResponseEntity<Void> deleteReport(
            @Parameter(description = "ID của báo cáo") @PathVariable Long reportId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to delete report: {} by user: {}", reportId, userDetails.getUsername());
        
        reportService.deleteReport(reportId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Đếm số lượng báo cáo pending (Admin only)
     */
    @GetMapping("/admin/pending/count")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Đếm báo cáo pending", description = "Đếm số lượng báo cáo đang chờ xử lý")
    public ResponseEntity<Map<String, Long>> countPendingReports() {
        
        log.debug("REST request to count pending reports");
        
        Long count = reportService.countPendingReports();
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Lấy các loại báo cáo có sẵn
     */
    @GetMapping("/types")
    @Operation(summary = "Lấy loại báo cáo", description = "Lấy danh sách các loại báo cáo có sẵn")
    public ResponseEntity<Map<String, String>> getReportTypes() {

        log.debug("REST request to get report types");

        Map<String, String> reportTypes = Map.of(
            "INCORRECT_TEST_CASE", ProblemReport.ReportType.INCORRECT_TEST_CASE.getDisplayName(),
            "UNCLEAR_PROBLEM_STATEMENT", ProblemReport.ReportType.UNCLEAR_PROBLEM_STATEMENT.getDisplayName(),
            "WRONG_EXPECTED_OUTPUT", ProblemReport.ReportType.WRONG_EXPECTED_OUTPUT.getDisplayName(),
            "MISSING_CONSTRAINTS", ProblemReport.ReportType.MISSING_CONSTRAINTS.getDisplayName(),
            "TYPO_OR_GRAMMAR", ProblemReport.ReportType.TYPO_OR_GRAMMAR.getDisplayName(),
            "OTHER", ProblemReport.ReportType.OTHER.getDisplayName()
        );

        return ResponseEntity.ok(reportTypes);
    }

    /**
     * Lấy thống kê báo cáo (Admin only)
     */
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy thống kê báo cáo", description = "Lấy thống kê tổng quan về báo cáo (chỉ admin)")
    public ResponseEntity<Map<String, Object>> getReportsStatistics() {
        log.debug("REST request to get reports statistics");

        Map<String, Object> statistics = reportService.getReportsStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Lấy các trạng thái báo cáo có sẵn
     */
    @GetMapping("/statuses")
    @Operation(summary = "Lấy trạng thái báo cáo", description = "Lấy danh sách các trạng thái báo cáo có sẵn")
    public ResponseEntity<Map<String, String>> getReportStatuses() {
        
        log.debug("REST request to get report statuses");
        
        Map<String, String> reportStatuses = Map.of(
            "PENDING", ProblemReport.ReportStatus.PENDING.getDisplayName(),
            "IN_REVIEW", ProblemReport.ReportStatus.IN_REVIEW.getDisplayName(),
            "RESOLVED", ProblemReport.ReportStatus.RESOLVED.getDisplayName(),
            "REJECTED", ProblemReport.ReportStatus.REJECTED.getDisplayName(),
            "CLOSED", ProblemReport.ReportStatus.CLOSED.getDisplayName()
        );
        
        return ResponseEntity.ok(reportStatuses);
    }
}
