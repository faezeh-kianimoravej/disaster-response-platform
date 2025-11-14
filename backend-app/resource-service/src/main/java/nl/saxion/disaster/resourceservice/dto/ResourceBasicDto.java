package nl.saxion.disaster.resourceservice.dto;

import nl.saxion.disaster.resourceservice.model.enums.ResourceType;

public record ResourceBasicDto(

        Long id,
        String name,
        ResourceType resourceType,
        Long departmentId
) {
}
