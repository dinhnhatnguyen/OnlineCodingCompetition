package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.SubmissionDTO;
import oj.onlineCodingCompetition.dto.TestCaseResultDTO;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.SubmissionService;

import java.util.List;

/**
 * Controller class for managing problem submissions
 * Lớp controller để quản lý các bài nộp
 *
 * This controller handles all submission-related operations including:
 * Controller này xử lý tất cả các hoạt động liên quan đến bài nộp bao gồm:
 * - Submission creation and retrieval (Tạo và lấy thông tin bài nộp)
 * - Test case results management (Quản lý kết quả test case)
 * - Problem completion tracking (Theo dõi hoàn thành bài toán)
 */
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Submission", description = "API để quản lý submission")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepository userRepository;

    /**
     * Creates a new submission for a problem
     * Tạo một bài nộp mới cho một bài toán
     *
     * @param submissionDTO Submission data (Dữ liệu bài nộp)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Created submission information (Thông tin bài nộp đã tạo)
     * @throws RuntimeException if user is not found (nếu không tìm thấy người dùng)
     */
    @PostMapping
    public ResponseEntity<SubmissionDTO> createSubmission(
            @Valid @RequestBody SubmissionDTO submissionDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        SubmissionDTO createdSubmission = submissionService.createSubmission(submissionDTO, userId);
        return new ResponseEntity<>(createdSubmission, HttpStatus.CREATED);
    }

    /**
     * Retrieves a specific submission by its ID
     * Lấy thông tin một bài nộp theo ID
     *
     * @param id Submission ID (ID của bài nộp)
     * @return Submission information (Thông tin bài nộp)
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }
    
    /**
     * Retrieves test case results for a specific submission
     * Lấy kết quả các test case cho một bài nộp cụ thể
     *
     * @param id Submission ID (ID của bài nộp)
     * @return List of test case results (Danh sách kết quả test case)
     */
    @GetMapping("/{id}/test-cases")
    public ResponseEntity<List<TestCaseResultDTO>> getSubmissionTestCases(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getTestCaseResults(id));
    }
    
    /**
     * Marks a problem as solved for the current user
     * Đánh dấu một bài toán đã được giải bởi người dùng hiện tại
     *
     * @param problemId Problem ID (ID của bài toán)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     * @throws RuntimeException if user is not found (nếu không tìm thấy người dùng)
     */
    @PostMapping("/{problemId}/mark-solved")
    public ResponseEntity<?> markProblemSolved(
            @PathVariable Long problemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        submissionService.markProblemSolved(problemId, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Retrieves all problems solved by the current user
     * Lấy danh sách tất cả các bài toán đã được giải bởi người dùng hiện tại
     *
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return List of solved problem IDs (Danh sách ID các bài toán đã giải)
     * @throws RuntimeException if user is not found (nếu không tìm thấy người dùng)
     */
    @GetMapping("/user/solved")
    public ResponseEntity<List<Long>> getUserSolvedProblems(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        return ResponseEntity.ok(submissionService.getUserSolvedProblems(userId));
    }
}