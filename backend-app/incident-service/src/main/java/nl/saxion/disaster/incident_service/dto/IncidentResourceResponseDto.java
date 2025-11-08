package nl.saxion.disaster.incident_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * DTO representing a resource that has been allocated to an incident.
 * <p>
 * Used to return allocation details (resource, department, municipality, quantity)
 * to the frontend when reopening an incident.
 * </p>
 */
@Schema(description = "Represents a resource that has been allocated to a specific incident.")
public record IncidentResourceResponseDto(

        @Schema(description = "Unique ID of the allocated resource", example = "45")
        Long resourceId,

        @Schema(description = "Name of the resource", example = "Truck 12")
        String name,

        @Schema(description = "Type of the allocated resource", example = "Fire Truck")
        String resourceType,

        @Schema(description = "Name of the department the resource belongs to", example = "Fire Department Deventer")
        String department,

        @Schema(description = "Municipality of the department", example = "Deventer")
        String municipality,

        @Schema(description = "Allocated quantity for this resource", example = "2")
        Integer quantity
) {}
