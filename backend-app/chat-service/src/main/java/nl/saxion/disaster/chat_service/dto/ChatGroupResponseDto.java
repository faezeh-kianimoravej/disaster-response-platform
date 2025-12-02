package nl.saxion.disaster.chat_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatGroupResponseDto {

    private Long chatGroupId;
    private Long incidentId;
    private String title;
    private LocalDateTime createdAt;
    private Boolean isClosed;
}
