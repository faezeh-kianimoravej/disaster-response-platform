package nl.saxion.disaster.user_service.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.LoginRequestDto;
import nl.saxion.disaster.user_service.dto.LoginResponseDto;
import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.exception.InvalidCredentialsException;
import nl.saxion.disaster.user_service.mapper.RoleMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.security.JwtUtil;
import nl.saxion.disaster.user_service.service.contract.UserAuthenticationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of UserAuthenticationService.
 * Handles user authentication and JWT generation.
 */
@Service
@RequiredArgsConstructor
public class UserAuthenticationServiceImpl implements UserAuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleMapper roleMapper;

    @Override
    public LoginResponseDto login(LoginRequestDto request) {
        // Find user by email
        User user = userRepository.findUserByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException("No user found with the given email address."));

        // Verify password
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Incorrect password");
        }

        // Map roles to DTOs
        List<RoleDto> roleDtos = user.getRoles()
                .stream()
                .map(roleMapper::toDto)
                .toList();

        //  Generate JWT token
        String token = jwtUtil.generateToken(user);

        // Return response DTO
        return new LoginResponseDto(user.getEmail(), roleDtos, token);
    }
}
