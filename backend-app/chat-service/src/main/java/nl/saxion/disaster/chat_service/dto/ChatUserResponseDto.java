package nl.saxion.disaster.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserResponseDto {

    private Long chatGroupId;
    private Long userId;
    private String userFullName;
    private String userRole;
    private Long lastReadMessageId;
}
