package nl.saxion.disaster.chat_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastReadUpdateRequestDto {

    @NotNull(message = "Message ID is required")
    private Long messageId;
}
