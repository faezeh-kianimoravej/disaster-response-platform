package nl.saxion.disaster.resourceservice.mapper;


import nl.saxion.disaster.resourceservice.dto.ResourceDto;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
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
                            res.getAvailable(),
                            res.getQuantity(),
                            Optional.ofNullable(res.getResourceType())
                                    .map(Enum::name)
                                    .orElse(null),
                            res.getDepartmentId(),
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
        String img = resourceDto.image();
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
        resource.setName(resourceDto.name());
        resource.setDescription(resourceDto.description());
        resource.setAvailable(resourceDto.available());
        resource.setQuantity(Optional.ofNullable(resourceDto.quantity()).orElse(1)
        );
        resource.setLatitude(resourceDto.latitude());
        resource.setLongitude(resourceDto.longitude());
        resource.setImage(imageBytes);
        resource.setDepartmentId(resourceDto.departmentId());
        mapResourceType(resourceDto, resource);
//        if (resourceDto.departmentId() != null) {
//            Department dept = new Department();
//            dept.setDepartmentId(resourceDto.departmentId());
//            resource.setDepartment(dept);
//        }


        return resource;
    }

    private static void mapResourceType(ResourceDto resourceDto, Resource resource) {
        String typeStr = resourceDto.resourceType();
        if (typeStr != null && !typeStr.isBlank()) {
            try {
                String normalized = typeStr.trim().replace(' ', '_').toUpperCase(Locale.ROOT);
                resource.setResourceType(ResourceType.valueOf(normalized));
            } catch (IllegalArgumentException ex) {
                System.err.println("⚠ Invalid resource resourceType: " + typeStr);
                resource.setResourceType(null);
            }
        } else {
            resource.setResourceType(null);
        }
    }

}
