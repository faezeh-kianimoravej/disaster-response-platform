package nl.saxion.disaster.resourceservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Request DTO for finalizing resource allocation to an incident.
 */
@Schema(name = "ResourceAllocationRequestDto",
        example = """
                {
                  "incidentId": 1,
                  "allocations": [
                    { "resourceId": 1, "quantity": 2 },
                    { "resourceId": 13, "quantity": 2 }
                  ]
                }
                """)
public record ResourceAllocationRequestDto(

        @Schema(description = "The ID of the incident this allocation belongs to")
        Long incidentId,

        @Schema(description = "List of resources to allocate to this incident")
        List<ResourceAllocationItemDto> allocations
) {
}
