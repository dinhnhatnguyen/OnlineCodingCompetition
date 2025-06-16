package oj.onlineCodingCompetition.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * DTO for test case analytics and quality assessment
 * DTO cho phân tích test case và đánh giá chất lượng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseAnalyticsDTO {
    
    /**
     * Basic statistics
     * Thống kê cơ bản
     */
    private BasicStatistics basicStats;
    
    /**
     * Quality assessment
     * Đánh giá chất lượng
     */
    private QualityAssessment qualityAssessment;
    
    /**
     * Performance metrics
     * Chỉ số hiệu suất
     */
    private PerformanceMetrics performanceMetrics;
    
    /**
     * Complexity distribution
     * Phân bố độ phức tạp
     */
    private ComplexityDistribution complexityDistribution;
    
    /**
     * Recommendations for improvement
     * Khuyến nghị cải thiện
     */
    private List<Recommendation> recommendations;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicStatistics {
        private Integer totalTestCases;
        private Integer exampleTestCases;
        private Integer hiddenTestCases;
        private Integer visibleTestCases;
        private Double averageWeight;
        private Integer validTestCases;
        private Integer invalidTestCases;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QualityAssessment {
        private Integer overallScore; // 0-100
        private Integer coverageScore; // 0-30
        private Integer exampleScore; // 0-20
        private Integer edgeCaseScore; // 0-25
        private Integer stressTestScore; // 0-15
        private Integer descriptionScore; // 0-10
        private String qualityLevel; // EXCELLENT, GOOD, FAIR, POOR
        private List<String> strengths;
        private List<String> weaknesses;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PerformanceMetrics {
        private Double averageTimeLimit;
        private Double maxTimeLimit;
        private Double minTimeLimit;
        private Double averageMemoryLimit;
        private Double maxMemoryLimit;
        private Double minMemoryLimit;
        private Map<String, Integer> timeLimitDistribution;
        private Map<String, Integer> memoryLimitDistribution;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComplexityDistribution {
        private Integer simpleTestCases;
        private Integer mediumTestCases;
        private Integer complexTestCases;
        private Double averageInputSize;
        private Double maxInputSize;
        private Double minInputSize;
        private Map<String, Integer> dataTypeDistribution;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Recommendation {
        private String type; // WARNING, ERROR, INFO, SUCCESS
        private String category; // COVERAGE, QUALITY, PERFORMANCE, STRUCTURE
        private String title;
        private String description;
        private String action;
        private Integer priority; // 1-5, 1 being highest
        private Boolean isActionable;
    }
}
