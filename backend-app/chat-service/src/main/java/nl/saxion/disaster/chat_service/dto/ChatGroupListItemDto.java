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
public class ChatGroupListItemDto {

    private Long chatGroupId;
    private Long incidentId;
    private String title;
    private Instant createdAt;
    private Boolean isClosed;
    private ChatMessageResponseDto lastMessage;
    private Long numberOfUnreadMessages;
}
