package nl.saxion.disaster.departmentservice.service.contract;

import nl.saxion.disaster.departmentservice.dto.DepartmentBasicDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceSummaryDto;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {

    /**
     * Get all departments - returns simplified DTO without nested resources.
     */
    List<DepartmentSummaryDto> getAllDepartments();

    /**
     * Get single department by ID - returns full DTO with nested resource details.
     */
    Optional<DepartmentDto> getDepartmentById(Long id);

    /**
     * Get a lightweight version of Department (id, name, municipalityId)
     * — used by resource-service through FeignClient.
     */
    Optional<DepartmentBasicDto> getDepartmentBasicInfoById(Long id);

    DepartmentDto createDepartment(DepartmentDto departmentDto);

    DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto);

    void deleteDepartment(Long id);

    /**
     * Get departments by municipality ID - returns simplified DTO for the municipality-service.
     */
    List<DepartmentSummaryDto> getDepartmentsByMunicipality(Long municipalityId);

    /**
     * Get Resources by department ID - returns simplified DTO
     */
    List<ResourceSummaryDto> getResourcesOfDepartment(Long departmentId);

    /**
     * Fetches basic department info for a given municipality.
     */
    List<DepartmentBasicDto> getDepartmentsBasicInfoByMunicipalityId(Long municipalityId);
}
