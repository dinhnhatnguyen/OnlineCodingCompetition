package oj.onlineCodingCompetition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ProblemReport;

import java.time.LocalDateTime;

@Data
public class ProblemReportDTO {
    private Long id;
    
    @NotNull(message = "Problem ID không được để trống")
    private Long problemId;
    
    private String problemTitle; // For display purposes
    
    private Long reportedById;
    private String reportedByUsername;
    
    @NotNull(message = "Loại báo cáo không được để trống")
    private ProblemReport.ReportType reportType;
    
    @NotBlank(message = "Tiêu đề báo cáo không được để trống")
    private String title;
    
    @NotBlank(message = "Mô tả báo cáo không được để trống")
    private String description;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    private ProblemReport.ReportStatus status;
    
    // Admin response fields
    private Long reviewedById;
    private String reviewedByUsername;
    private String adminResponse;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reviewedAt;
    
    // Helper fields
    private boolean canReview; // Admin can review
    private boolean canEdit; // Reporter can edit if not reviewed yet
}
