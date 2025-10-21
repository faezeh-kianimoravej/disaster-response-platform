package nl.saxion.disaster.incident_service.dto;


import jakarta.validation.constraints.*;
import nl.saxion.disaster.incident_service.model.enums.GripLevel;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.model.enums.Status;

import java.time.OffsetDateTime;

public record IncidentRequest(
        @NotBlank String reportedBy,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 4000) String description,
        @NotNull Severity severity,
        GripLevel gripLevel,
        Status status,
        @NotNull OffsetDateTime reportedAt,
        String location,
        Double latitude,
        Double longitude
) {}