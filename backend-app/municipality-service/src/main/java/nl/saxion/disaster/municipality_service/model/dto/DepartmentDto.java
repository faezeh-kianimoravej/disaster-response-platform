package nl.saxion.disaster.municipality_service.model.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import java.util.List;

public record DepartmentDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long regionId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,

        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        String departmentName,

        List<ResourceDto> resourceDtoList
) {
}