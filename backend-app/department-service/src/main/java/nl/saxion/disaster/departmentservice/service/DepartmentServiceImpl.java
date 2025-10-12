package nl.saxion.disaster.departmentservice.service;

import nl.saxion.disaster.departmentservice.model.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.model.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAllDepartments();
    }

    @Override
    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findDepartmentById(id);
    }

    @Override
    public Department createDepartment(Department department) {
        return departmentRepository.createDepartment(department);
    }

    @Override
    public Department updateDepartment(Long id, Department departmentDetails) {
        return departmentRepository.updateDepartment(departmentDetails);
    }

    @Override
    public void deleteDepartment(Long id) {
        departmentRepository.deleteDepartment(id);
    }

    public List<DepartmentDto> getDepartmentsByMunicipality(Long municipalityId) {
        return departmentRepository.findDepartmentByMunicipalityId(municipalityId).stream()
                .map(this::mapDepartmentToDto)
                .toList();
    }

    private DepartmentDto mapDepartmentToDto(Department department) {
        if (department == null) return null;

        List<ResourceDto> resourceDtos =
                department.getResources() == null
                        ? List.of()
                        : department.getResources().stream()
                        .filter(Objects::nonNull)
                        .map(this::mapResourceToDto)
                        .toList();

        return new DepartmentDto(
                department.getMunicipalityId(),
                department.getDepartmentId(),
                department.getMunicipalityId(),
                department.getName(),
                resourceDtos
        );
    }

    private ResourceDto mapResourceToDto(Resource resource) {
        return new ResourceDto(
                resource.getResourceId(),
                resource.getName(),
                resource.getDescription(),
                resource.isAvailable(),
                resource.getQuantity(),
                resource.getResourceType() != null ? resource.getResourceType().name() : null,
                resource.getDepartment() != null ? resource.getDepartment().getDepartmentId() : null,
                resource.getLatitude(),
                resource.getLongitude(),
                resource.getImage()
        );
    }
}
