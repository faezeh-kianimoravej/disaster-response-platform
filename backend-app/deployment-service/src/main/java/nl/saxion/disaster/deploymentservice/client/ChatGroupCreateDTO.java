package nl.saxion.disaster.deploymentservice.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatGroupCreateDTO {
    private Long incidentId;
    private String title;
}
