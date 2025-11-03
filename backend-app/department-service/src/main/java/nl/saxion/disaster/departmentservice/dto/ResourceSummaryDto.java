package nl.saxion.disaster.departmentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public record ResourceSummaryDto(
        @JsonSerialize(using = ToStringSerializer.class)
        Long resourceId,

        String name,

        String image
) {
}
