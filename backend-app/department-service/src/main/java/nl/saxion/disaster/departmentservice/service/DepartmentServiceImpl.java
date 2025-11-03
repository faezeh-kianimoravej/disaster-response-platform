package nl.saxion.disaster.departmentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.client.ResourceClient;
import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceSummaryDto;
import nl.saxion.disaster.departmentservice.exception.DepartmentNotFoundException;
import nl.saxion.disaster.departmentservice.mapper.DepartmentMapper;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ResourceClient resourceClient;
    private final DepartmentMapper departmentMapper;

    /**
     * Get all departments - returns simplified DTO without nested resources.
     * This prevents deep nesting in collection responses.
     */
    @Override
    public List<DepartmentSummaryDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAllDepartments();

        return departments.stream()
                .map(departmentMapper::toSummaryDto)
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * Get single department by ID - returns full DTO with nested resource details.
     * This provides complete details for individual resource requests.
     */
    @Override
    public Optional<DepartmentDto> getDepartmentById(Long id) {
        return departmentRepository.findDepartmentById(id)
                .map(departmentMapper::toDto);
    }

    @Override
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        Department department = departmentMapper.toEntity(departmentDto);
        Department saved = departmentRepository.createDepartment(department);
        return departmentMapper.toDto(saved);
    }

    @Override
    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department department = departmentMapper.toEntity(departmentDto);
        Department updated = departmentRepository.updateDepartment(department);
        return departmentMapper.toDto(updated);
    }

    @Override
    public void deleteDepartment(Long id) {
        departmentRepository.deleteDepartment(id);
    }

    /**
     * Get departments by municipality ID - returns simplified DTO.
     * Used by municipality-service to populate nested departments.
     */
    @Override
    public List<DepartmentSummaryDto> getDepartmentsByMunicipality(Long municipalityId) {
        return departmentRepository.findDepartmentByMunicipalityId(municipalityId).stream()
                .map(departmentMapper::toSummaryDto)
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    public List<ResourceSummaryDto> getResourcesOfDepartment(Long departmentId) {
        Department department = departmentRepository.findDepartmentById(departmentId)
                .orElseThrow( () -> new DepartmentNotFoundException(departmentId));

        return resourceClient.getResourcesByDepartment(department.getDepartmentId());

        }

}
