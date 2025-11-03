package nl.saxion.disaster.user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDto(
        @Email
        String email,

        @NotBlank
        String password
) {
}
