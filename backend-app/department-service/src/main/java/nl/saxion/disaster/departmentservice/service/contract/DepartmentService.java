package nl.saxion.disaster.departmentservice.service.contract;

import nl.saxion.disaster.departmentservice.model.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.model.entity.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {

    List<Department> getAllDepartments();

    Optional<Department> getDepartmentById(Long id);

    Department createDepartment(Department department);

    Department updateDepartment(Long id, Department departmentDetails);

    void deleteDepartment(Long id);

    List<DepartmentDto> getDepartmentsByMunicipality(Long municipalityId);
}
