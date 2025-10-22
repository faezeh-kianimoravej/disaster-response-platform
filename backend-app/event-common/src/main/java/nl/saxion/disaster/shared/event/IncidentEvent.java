package nl.saxion.disaster.shared.event;

import lombok.Builder;

import java.time.OffsetDateTime;

@Builder
public record IncidentEvent(

        Long notificationId,
        Long incidentId,
        String type,
        String message,
        String Severity,
        String location,
        String status,
        String createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime sendTime
) {
}