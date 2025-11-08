package nl.saxion.disaster.incident_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents a single resource allocation record.
 * <p>
 * Sent from the resource-service to the incident-service
 * when the allocation is finalized.
 * </p>
 */
@Schema(description = "Represents a single allocated resource with quantity.")
public record ResourceAllocationItemDto(

        @Schema(description = "ID of the allocated resource", example = "101")
        Long resourceId,

        @Schema(description = "Number of units allocated", example = "3")
        Integer quantity
) {
}