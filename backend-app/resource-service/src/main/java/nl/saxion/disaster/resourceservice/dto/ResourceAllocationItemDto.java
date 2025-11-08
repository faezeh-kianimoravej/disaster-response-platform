package nl.saxion.disaster.resourceservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a single resource being allocated.
 */
@Schema(description = "Represents a single resource allocation item.")
public record ResourceAllocationItemDto(

        @Schema(description = "ID of the resource being allocated")
        Long resourceId,

        @Schema(description = "Number of units of this resource to allocate")
        int quantity
) {
}
