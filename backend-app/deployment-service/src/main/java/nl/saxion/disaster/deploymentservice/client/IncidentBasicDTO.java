package nl.saxion.disaster.deploymentservice.client;

import lombok.Data;

@Data
public class IncidentBasicDTO {
    private Long incidentId;
    private String title;
    private String status;
}
