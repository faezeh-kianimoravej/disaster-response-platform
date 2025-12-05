package nl.saxion.disaster.chat_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Message content is required")
    private String content;
}
