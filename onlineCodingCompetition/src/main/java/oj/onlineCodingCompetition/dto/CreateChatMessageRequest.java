package oj.onlineCodingCompetition.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import oj.onlineCodingCompetition.entity.ContestChat;

@Data
public class CreateChatMessageRequest {
    
    @NotNull(message = "Contest ID không được để trống")
    private Long contestId;
    
    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String message;
    
    // Optional: Message type (default is NORMAL)
    private ContestChat.MessageType messageType = ContestChat.MessageType.NORMAL;
}
