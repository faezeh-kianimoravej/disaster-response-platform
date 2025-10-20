package nl.saxion.disaster.municipality_service.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

/**
 * Simplified Department DTO for municipality-service.
 * Does not include resources to limit nesting to one level.
 */
public record DepartmentSummaryDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        String name,

        String image
) {
}
