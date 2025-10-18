package nl.saxion.disaster.departmentservice.service.contract;

import nl.saxion.disaster.departmentservice.dto.DepartmentDto;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {

    List<DepartmentDto> getAllDepartments();

    Optional<DepartmentDto> getDepartmentById(Long id);

    DepartmentDto createDepartment(DepartmentDto departmentDto);

    DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto);

    void deleteDepartment(Long id);

    List<DepartmentDto> getDepartmentsByMunicipality(Long municipalityId);
}
