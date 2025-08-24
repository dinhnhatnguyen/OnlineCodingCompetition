package oj.onlineCodingCompetition.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.dto.TestCaseAnalyticsDTO;
import oj.onlineCodingCompetition.dto.BatchUpdateRequest;
import oj.onlineCodingCompetition.dto.TestCaseValidationResult;
import oj.onlineCodingCompetition.service.TestCaseService;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Controller class for managing test cases
 * Lớp controller để quản lý các test case
 *
 * This controller handles all test case-related operations including:
 * Controller này xử lý tất cả các hoạt động liên quan đến test case bao gồm:
 * - Test case CRUD operations (Các thao tác CRUD cho test case)
 * - Problem-specific test case management (Quản lý test case cho từng bài toán)
 * - Example and visibility management (Quản lý test case mẫu và hiển thị)
 */
@RestController
@RequestMapping("/api/test-cases")
@RequiredArgsConstructor
@Tag(name = "Testcase", description = "API để quản lý TestCase")
public class TestCaseController {

    private final TestCaseService testCaseService;

    /**
     * Retrieves a specific test case by its ID
     * Lấy thông tin một test case theo ID
     *
     * @param id Test case ID (ID của test case)
     * @return Test case information (Thông tin test case)
     */
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDTO> getTestCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getTestCaseById(id));
    }

    /**
     * Retrieves all test cases for a specific problem
     * Lấy tất cả test case cho một bài toán cụ thể
     *
     * @param problemId Problem ID (ID của bài toán)
     * @return List of test cases (Danh sách test case)
     */
    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<TestCaseDTO>> getAllTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getAllTestCasesByProblemId(problemId));
    }

    /**
     * Retrieves example test cases for a specific problem
     * Lấy các test case mẫu cho một bài toán cụ thể
     *
     * @param problemId Problem ID (ID của bài toán)
     * @return List of example test cases (Danh sách test case mẫu)
     */
    @GetMapping("/problem/{problemId}/examples")
    public ResponseEntity<List<TestCaseDTO>> getExampleTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getExampleTestCasesByProblemId(problemId));
    }

    /**
     * Retrieves visible test cases for a specific problem
     * Lấy các test case được hiển thị cho một bài toán cụ thể
     *
     * @param problemId Problem ID (ID của bài toán)
     * @return List of visible test cases (Danh sách test case được hiển thị)
     */
    @GetMapping("/problem/{problemId}/visible")
    public ResponseEntity<List<TestCaseDTO>> getVisibleTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getVisibleTestCasesByProblemId(problemId));
    }

    /**
     * Creates a new test case (Admin/Instructor only)
     * Tạo một test case mới (Chỉ dành cho Admin/Giảng viên)
     *
     * @param testCaseDTO Test case data (Dữ liệu test case)
     * @return Created test case information (Thông tin test case đã tạo)
     * @throws JsonProcessingException if there's an error processing JSON data (nếu có lỗi xử lý dữ liệu JSON)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> createTestCase(@Valid @RequestBody TestCaseDTO testCaseDTO) throws JsonProcessingException {
        TestCaseDTO createdTestCase = testCaseService.createTestCase(testCaseDTO);
        return new ResponseEntity<>(createdTestCase, HttpStatus.CREATED);
    }

    /**
     * Creates multiple test cases for a problem (Admin/Instructor only)
     * Tạo nhiều test case cho một bài toán (Chỉ dành cho Admin/Giảng viên)
     *
     * @param problemId Problem ID (ID của bài toán)
     * @param testCaseDTOs List of test case data (Danh sách dữ liệu test case)
     * @return List of created test cases (Danh sách test case đã tạo)
     */
    @PostMapping("/batch/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<TestCaseDTO>> createTestCases(
            @PathVariable Long problemId,
            @Valid @RequestBody List<TestCaseDTO> testCaseDTOs) {
        List<TestCaseDTO> createdTestCases = testCaseService.createTestCases(testCaseDTOs, problemId);
        return new ResponseEntity<>(createdTestCases, HttpStatus.CREATED);
    }





    /**
     * Get test case analytics for a problem (Admin/Instructor only)
     * Lấy phân tích test case cho một bài toán (Chỉ dành cho Admin/Giảng viên)
     */
    @GetMapping("/analytics/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseAnalyticsDTO> getTestCaseAnalytics(@PathVariable Long problemId) {
        TestCaseAnalyticsDTO analytics = testCaseService.getTestCaseAnalytics(problemId);
        return ResponseEntity.ok(analytics);
    }

    /**
     * Batch update test cases (Admin/Instructor only)
     * Cập nhật hàng loạt test case (Chỉ dành cho Admin/Giảng viên)
     */
    @PutMapping("/batch-update/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<TestCaseDTO>> batchUpdateTestCases(
            @PathVariable Long problemId,
            @Valid @RequestBody BatchUpdateRequest request) {
        List<TestCaseDTO> updatedTestCases = testCaseService.batchUpdateTestCases(problemId, request);
        return ResponseEntity.ok(updatedTestCases);
    }

    /**
     * Validate test case data (Admin/Instructor only)
     * Validate dữ liệu test case (Chỉ dành cho Admin/Giảng viên)
     */
    @PostMapping("/validate")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseValidationResult> validateTestCases(
            @Valid @RequestBody List<TestCaseDTO> testCases) {
        TestCaseValidationResult validationResult = testCaseService.validateTestCases(testCases);
        return ResponseEntity.ok(validationResult);
    }



    /**
     * Updates an existing test case (Admin/Instructor only)
     * Cập nhật một test case đã tồn tại (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Test case ID (ID của test case)
     * @param testCaseDTO Updated test case data (Dữ liệu test case cập nhật)
     * @return Updated test case information (Thông tin test case đã cập nhật)
     * @throws JsonProcessingException if there's an error processing JSON data (nếu có lỗi xử lý dữ liệu JSON)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> updateTestCase(
            @PathVariable Long id,
            @Valid @RequestBody TestCaseDTO testCaseDTO) throws JsonProcessingException {
        return ResponseEntity.ok(testCaseService.updateTestCase(id, testCaseDTO));
    }

    /**
     * Deletes a test case (Admin/Instructor only)
     * Xóa một test case (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Test case ID (ID của test case)
     * @return Empty response with no content status (Phản hồi trống với trạng thái không có nội dung)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes all test cases for a specific problem (Admin/Instructor only)
     * Xóa tất cả test case của một bài toán cụ thể (Chỉ dành cho Admin/Giảng viên)
     *
     * @param problemId Problem ID (ID của bài toán)
     * @return Empty response with no content status (Phản hồi trống với trạng thái không có nội dung)
     */
    @DeleteMapping("/problem/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAllTestCasesByProblemId(@PathVariable Long problemId) {
        testCaseService.deleteAllTestCasesByProblemId(problemId);
        return ResponseEntity.noContent().build();
    }

    // ==================== CROSS-LANGUAGE COMPATIBILITY ENDPOINTS ====================

    /**
     * Get test cases converted for specific programming language
     * Lấy test cases đã chuyển đổi cho ngôn ngữ lập trình cụ thể
     *
     * @param problemId Problem ID (ID của bài toán)
     * @param language Programming language (Ngôn ngữ lập trình)
     * @return List of test cases converted for the specified language (Danh sách test case đã chuyển đổi)
     */
    @GetMapping("/problem/{problemId}/language/{language}")
    public ResponseEntity<List<TestCaseDTO>> getTestCasesForLanguage(
            @PathVariable Long problemId,
            @PathVariable String language) {
        List<TestCaseDTO> testCases = testCaseService.getTestCasesForLanguage(problemId, language);
        return ResponseEntity.ok(testCases);
    }

    /**
     * Convert test case data type from one language to another
     * Chuyển đổi kiểu dữ liệu test case từ ngôn ngữ này sang ngôn ngữ khác
     *
     * @param dataType Original data type (Kiểu dữ liệu gốc)
     * @param fromLanguage Source language (Ngôn ngữ nguồn)
     * @param toLanguage Target language (Ngôn ngữ đích)
     * @return Converted data type (Kiểu dữ liệu đã chuyển đổi)
     */
    @GetMapping("/convert-type")
    public ResponseEntity<Map<String, String>> convertDataType(
            @RequestParam String dataType,
            @RequestParam String fromLanguage,
            @RequestParam String toLanguage) {
        String convertedType = testCaseService.normalizeDataType(dataType, fromLanguage, toLanguage);
        Map<String, String> response = Map.of(
            "originalType", dataType,
            "fromLanguage", fromLanguage,
            "toLanguage", toLanguage,
            "convertedType", convertedType
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get supported programming languages
     * Lấy danh sách ngôn ngữ lập trình được hỗ trợ
     *
     * @return List of supported languages (Danh sách ngôn ngữ được hỗ trợ)
     */
    @GetMapping("/supported-languages")
    public ResponseEntity<Set<String>> getSupportedLanguages() {
        Set<String> languages = testCaseService.getSupportedLanguages();
        return ResponseEntity.ok(languages);
    }

    /**
     * Check data type compatibility for specific language
     * Kiểm tra tính tương thích kiểu dữ liệu cho ngôn ngữ cụ thể
     *
     * @param dataType Data type to check (Kiểu dữ liệu cần kiểm tra)
     * @param language Programming language (Ngôn ngữ lập trình)
     * @return Compatibility result (Kết quả tương thích)
     */
    @GetMapping("/check-compatibility")
    public ResponseEntity<Map<String, Object>> checkDataTypeCompatibility(
            @RequestParam String dataType,
            @RequestParam String language) {
        boolean isCompatible = testCaseService.isDataTypeCompatible(dataType, language);
        Map<String, Object> response = Map.of(
            "dataType", dataType,
            "language", language,
            "isCompatible", isCompatible
        );
        return ResponseEntity.ok(response);
    }
}