package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestChatDTO;
import oj.onlineCodingCompetition.dto.CreateChatMessageRequest;
import oj.onlineCodingCompetition.service.ContestChatService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contests/chat")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contest Chat", description = "API để quản lý chat trong contests")
public class ContestChatController {

    private final ContestChatService chatService;

    /**
     * Gửi tin nhắn mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gửi tin nhắn", description = "Gửi tin nhắn mới trong contest chat")
    public ResponseEntity<ContestChatDTO> sendMessage(
            @Valid @RequestBody CreateChatMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to send message to contest: {} by user: {}", 
                request.getContestId(), userDetails.getUsername());
        
        ContestChatDTO result = chatService.sendMessage(request, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách tin nhắn của contest
     */
    @GetMapping("/contest/{contestId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy tin nhắn của contest", description = "Lấy danh sách tin nhắn của một contest với phân trang")
    public ResponseEntity<Page<ContestChatDTO>> getMessagesByContest(
            @Parameter(description = "ID của contest") @PathVariable Long contestId,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng tin nhắn mỗi trang") @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get messages for contest: {} - page: {}, size: {}", contestId, page, size);
        
        Page<ContestChatDTO> result = chatService.getMessagesByContest(contestId, page, size, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy tin nhắn mới nhất
     */
    @GetMapping("/contest/{contestId}/recent")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy tin nhắn mới nhất", description = "Lấy danh sách tin nhắn mới nhất của contest")
    public ResponseEntity<List<ContestChatDTO>> getRecentMessages(
            @Parameter(description = "ID của contest") @PathVariable Long contestId,
            @Parameter(description = "Số lượng tin nhắn") @RequestParam(defaultValue = "50") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get recent messages for contest: {} - limit: {}", contestId, limit);
        
        List<ContestChatDTO> result = chatService.getRecentMessages(contestId, limit, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy tin nhắn sau một thời điểm cụ thể (cho real-time update)
     */
    @GetMapping("/contest/{contestId}/since")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy tin nhắn mới", description = "Lấy tin nhắn sau một thời điểm cụ thể")
    public ResponseEntity<List<ContestChatDTO>> getMessagesAfter(
            @Parameter(description = "ID của contest") @PathVariable Long contestId,
            @Parameter(description = "Thời điểm (yyyy-MM-dd'T'HH:mm:ss)") 
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime since,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to get messages after {} for contest: {}", since, contestId);
        
        List<ContestChatDTO> result = chatService.getMessagesAfter(contestId, since, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Cập nhật tin nhắn
     */
    @PutMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật tin nhắn", description = "Cập nhật nội dung tin nhắn (chỉ chủ tin nhắn hoặc admin)")
    public ResponseEntity<ContestChatDTO> updateMessage(
            @Parameter(description = "ID của tin nhắn") @PathVariable Long messageId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to update message: {} by user: {}", messageId, userDetails.getUsername());
        
        String newMessage = request.get("message");
        if (newMessage == null || newMessage.trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        
        ContestChatDTO result = chatService.updateMessage(messageId, newMessage, userDetails.getUsername());
        return ResponseEntity.ok(result);
    }

    /**
     * Xóa tin nhắn
     */
    @DeleteMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa tin nhắn", description = "Xóa tin nhắn (chỉ chủ tin nhắn hoặc admin)")
    public ResponseEntity<Void> deleteMessage(
            @Parameter(description = "ID của tin nhắn") @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to delete message: {} by user: {}", messageId, userDetails.getUsername());
        
        chatService.deleteMessage(messageId, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Bật/tắt chat cho contest (Contest creator hoặc admin only)
     */
    @PutMapping("/contest/{contestId}/toggle")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Bật/tắt chat", description = "Bật hoặc tắt chat cho contest (chỉ contest creator hoặc admin)")
    public ResponseEntity<Void> toggleContestChat(
            @Parameter(description = "ID của contest") @PathVariable Long contestId,
            @RequestBody Map<String, Boolean> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("REST request to toggle chat for contest: {} by user: {}", contestId, userDetails.getUsername());
        
        Boolean enabled = request.get("enabled");
        if (enabled == null) {
            throw new IllegalArgumentException("Trạng thái chat không được để trống");
        }
        
        chatService.toggleContestChat(contestId, enabled, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    /**
     * Kiểm tra trạng thái chat của contest
     */
    @GetMapping("/contest/{contestId}/status")
    @Operation(summary = "Kiểm tra trạng thái chat", description = "Kiểm tra xem chat có được bật cho contest không")
    public ResponseEntity<Map<String, Boolean>> getChatStatus(
            @Parameter(description = "ID của contest") @PathVariable Long contestId) {
        
        log.debug("REST request to get chat status for contest: {}", contestId);
        
        // This would need to be implemented in the service
        // For now, we'll return a placeholder
        return ResponseEntity.ok(Map.of("enabled", true));
    }
}
