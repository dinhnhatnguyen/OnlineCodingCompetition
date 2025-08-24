package oj.onlineCodingCompetition.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for exporting test cases with metadata
 * DTO để export test case kèm metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseExportDTO {
    
    /**
     * Export metadata
     * Metadata của export
     */
    private ExportMetadata metadata;
    
    /**
     * List of test cases
     * Danh sách test case
     */
    private List<TestCaseDTO> testCases;
    
    /**
     * Test case statistics
     * Thống kê test case
     */
    private TestCaseStatistics statistics;
    
    /**
     * Problem information
     * Thông tin bài toán
     */
    private ProblemSummary problemSummary;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExportMetadata {
        private LocalDateTime exportDate;
        private String exportedBy;
        private String version;
        private String format;
        private Integer totalCount;
        private String exportReason;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestCaseStatistics {
        private Integer totalTestCases;
        private Integer exampleTestCases;
        private Integer hiddenTestCases;
        private Integer visibleTestCases;
        private Double averageTimeLimit;
        private Double averageMemoryLimit;
        private Double totalWeight;
        private Map<String, Integer> complexityDistribution;
        private Integer qualityScore;
        private List<String> recommendations;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProblemSummary {
        private Long problemId;
        private String title;
        private String difficulty;
        private String description;
        private List<String> topics;
        private Integer defaultTimeLimit;
        private Integer defaultMemoryLimit;
        private LocalDateTime createdAt;
        private String createdBy;
    }
}
