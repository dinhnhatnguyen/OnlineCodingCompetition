package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ProblemReport;

@Data
public class ReviewReportRequest {
    
    @NotNull(message = "Trạng thái không được để trống")
    private ProblemReport.ReportStatus status;
    
    @NotBlank(message = "Phản hồi của admin không được để trống")
    private String adminResponse;
}
