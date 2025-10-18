package nl.saxion.disaster.departmentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public record ResourceDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long resourceId,

        String name,
        String description,
        int available,
        int quantity,
        String resourceType,

        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,

        Double latitude,
        Double longitude,
        String image
) {
}