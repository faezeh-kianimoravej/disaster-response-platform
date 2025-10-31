package nl.saxion.disaster.user_service.dto;

import java.time.OffsetDateTime;
import java.util.Set;

public record UserResponseDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        String mobile,
        boolean deleted,
        Set<RoleDto> roles,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime passwordUpdatedAt
) {
}