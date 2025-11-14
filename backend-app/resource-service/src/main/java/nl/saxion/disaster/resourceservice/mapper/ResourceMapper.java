package nl.saxion.disaster.resourceservice.mapper;


import nl.saxion.disaster.resourceservice.dto.ResourceDto;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import org.springframework.stereotype.Component;

import java.util.Base64;
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
                            res.getDepartmentId(),
                            res.getName(),
                            res.getDescription(),
                            res.getCategory(),
                            res.getResourceType(),
                            res.getResourceKind(),
                            res.getStatus(),
                            res.getTotalQuantity(),
                            res.getAvailableQuantity(),
                            res.getUnit(),
                            res.getIsTrackable(),
                            res.getLatitude(),
                            res.getLongitude(),
                            res.getLastLocationUpdate(),
                            res.getCurrentDeploymentId(),
                            res.getDeployedQuantity(),
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
        resource.setDepartmentId(resourceDto.departmentId());
        resource.setName(resourceDto.name());
        resource.setDescription(resourceDto.description());
        resource.setCategory(resourceDto.category());
        resource.setResourceType(resourceDto.resourceType());
        resource.setResourceKind(resourceDto.resourceKind());
        resource.setStatus(resourceDto.status());
        resource.setTotalQuantity(resourceDto.totalQuantity());
        resource.setAvailableQuantity(resourceDto.availableQuantity());
        resource.setUnit(resourceDto.unit());
        resource.setIsTrackable(resourceDto.isTrackable());
        resource.setLatitude(resourceDto.latitude());
        resource.setLongitude(resourceDto.longitude());
        resource.setLastLocationUpdate(resourceDto.lastLocationUpdate());
        resource.setCurrentDeploymentId(resourceDto.currentDeploymentId());
        resource.setDeployedQuantity(resourceDto.deployedQuantity());
        resource.setImage(imageBytes);
        return resource;
    }

}
