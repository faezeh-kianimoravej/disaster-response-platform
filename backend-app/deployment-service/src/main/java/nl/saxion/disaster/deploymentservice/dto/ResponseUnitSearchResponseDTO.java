package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

@Data
public class ResponseUnitSearchResponseDTO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long unitId;
    private String unitName;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long departmentId;
    private String departmentName;
    private ResponseUnitType unitType;
    private ResponseUnitStatus status;
    private Double distanceKm;
}
