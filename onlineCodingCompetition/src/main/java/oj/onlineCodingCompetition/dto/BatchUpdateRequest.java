package oj.onlineCodingCompetition.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for batch updating test cases
 * DTO yêu cầu để cập nhật hàng loạt test case
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchUpdateRequest {
    
    /**
     * List of test case IDs to update
     * Danh sách ID test case cần cập nhật
     */
    private List<Long> testCaseIds;
    
    /**
     * Updates to apply to selected test cases
     * Các cập nhật áp dụng cho test case được chọn
     */
    private TestCaseUpdates updates;
    
    /**
     * Operation type (UPDATE, DELETE, DUPLICATE)
     * Loại thao tác (UPDATE, DELETE, DUPLICATE)
     */
    private String operation;
    
    /**
     * Additional parameters for the operation
     * Tham số bổ sung cho thao tác
     */
    private Map<String, Object> parameters;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseUpdates {
        private Integer timeLimit;
        private Integer memoryLimit;
        private Double weight;
        private Boolean isExample;
        private Boolean isHidden;
        private String comparisonMode;
        private Double epsilon;
        private String description;
        private Integer testOrder;
    }
}
