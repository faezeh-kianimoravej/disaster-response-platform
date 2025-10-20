package nl.saxion.disaster.departmentservice.service;

import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.mapper.DepartmentMapper;
import nl.saxion.disaster.departmentservice.mapper.ResourceMapper;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.repository.contract.DepartmentRepository;
import nl.saxion.disaster.departmentservice.service.contract.DepartmentService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final ResourceMapper resourceMapper;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
        this.resourceMapper = new ResourceMapper();
        this.departmentMapper = new DepartmentMapper(resourceMapper);
    }

    /**
     * Get all departments - returns simplified DTO without nested resources.
     * This prevents deep nesting in collection responses.
     */
    @Override
    public List<DepartmentSummaryDto> getAllDepartments() {
        return departmentRepository.findAllDepartments().stream()
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
}
