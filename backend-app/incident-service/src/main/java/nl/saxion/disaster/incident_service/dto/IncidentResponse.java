package nl.saxion.disaster.incident_service.dto;

import nl.saxion.disaster.incident_service.model.enums.GripLevel;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.model.enums.Status;

import java.time.OffsetDateTime;

public record IncidentResponse(
        Long incidentId,
        String reportedBy,
        String title,
        String description,
        Severity severity,
        GripLevel gripLevel,
        Status status,
        OffsetDateTime reportedAt,
        String location,
        Double latitude,
        Double longitude,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
