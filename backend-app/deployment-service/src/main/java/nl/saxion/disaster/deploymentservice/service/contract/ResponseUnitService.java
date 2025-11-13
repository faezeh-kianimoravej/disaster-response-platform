package nl.saxion.disaster.deploymentservice.service.contract;

import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchResponseDTO;

import java.util.List;

public interface ResponseUnitService {
    ResponseUnitDTO create(ResponseUnitCreateDTO dto);
    ResponseUnitDTO getById(Long unitId);
    List<ResponseUnitDTO> getByDepartmentId(Long departmentId);
    List<ResponseUnitDTO> getAll();
    ResponseUnitDTO update(Long unitId, ResponseUnitCreateDTO dto);
    void delete(Long unitId);
    List<ResponseUnitSearchResponseDTO> searchAvailableUnits(ResponseUnitSearchRequestDTO request);
}
