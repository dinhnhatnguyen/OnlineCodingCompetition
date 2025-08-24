package oj.onlineCodingCompetition.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ContestChat;

import java.time.LocalDateTime;

@Data
public class ContestChatDTO {
    private Long id;
    
    @NotNull(message = "Contest ID không được để trống")
    private Long contestId;
    
    private Long userId;
    private String username;
    
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String message;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private ContestChat.MessageType messageType;
    
    // Helper fields
    private boolean canEdit; // User can edit their own messages or admin can edit any
    private boolean canDelete; // User can delete their own messages or admin can delete any
    private boolean isAnnouncement; // Is this an announcement message
}
