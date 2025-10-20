package nl.saxion.disaster.departmentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

/**
 * Simplified DTO for department list endpoints.
 * Does not include nested resources to avoid deep nesting in collection responses.
 */
public record DepartmentSummaryDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        String name,

        String image
) {
}
