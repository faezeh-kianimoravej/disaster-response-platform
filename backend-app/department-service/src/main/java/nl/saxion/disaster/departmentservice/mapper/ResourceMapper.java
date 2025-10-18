package nl.saxion.disaster.departmentservice.mapper;

import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.model.entity.Department;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Component
public class ResourceMapper implements BaseMapper<Resource, ResourceDto> {

    @Override
    public ResourceDto toDto(Resource resource) {
        return Optional.ofNullable(resource)
                .map(res -> {
                    String imageBase64 = Optional.ofNullable(res.getImage())
                            .map(bytes -> Base64.getEncoder().encodeToString(bytes))
                            .orElse(null);

                    return new ResourceDto(
                            res.getResourceId(),
                            res.getName(),
                            res.getDescription(),
                            res.isAvailable(),
                            res.getQuantity(),
                            Optional.ofNullable(res.getResourceType())
                                    .map(Enum::name)
                                    .orElse(null),
                            Optional.ofNullable(res.getDepartment())
                                    .map(Department::getDepartmentId)
                                    .orElse(null),
                            res.getLatitude(),
                            res.getLongitude(),
                            imageBase64
                    );
                })
                .orElse(null);
    }

    @Override
    public Resource toEntity(ResourceDto resourceDto) {
        if (resourceDto == null) return null;
        byte[] imageBytes = null;
        String img = resourceDto.imageBase64();
        if (img != null && !img.isBlank()) {
            String raw = img.startsWith("data:") ? img.substring(img.indexOf(',') + 1) : img;
            try {
                imageBytes = Base64.getDecoder().decode(raw);
            } catch (IllegalArgumentException e) {
                imageBytes = null;
            }
        }
        Resource resource = new Resource();
        resource.setResourceId(resourceDto.resourceId());
        resource.setName(resourceDto.resourceName());
        resource.setDescription(resourceDto.description());
        resource.setAvailable(Boolean.TRUE.equals(resourceDto.available()));
        resource.setQuantity(Optional.ofNullable(resourceDto.quantity()).orElse(1)
        );
        resource.setLatitude(resourceDto.latitude());
        resource.setLongitude(resourceDto.longitude());
        resource.setImage(imageBytes);
        mapResourceType(resourceDto, resource);
        if (resourceDto.departmentId() != null) {
            Department dept = new Department();
            dept.setDepartmentId(resourceDto.departmentId());
            resource.setDepartment(dept);
        }

        return resource;
    }

    private static void mapResourceType(ResourceDto resourceDto, Resource resource) {
        String typeStr = resourceDto.type();
        if (typeStr != null && !typeStr.isBlank()) {
            try {
                String normalized = typeStr.trim().replace(' ', '_').toUpperCase(Locale.ROOT);
                resource.setResourceType(ResourceType.valueOf(normalized));
            } catch (IllegalArgumentException ex) {
                System.err.println("⚠ Invalid resource type: " + typeStr);
                resource.setResourceType(null);
            }
        } else {
            resource.setResourceType(null);
        }
    }

}
