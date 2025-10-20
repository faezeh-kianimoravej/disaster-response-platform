package nl.saxion.disaster.municipality_service.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import java.util.List;

public record MunicipalityDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        String name,

        // Base64-encoded image as a string (nullable)
        String image,

        List<DepartmentSummaryDto> departments
) {
}
