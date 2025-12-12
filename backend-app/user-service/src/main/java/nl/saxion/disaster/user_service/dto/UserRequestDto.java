package nl.saxion.disaster.user_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import nl.saxion.disaster.user_service.validation.OnCreate;
import nl.saxion.disaster.user_service.validation.OnUpdate;
import nl.saxion.disaster.user_service.dto.ResponderProfileDto;

import java.util.Set;

/**
 * DTO for creating or updating a user.
 * <p>
 * Performs validation on input data before it reaches the entity layer.
 * This ensures validation happens before password encoding or persistence.
 */
public record UserRequestDto(

        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
        @Pattern(
                regexp = "^[A-Za-zÀ-ÿ\\s'-]+$",
                message = "First name contains invalid characters"
        )
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
        @Pattern(
                regexp = "^[A-Za-zÀ-ÿ\\s'-]+$",
                message = "Last name contains invalid characters"
        )
        String lastName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Mobile Number is required")
        @Pattern(
                regexp = "^(\\+\\d{1,3})?\\d{9,15}$",
                message = "Invalid mobile number format"
        )
        String mobile,

        Set<RoleDto> roles,

        ResponderProfileDto responderProfile,

        @NotBlank(message = "Password is required", groups = OnCreate.class)
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must contain uppercase, lowercase, number, and special character",
                groups = OnCreate.class
        )
        @Pattern(
                regexp = "^$|^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
                message = "Password must be empty or meet complexity requirements",
                groups = OnUpdate.class
        )
        @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
        String password
) {
}
