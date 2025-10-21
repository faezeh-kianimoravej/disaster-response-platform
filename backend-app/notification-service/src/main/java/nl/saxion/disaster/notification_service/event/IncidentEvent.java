package nl.saxion.disaster.notification_service.event;

import java.time.LocalDateTime;

public record IncidentEvent(

        Long incidentId,
        Long regionId,
        String incidentType,
        String description,
        String severity,
        String location,
        String status,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime reportTime
) {
}
