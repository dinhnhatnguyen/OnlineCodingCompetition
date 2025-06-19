package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.CreateCommentRequest;
import oj.onlineCodingCompetition.dto.ProblemCommentDTO;
import oj.onlineCodingCompetition.service.ProblemCommentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems/comments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Problem Comments", description = "API để quản lý comments trên problems")
public class ProblemCommentController {

    private final ProblemCommentService commentService;

    /**
     * Tạo comment mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo comment mới", description = "Tạo comment hoặc reply cho một problem")
    public ResponseEntity<ProblemCommentDTO> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to create comment for problem: {} by user: {}", 
                request.getProblemId(), userDetails.getUsername());
        
        ProblemCommentDTO result = commentService.createComment(request, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách comments của một problem
     */
    @GetMapping("/problem/{problemId}")
    @Operation(summary = "Lấy comments của problem", description = "Lấy danh sách comments của một problem với phân trang")
    public ResponseEntity<Page<ProblemCommentDTO>> getCommentsByProblem(
            @Parameter(description = "ID của problem") @PathVariable Long problemId,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng comments mỗi trang") @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get comments for problem: {} - page: {}, size: {}", problemId, page, size);
        
        String username = userDetails != null ? userDetails.getUsername() : null;
        Page<ProblemCommentDTO> result = commentService.getCommentsByProblem(problemId, page, size, username);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy replies của một comment
     */
    @GetMapping("/{commentId}/replies")
    @Operation(summary = "Lấy replies của comment", description = "Lấy danh sách replies của một comment")
    public ResponseEntity<List<ProblemCommentDTO>> getRepliesByComment(
            @Parameter(description = "ID của comment") @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get replies for comment: {}", commentId);
        
        String username = userDetails != null ? userDetails.getUsername() : null;
        List<ProblemCommentDTO> result = commentService.getRepliesByComment(commentId, username);
        return ResponseEntity.ok(result);
    }

    /**
     * Cập nhật comment
     */
    @PutMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật comment", description = "Cập nhật nội dung comment (chỉ chủ comment hoặc admin)")
    public ResponseEntity<ProblemCommentDTO> updateComment(
            @Parameter(description = "ID của comment") @PathVariable Long commentId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to update comment: {} by user: {}", commentId, userDetails.getUsername());
        
        String newContent = request.get("content");
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung comment không được để trống");
        }
        
        ProblemCommentDTO result = commentService.updateComment(commentId, newContent, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Xóa comment
     */
    @DeleteMapping("/{commentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa comment", description = "Xóa comment (chỉ chủ comment hoặc admin)")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "ID của comment") @PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to delete comment: {} by user: {}", commentId, userDetails.getUsername());
        
        commentService.deleteComment(commentId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Đếm số lượng comments của một problem
     */
    @GetMapping("/problem/{problemId}/count")
    @Operation(summary = "Đếm comments của problem", description = "Đếm tổng số comments của một problem")
    public ResponseEntity<Map<String, Long>> countCommentsByProblem(
            @Parameter(description = "ID của problem") @PathVariable Long problemId) {
        
        log.debug("REST request to count comments for problem: {}", problemId);
        
        Long count = commentService.countCommentsByProblem(problemId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
