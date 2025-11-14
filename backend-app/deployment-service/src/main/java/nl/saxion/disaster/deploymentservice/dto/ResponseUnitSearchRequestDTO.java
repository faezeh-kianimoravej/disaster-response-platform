package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

@Data
public class ResponseUnitSearchRequestDTO {
    private ResponseUnitType unitType;
    private Long departmentId;
    private Long municipalityId;
    private Long incidentId;
    private Integer closest = 10;
}
