package oj.onlineCodingCompetition.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.CreateReportRequest;
import oj.onlineCodingCompetition.dto.ProblemReportDTO;
import oj.onlineCodingCompetition.dto.ReviewReportRequest;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemReport;
import oj.onlineCodingCompetition.repository.ProblemReportRepository;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProblemReportService {

    private final ProblemReportRepository reportRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    /**
     * Tạo báo cáo mới
     */
    public ProblemReportDTO createReport(CreateReportRequest request, String username) {
        log.debug("Tạo báo cáo mới cho problem {} bởi user {}", request.getProblemId(), username);

        // Tìm user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        // Tìm problem
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy problem với ID: " + request.getProblemId()));

        if (problem.isDeleted()) {
            throw new RuntimeException("Problem đã bị xóa");
        }

        // Kiểm tra user đã báo cáo problem này chưa
        if (reportRepository.existsByProblemAndReportedByAndDeletedFalse(problem, user)) {
            throw new RuntimeException("Bạn đã báo cáo problem này rồi");
        }

        // Tạo report
        ProblemReport report = new ProblemReport();
        report.setProblem(problem);
        report.setReportedBy(user);
        report.setReportType(request.getReportType());
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCreatedAt(LocalDateTime.now());
        report.setStatus(ProblemReport.ReportStatus.PENDING);

        ProblemReport savedReport = reportRepository.save(report);
        log.info("Đã tạo báo cáo với ID: {}", savedReport.getId());

        return convertToDTO(savedReport, user);
    }

    /**
     * Lấy danh sách báo cáo (cho admin)
     */
    @Transactional(readOnly = true)
    public Page<ProblemReportDTO> getAllReports(int page, int size, String currentUsername) {
        log.debug("Lấy danh sách báo cáo - page: {}, size: {}", page, size);

        final User currentUser = currentUsername != null
            ? userRepository.findByUsername(currentUsername).orElse(null)
            : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<ProblemReport> reports = reportRepository.findAllAndDeletedFalse(pageable);

        return reports.map(report -> convertToDTO(report, currentUser));
    }

    /**
     * Lấy báo cáo theo trạng thái
     */
    @Transactional(readOnly = true)
    public Page<ProblemReportDTO> getReportsByStatus(ProblemReport.ReportStatus status, int page, int size, String currentUsername) {
        log.debug("Lấy báo cáo theo trạng thái {} - page: {}, size: {}", status, page, size);

        final User currentUser = currentUsername != null
            ? userRepository.findByUsername(currentUsername).orElse(null)
            : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<ProblemReport> reports = reportRepository.findByStatusAndDeletedFalse(status, pageable);

        return reports.map(report -> convertToDTO(report, currentUser));
    }

    /**
     * Lấy báo cáo của user hiện tại
     */
    @Transactional(readOnly = true)
    public Page<ProblemReportDTO> getMyReports(int page, int size, String username) {
        log.debug("Lấy báo cáo của user {} - page: {}, size: {}", username, page, size);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        Pageable pageable = PageRequest.of(page, size);
        Page<ProblemReport> reports = reportRepository.findByReportedByAndDeletedFalse(user, pageable);

        return reports.map(report -> convertToDTO(report, user));
    }

    /**
     * Lấy báo cáo theo ID
     */
    @Transactional(readOnly = true)
    public ProblemReportDTO getReportById(Long reportId, String currentUsername) {
        log.debug("Lấy báo cáo với ID: {}", reportId);

        User currentUser = null;
        if (currentUsername != null) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }

        ProblemReport report = reportRepository.findByIdAndDeletedFalse(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        return convertToDTO(report, currentUser);
    }

    /**
     * Xem xét báo cáo (Admin only)
     */
    public ProblemReportDTO reviewReport(Long reportId, ReviewReportRequest request, String adminUsername) {
        log.debug("Xem xét báo cáo {} bởi admin {}", reportId, adminUsername);

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin: " + adminUsername));

        if (!"admin".equals(admin.getRole())) {
            throw new RuntimeException("Chỉ admin mới có thể xem xét báo cáo");
        }

        ProblemReport report = reportRepository.findByIdAndDeletedFalse(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        // Cập nhật trạng thái và phản hồi
        report.setStatus(request.getStatus());
        report.setAdminResponse(request.getAdminResponse());
        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());

        ProblemReport updatedReport = reportRepository.save(report);
        log.info("Đã xem xét báo cáo với ID: {}", updatedReport.getId());

        return convertToDTO(updatedReport, admin);
    }

    /**
     * Xóa báo cáo (soft delete)
     */
    public void deleteReport(Long reportId, String username) {
        log.debug("Xóa báo cáo {} bởi user {}", reportId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        ProblemReport report = reportRepository.findByIdAndDeletedFalse(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        // Kiểm tra quyền xóa (chỉ người tạo hoặc admin)
        if (!report.getReportedBy().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa báo cáo này");
        }

        report.setDeleted(true);
        report.setDeletedAt(LocalDateTime.now());
        report.setDeletedBy(user.getId());

        reportRepository.save(report);
        log.info("Đã xóa báo cáo với ID: {}", reportId);
    }

    /**
     * Đếm số lượng báo cáo pending
     */
    @Transactional(readOnly = true)
    public Long countPendingReports() {
        return reportRepository.countPendingReports();
    }

    /**
     * Convert entity to DTO
     */
    private ProblemReportDTO convertToDTO(ProblemReport report, User currentUser) {
        ProblemReportDTO dto = new ProblemReportDTO();
        dto.setId(report.getId());
        dto.setProblemId(report.getProblem().getId());
        dto.setProblemTitle(report.getProblem().getTitle());
        dto.setReportedById(report.getReportedBy().getId());
        dto.setReportedByUsername(report.getReportedBy().getUsername());
        dto.setReportType(report.getReportType());
        dto.setTitle(report.getTitle());
        dto.setDescription(report.getDescription());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setStatus(report.getStatus());

        if (report.getReviewedBy() != null) {
            dto.setReviewedById(report.getReviewedBy().getId());
            dto.setReviewedByUsername(report.getReviewedBy().getUsername());
            dto.setAdminResponse(report.getAdminResponse());
            dto.setReviewedAt(report.getReviewedAt());
        }

        // Set permissions
        if (currentUser != null) {
            dto.setCanReview("admin".equals(currentUser.getRole()));
            dto.setCanEdit(report.getReportedBy().getId().equals(currentUser.getId()) && 
                          report.getStatus() == ProblemReport.ReportStatus.PENDING);
        } else {
            dto.setCanReview(false);
            dto.setCanEdit(false);
        }

        return dto;
    }
}
