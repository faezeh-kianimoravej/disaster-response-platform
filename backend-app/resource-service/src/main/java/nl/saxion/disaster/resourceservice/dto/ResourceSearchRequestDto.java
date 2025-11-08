package nl.saxion.disaster.resourceservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request DTO for searching available resources for an incident.
 * <p>
 * Used by the frontend search form in the Resource Allocation page.
 * </p>
 */
@Schema(description = "Search parameters for finding available resources for a specific incident.")
public record ResourceSearchRequestDto(

        @Schema(description = "Type of resource (e.g., 'Fire Truck', 'Ambulance')", example = "Fire Truck")
        String resourceType,

        @Schema(description = "Unique ID of the incident", example = "12")
        Long incidentId,

        @Schema(description = "Optional municipality filter", example = "3")
        Long municipalityId,

        @Schema(description = "Optional department filter", example = "5")
        Long departmentId
) {
}
