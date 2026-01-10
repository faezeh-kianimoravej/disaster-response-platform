package nl.saxion.disaster.incident_service.dto;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class IncidentBasicDTO {

    Long incidentId;
    String reportedBy;
    String title;
    String description;
    String severity;
    String gripLevel;
    String status;
    OffsetDateTime reportedAt;
    String location;
    Double latitude;
    Double longitude;
    Long regionId;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
