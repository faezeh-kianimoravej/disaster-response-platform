package nl.saxion.disaster.user_service.dto;

import java.util.List;

/**
 * DTO used to return login response data.
 * It includes the user's email, their assigned roles (as RoleDto list),
 * and the generated JWT token.
 */
public record LoginResponseDto(
        String email,
        List<RoleDto> roles,
        String token
) {
}
