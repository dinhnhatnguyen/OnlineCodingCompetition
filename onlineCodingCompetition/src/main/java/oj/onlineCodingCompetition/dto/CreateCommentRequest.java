package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateCommentRequest {
    
    @NotNull(message = "Problem ID không được để trống")
    private Long problemId;
    
    @NotBlank(message = "Nội dung comment không được để trống")
    private String content;
    
    // Optional: Parent comment ID for replies
    private Long parentCommentId;
}
