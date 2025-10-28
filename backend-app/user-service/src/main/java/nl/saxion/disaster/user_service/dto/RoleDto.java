package nl.saxion.disaster.user_service.dto;

import nl.saxion.disaster.user_service.model.enums.RoleType;

public record RoleDto(

        RoleType roleType,
        String department,
        String municipality,
        String region
) {
}
