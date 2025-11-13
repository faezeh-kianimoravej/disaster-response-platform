package nl.saxion.disaster.resourceservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import nl.saxion.disaster.resourceservice.model.enums.ResourceCategory;
import nl.saxion.disaster.resourceservice.model.enums.ResourceStatus;
import nl.saxion.disaster.resourceservice.model.enums.ResourceKind;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;

public record ResourceDto(
        @JsonSerialize(using = ToStringSerializer.class)
        Long resourceId,
        @JsonSerialize(using = ToStringSerializer.class)
        Long departmentId,
        String name,
        String description,
        ResourceCategory category,
        ResourceType resourceType,
        ResourceKind resourceKind,
        ResourceStatus status,
        Integer totalQuantity,
        Integer availableQuantity,
        String unit,
        Boolean isTrackable,
        Double latitude,
        Double longitude,
        java.time.LocalDateTime lastLocationUpdate,
        @JsonSerialize(using = ToStringSerializer.class)
        Long currentDeploymentId,
        Integer deployedQuantity,
        String image
) {}
