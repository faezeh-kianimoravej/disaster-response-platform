package nl.saxion.disaster.user_service.dto;

import nl.saxion.disaster.user_service.model.enums.ResponderSpecialization;

import java.util.List;

public record ResponderProfileDto(
    Long userId,
    Long departmentId,
    ResponderSpecialization primarySpecialization,
    List<ResponderSpecialization> secondarySpecializations,
    boolean isAvailable,
    Long currentDeploymentId
) {}
