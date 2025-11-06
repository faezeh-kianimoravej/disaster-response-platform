package nl.saxion.disaster.incident_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO representing an incident retrieved from the incident-service.
 * <p>
 * Used by the resource-service to validate an incident's existence
 * before performing resource allocation.
 * </p>
 */
@Schema(description = "Represents basic incident information retrieved from the incident-service.")
public record IncidentResponseDto(

        @Schema(description = "Unique identifier of the incident", example = "12")
        Long incidentId,

        @Schema(description = "Short title or description of the incident", example = "Factory Fire in Deventer")
        String title,

        @Schema(description = "Current status of the incident (e.g., ACTIVE, CLOSED)", example = "ACTIVE")
        String status
) {
}
