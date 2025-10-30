package nl.saxion.disaster.user_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.mapper.contract.RequestMapper;
import nl.saxion.disaster.user_service.mapper.contract.ResponseMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.service.contract.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Service implementation for managing users.
 * Handles business logic such as password hashing, soft deletes,
 * and mapping between DTOs and entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RequestMapper<User, UserRequestDto> userRequestMapper;
    private final ResponseMapper<User, UserResponseDto> userResponseMapper;
    private final PasswordEncoder passwordEncoder;

    // --------------------------------------------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public UserResponseDto createUser(UserRequestDto requestDto) {
        if (requestDto == null) {
            log.error("Received null UserRequestDto in createUser()");
            throw new IllegalArgumentException("User request cannot be null");
        }

        log.info("Attempting to create new user with email: {}", requestDto.email());

        User user = userRequestMapper.toEntity(requestDto)
                .orElseThrow(() -> {
                    log.error("UserRequestMapper failed to convert request for email: {}", requestDto.email());
                    return new IllegalArgumentException("Invalid user data");
                });

        user.setPassword(passwordEncoder.encode(requestDto.password()));
        user.setPasswordUpdatedAt(OffsetDateTime.now());

        log.debug("Mapped User entity before saving: {}", user);

        User savedUser = userRepository.createUser(user);
        log.info("User successfully saved with ID: {}", savedUser.getId());

        return userResponseMapper.toDto(savedUser)
                .orElseThrow(() -> {
                    log.error("Failed to map User entity to UserResponseDto for ID: {}", savedUser.getId());
                    return new IllegalStateException("Failed to map user entity to response");
                });
    }

    // --------------------------------------------------------------------------------------------
    // GET ALL ACTIVE USERS
    // --------------------------------------------------------------------------------------------
    @Override
    public List<UserResponseDto> getAllActiveUsers() {
        log.info("Fetching all active (non-deleted) users from database.");

        List<User> users = Optional.ofNullable(userRepository.findAllActiveUsers())
                .orElse(List.of())
                .stream()
                .filter(user -> user != null && !user.isDeleted())
                .toList();

        log.debug("Found {} active users.", users.size());
        return userResponseMapper.toDtoList(users);
    }

    // --------------------------------------------------------------------------------------------
    // GET USER BY ID
    // --------------------------------------------------------------------------------------------
    @Override
    public Optional<UserResponseDto> getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);

        Optional<UserResponseDto> result = userRepository.findUserById(id)
                .filter(user -> !user.isDeleted())
                .flatMap(userResponseMapper::toDto);

        if (result.isPresent()) {
            log.debug("User found for ID: {}", id);
        } else {
            log.warn("No active user found for ID: {}", id);
        }

        return result;
    }

    // --------------------------------------------------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public UserResponseDto updateUser(Long id, UserRequestDto requestDto) {
        log.info("Updating user with ID: {}", id);

        User existingUser = userRepository.findUserById(id)
                .orElseThrow(() -> {
                    log.error("User not found for ID: {}", id);
                    return new IllegalArgumentException("User not found");
                });

        existingUser.setFirstName(requestDto.firstName());
        existingUser.setLastName(requestDto.lastName());
        existingUser.setEmail(requestDto.email());
        existingUser.setMobile(requestDto.mobile());
        existingUser.setUpdatedAt(OffsetDateTime.now());

        if (requestDto.password() != null && !requestDto.password().isBlank()) {
            log.debug("Password update requested for user ID: {}", id);
            existingUser.setPassword(passwordEncoder.encode(requestDto.password()));
            existingUser.setPasswordUpdatedAt(OffsetDateTime.now());
        }

        if (requestDto.roles() != null && !requestDto.roles().isEmpty()) {
            log.debug("Updating roles for user ID: {}", id);
            existingUser.getRoles().clear();
            var newRoles = userRequestMapper.toEntity(requestDto)
                    .map(User::getRoles)
                    .orElse(Set.of());
            newRoles.forEach(r -> r.setUser(existingUser));
            existingUser.getRoles().addAll(newRoles);
        }

        User updatedUser = userRepository.createUser(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return userResponseMapper.toDto(updatedUser)
                .orElseThrow(() -> {
                    log.error("Failed to map updated user entity with ID: {}", id);
                    return new IllegalStateException("Failed to map updated user");
                });
    }

    // --------------------------------------------------------------------------------------------
    // DELETE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public void deleteUser(Long id) {
        log.info("Attempting to soft delete user with ID: {}", id);

        User user = userRepository.findUserById(id)
                .orElseThrow(() -> {
                    log.error("User not found for ID: {}", id);
                    return new IllegalArgumentException("User not found");
                });

        user.setDeleted(true);
        user.setUpdatedAt(OffsetDateTime.now());

        userRepository.createUser(user);
        log.info("User with ID {} has been soft deleted.", id);
    }
}
