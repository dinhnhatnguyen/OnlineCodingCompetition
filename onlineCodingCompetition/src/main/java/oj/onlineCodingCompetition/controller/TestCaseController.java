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
}