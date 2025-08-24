package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ProblemReport;

@Data
public class CreateReportRequest {
    
    @NotNull(message = "Problem ID không được để trống")
    private Long problemId;
    
    @NotNull(message = "Loại báo cáo không được để trống")
    private ProblemReport.ReportType reportType;
    
    @NotBlank(message = "Tiêu đề báo cáo không được để trống")
    private String title;
    
    @NotBlank(message = "Mô tả báo cáo không được để trống")
    private String description;
}
