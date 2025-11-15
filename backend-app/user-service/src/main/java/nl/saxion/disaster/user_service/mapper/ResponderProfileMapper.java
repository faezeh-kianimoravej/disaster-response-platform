package nl.saxion.disaster.user_service.mapper;

import nl.saxion.disaster.user_service.dto.ResponderProfileDto;
import nl.saxion.disaster.user_service.model.entity.ResponderProfile;
import nl.saxion.disaster.user_service.model.entity.User;
import org.springframework.stereotype.Component;

@Component
public class ResponderProfileMapper {
    public ResponderProfile toEntity(ResponderProfileDto dto, User user) {
        if (dto == null) return null;
        return ResponderProfile.builder()
                .user(user)
                .departmentId(dto.departmentId())
                .primarySpecialization(dto.primarySpecialization())
                .secondarySpecializations(dto.secondarySpecializations())
                .isAvailable(dto.isAvailable())
                .currentDeploymentId(dto.currentDeploymentId())
                .build();
    }

    public ResponderProfileDto toDto(ResponderProfile entity) {
        if (entity == null) return null;
        return new ResponderProfileDto(
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getDepartmentId(),
                entity.getPrimarySpecialization(),
                entity.getSecondarySpecializations(),
                entity.isAvailable(),
                entity.getCurrentDeploymentId()
        );
    }

    /**
     * Update an existing ResponderProfile entity from a DTO. This centralizes update logic
     * so callers can avoid manual field copying.
     */
    public void updateEntity(ResponderProfileDto dto, ResponderProfile entity) {
        if (dto == null || entity == null) return;
        entity.setDepartmentId(dto.departmentId());
        entity.setPrimarySpecialization(dto.primarySpecialization());
        entity.setSecondarySpecializations(dto.secondarySpecializations());
        entity.setAvailable(dto.isAvailable());
        entity.setCurrentDeploymentId(dto.currentDeploymentId());
    }
}
