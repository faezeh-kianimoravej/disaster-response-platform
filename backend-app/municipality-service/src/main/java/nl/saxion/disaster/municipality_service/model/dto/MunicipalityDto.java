package nl.saxion.disaster.municipality_service.model.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import nl.saxion.disaster.municipality_service.serializer.LongListToStringListSerializer;

import java.util.List;

public record MunicipalityDto(
        @JsonSerialize(using = ToStringSerializer.class)
        Long municipalityId,

        @JsonSerialize(using = ToStringSerializer.class)
         Long regionId,

        String name,
        @JsonSerialize(using = LongListToStringListSerializer.class)
        List<Long> departmentIds
) {
}

