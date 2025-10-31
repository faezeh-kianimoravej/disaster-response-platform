package nl.saxion.disaster.user_service.service.contract;

import nl.saxion.disaster.user_service.dto.LoginRequestDto;
import nl.saxion.disaster.user_service.dto.LoginResponseDto;

/**
 * Service interface responsible for handling user authentication logic.
 * Defines operations related to user login and token generation.
 */
public interface UserAuthenticationService {

    /**
     * Authenticates a user by verifying their email and password,
     * and returns a JWT token with role information upon success.
     *
     * @param request The login credentials (email and password)
     * @return A LoginResponseDto containing the JWT token and user role details
     */
    LoginResponseDto login(LoginRequestDto request);
}

