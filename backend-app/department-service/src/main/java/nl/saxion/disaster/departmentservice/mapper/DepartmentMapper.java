package nl.saxion.disaster.departmentservice.mapper;

import nl.saxion.disaster.departmentservice.dto.DepartmentDto;
import nl.saxion.disaster.departmentservice.dto.DepartmentSummaryDto;
import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;
import java.util.Objects;

@Component
public class DepartmentMapper implements BaseMapper<Department, DepartmentDto> {

    private final ResourceMapper resourceMapper;

    public DepartmentMapper(ResourceMapper resourceMapper) {
        this.resourceMapper = resourceMapper;
    }

    @Override
    public DepartmentDto toDto(Department department) {
        if (department == null) {
            throw new IllegalArgumentException("Department cannot be null");
        }
        String imageBase64 = null;
        if (department.getImage() != null && department.getImage().length > 0) {
            String base64 = Base64.getEncoder().encodeToString(department.getImage());
            imageBase64 = "data:image/png;base64," + base64;
        }
        List<ResourceDto> resourceDtos = department.getResources() == null
                ? List.of()
                : department.getResources().stream()
                .filter(Objects::nonNull)
                .map(resourceMapper::toDto)
                .toList();
        return new DepartmentDto(
                null,
                department.getDepartmentId(),
                department.getMunicipalityId(),
                department.getName(),
                imageBase64,
                resourceDtos
        );
    }

    /**
     * Convert Department entity to simplified summary DTO (for collection endpoints).
     * Does not include resources to avoid deep nesting.
     */
    public DepartmentSummaryDto toSummaryDto(Department department) {
        if (department == null) {
            throw new IllegalArgumentException("Department cannot be null");
        }
        String imageBase64 = null;
        if (department.getImage() != null && department.getImage().length > 0) {
            String base64 = Base64.getEncoder().encodeToString(department.getImage());
            imageBase64 = "data:image/png;base64," + base64;
        }
        return new DepartmentSummaryDto(
                null,
                department.getDepartmentId(),
                department.getMunicipalityId(),
                department.getName(),
                imageBase64
        );
    }


    @Override
    public Department toEntity(DepartmentDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("DepartmentDto cannot be null");
        }

        Department department = new Department();

        department.setDepartmentId(dto.departmentId());
        department.setMunicipalityId(dto.municipalityId());
        department.setName(dto.name());

        if (dto.image() != null && !dto.image().isEmpty()) {
            try {
                // Remove data URL prefix if present (e.g., "data:image/png;base64,")
                String base64Data = dto.image();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                department.setImage(Base64.getDecoder().decode(base64Data));
            } catch (IllegalArgumentException e) {
                System.err.println("Failed to decode image: " + e.getMessage());
                department.setImage(null);
            }
        } else {
            department.setImage(null);
        }

        if (dto.resourceDtoList() != null && !dto.resourceDtoList().isEmpty()) {
            List<Resource> resources = dto.resourceDtoList().stream()
                    .filter(Objects::nonNull)
                    .map(resourceMapper::toEntity)
                    .toList();

            department.setResources(resources);
            resources.forEach(r -> r.setDepartment(department));
        } else {
            department.setResources(List.of());
        }

        return department;
    }

}
