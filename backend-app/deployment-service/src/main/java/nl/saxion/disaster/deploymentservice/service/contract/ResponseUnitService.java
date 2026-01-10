package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.client.IncidentBasicDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchResponseDTO;

import java.util.List;

public interface ResponseUnitService {
    ResponseUnitDTO createResponseUnit(ResponseUnitCreateDTO dto);

    ResponseUnitDTO getResponseUnitById(Long unitId);

    List<ResponseUnitDTO> getResponseUnitByDepartmentId(Long departmentId);

    List<ResponseUnitDTO> getAllResponseUnits();

    ResponseUnitDTO updateResponseUnit(Long unitId, ResponseUnitCreateDTO dto);

    void deleteResponseUnit(Long unitId);

    List<ResponseUnitSearchResponseDTO> searchAvailableUnits(ResponseUnitSearchRequestDTO request);
}
