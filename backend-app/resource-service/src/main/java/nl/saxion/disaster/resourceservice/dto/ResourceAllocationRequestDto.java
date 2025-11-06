package nl.saxion.disaster.resourceservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Request DTO for finalizing resource allocation to an incident.
 */
@Schema(description = "Request payload for finalizing resource allocation to an incident.")
public record ResourceAllocationRequestDto(

        @Schema(description = "The ID of the incident this allocation belongs to")
        Long incidentId,

        @Schema(description = "List of resources to allocate to this incident")
        List<ResourceAllocationItemDto> allocations
) {
}
