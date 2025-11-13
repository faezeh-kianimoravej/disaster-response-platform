package nl.saxion.disaster.incident_service.service.contract;


import nl.saxion.disaster.incident_service.dto.*;

import java.util.List;
import java.util.Optional;


public interface IncidentService {
    IncidentResponse createIncident(IncidentRequest request);

    IncidentResponse getById(Long id);

    Optional<IncidentResponseDto> getIncidentBasicInfoById(Long id);

    List<IncidentResponse> list(Optional<String> departmentName);

    List<IncidentResponse> listByRegionId(Long regionId);

    IncidentResponse update(Long id, IncidentRequest request);

    void delete(Long id);

    Optional<IncidentLocationDto> getIncidentLocation(Long id);
}
