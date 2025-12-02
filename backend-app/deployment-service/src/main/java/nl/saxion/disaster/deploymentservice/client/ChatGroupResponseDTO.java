package nl.saxion.disaster.deploymentservice.client;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatGroupResponseDTO {
    private Long chatGroupId;
    private Long incidentId;
    private String title;
    private LocalDateTime createdAt;
    private Boolean isClosed;
}
