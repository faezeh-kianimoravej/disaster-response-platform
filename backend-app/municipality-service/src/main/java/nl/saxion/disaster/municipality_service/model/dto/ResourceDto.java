package nl.saxion.disaster.municipality_service.model.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public record ResourceDto(

        @JsonSerialize(using = ToStringSerializer.class)
        Long resourceId,

        String resourceName,
        String description,
        boolean available,
        int quantity,
        String type,

        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,

        Double latitude,
        Double longitude,
        byte[] image
) {
}
