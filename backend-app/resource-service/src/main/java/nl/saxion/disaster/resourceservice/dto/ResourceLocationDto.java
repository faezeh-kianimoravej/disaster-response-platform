package nl.saxion.disaster.resourceservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public record ResourceLocationDto(
        @JsonSerialize(using = ToStringSerializer.class)
        Long resourceId,
        Double latitude,
        Double longitude
) {
}
