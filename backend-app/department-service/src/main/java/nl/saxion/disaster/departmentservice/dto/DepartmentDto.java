package nl.saxion.disaster.departmentservice.dto;

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

        String imageBase64,

        List<ResourceDto> resourceDtoList
) {
}