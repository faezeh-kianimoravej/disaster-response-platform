package nl.saxion.disaster.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDto {

    private Long chatMessageId;
    private Long chatGroupId;
    private Long userId;
    private String userFullName;
    private String userRole;
    private String messageType;
    private String content;
    private Instant timestamp;
}
