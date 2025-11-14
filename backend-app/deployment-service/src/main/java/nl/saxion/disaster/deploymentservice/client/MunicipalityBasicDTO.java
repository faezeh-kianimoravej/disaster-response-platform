package nl.saxion.disaster.deploymentservice.client;

import lombok.Data;

import java.util.List;

@Data
public class MunicipalityBasicDTO {
    private Long municipalityId;
    private String name;
    private List<Long> departmentIds;
}
