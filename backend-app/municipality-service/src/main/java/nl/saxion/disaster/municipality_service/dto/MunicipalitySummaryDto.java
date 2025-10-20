package nl.saxion.disaster.municipality_service.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

/**
 * Simplified DTO for municipality list endpoints.
 * Does not include nested department details to avoid deep nesting in collection responses.
 */
public record MunicipalitySummaryDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        String name,

        // Base64-encoded image as a string (nullable)
        String image
) {
}
