package nl.saxion.disaster.regionservice.dto;


import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

/**
 * Simplified Municipality DTO for region-service.
 * Does not include departmentIds to limit nesting to one level.
 */
public record MunicipalityDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        String name,

        // Base64-encoded image as a string (nullable)
        String image
) {
}
