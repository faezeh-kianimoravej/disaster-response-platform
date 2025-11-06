package nl.saxion.disaster.departmentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.client.ResourceClient;
import nl.saxion.disaster.departmentservice.dto.DepartmentBasicDto;
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

    /**
     * Retrieves a lightweight version of a Department entity by its unique ID.
     * <p>
     * This method is specifically designed for inter-service communication — for example,
     * when another microservice such as the <b>resource-service</b> needs only basic
     * department information (ID, name, and municipality ID) without loading nested
     * resources or images.
     * </p>
     *
     * @param id The unique identifier of the department.
     * @return An {@link Optional} containing {@link DepartmentBasicDto} if found,
     * or an empty Optional if no department with the given ID exists.
     */
    @Override
    public Optional<DepartmentBasicDto> getDepartmentBasicInfoById(Long id) {
        return departmentRepository.findDepartmentById(id)
                .map(department -> new DepartmentBasicDto(
                        department.getDepartmentId(),
                        department.getName(),
                        department.getMunicipalityId()
                ));
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
                .orElseThrow(() -> new DepartmentNotFoundException(departmentId));

        return resourceClient.getResourcesByDepartment(department.getDepartmentId());
    }

    /**
     * Retrieves basic information for all departments belonging to a specific municipality.
     * <p>
     * This method is primarily used by other microservices — such as the
     * <b>resource-service</b> — to fetch lightweight department data
     * (ID, name, municipalityId) when filtering or displaying resources
     * related to a given municipality.
     * </p>
     *
     * @param municipalityId the unique ID of the municipality
     * @return a list of {@link DepartmentBasicDto} objects containing basic department details;
     * an empty list if no departments are found
     */
    @Override
    public List<DepartmentBasicDto> getDepartmentsBasicInfoByMunicipalityId(Long municipalityId) {
        return departmentRepository.findDepartmentByMunicipalityId(municipalityId)
                .stream()
                .map(dept -> new DepartmentBasicDto(
                        dept.getDepartmentId(),
                        dept.getName(),
                        dept.getMunicipalityId()
                ))
                .toList();
    }
}
