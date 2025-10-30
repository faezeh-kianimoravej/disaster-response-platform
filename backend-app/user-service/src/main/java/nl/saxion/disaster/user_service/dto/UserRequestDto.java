package nl.saxion.disaster.user_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

/**
 * DTO for creating or updating a user.
 * Uses Java record for immutability and simplicity.
 */
public record UserRequestDto(

        @NotBlank
        String firstName,

        @NotBlank
        String lastName,

        @NotBlank
        @Email
        String email,

        String mobile,

        Set<RoleDto> roles,

        @NotBlank
        @Size(min = 8, max = 128)
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        String password
) {
}