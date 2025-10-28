package nl.saxion.disaster.user_service.dto;

import java.util.List;

public record UserDto(

        Long id,
        String firstName,
        String lastName,
        String email,
        String mobile,
        String password,  // در زمان پاسخ (response) می‌تونی null برگردونی
        List<RoleDto> roles
) {
}
