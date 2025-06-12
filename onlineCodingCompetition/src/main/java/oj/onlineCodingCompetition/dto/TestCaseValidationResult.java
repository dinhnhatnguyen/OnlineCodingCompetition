package oj.onlineCodingCompetition.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * Result DTO for test case validation
 * DTO kết quả cho việc validate test case
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseValidationResult {
    
    /**
     * Overall validation status
     * Trạng thái validate tổng thể
     */
    private Boolean isValid;
    
    /**
     * Total number of test cases validated
     * Tổng số test case được validate
     */
    private Integer totalTestCases;
    
    /**
     * Number of valid test cases
     * Số test case hợp lệ
     */
    private Integer validTestCases;
    
    /**
     * Number of invalid test cases
     * Số test case không hợp lệ
     */
    private Integer invalidTestCases;
    
    /**
     * Validation errors for each test case
     * Lỗi validate cho từng test case
     */
    private List<TestCaseValidationError> validationErrors;
    
    /**
     * Validation warnings
     * Cảnh báo validate
     */
    private List<TestCaseValidationWarning> validationWarnings;
    
    /**
     * Suggestions for fixing issues
     * Gợi ý để sửa các vấn đề
     */
    private List<ValidationSuggestion> suggestions;
    
    /**
     * Summary of validation results
     * Tóm tắt kết quả validate
     */
    private ValidationSummary summary;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestCaseValidationError {
        private Integer testCaseIndex;
        private Long testCaseId;
        private String field;
        private String errorType;
        private String errorMessage;
        private String currentValue;
        private String expectedFormat;
        private String severity; // ERROR, WARNING, INFO
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestCaseValidationWarning {
        private Integer testCaseIndex;
        private Long testCaseId;
        private String field;
        private String warningType;
        private String warningMessage;
        private String recommendation;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationSuggestion {
        private String suggestionType;
        private String title;
        private String description;
        private String fixAction;
        private Boolean isAutoFixable;
        private Map<String, Object> fixParameters;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationSummary {
        private Map<String, Integer> errorsByType;
        private Map<String, Integer> warningsByType;
        private List<String> commonIssues;
        private Double validationScore; // 0-100
        private String overallAssessment;
    }
}
