package oj.onlineCodingCompetition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProblemCommentDTO {
    private Long id;
    
    @NotNull(message = "Problem ID không được để trống")
    private Long problemId;
    
    private Long userId;
    private String username;
    
    @NotBlank(message = "Nội dung comment không được để trống")
    private String content;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Parent comment ID for replies
    private Long parentCommentId;
    
    // List of replies (for nested comments)
    private List<ProblemCommentDTO> replies;
    
    // Helper fields
    private boolean isReply;
    private int replyCount;
    private boolean canEdit; // User can edit their own comments
    private boolean canDelete; // User can delete their own comments or admin can delete any
}
