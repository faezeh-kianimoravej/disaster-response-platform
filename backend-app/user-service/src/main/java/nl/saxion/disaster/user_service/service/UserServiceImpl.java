package nl.saxion.disaster.user_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.mapper.contract.RequestMapper;
import nl.saxion.disaster.user_service.mapper.contract.ResponseMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.ResponderProfile;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.repository.contract.ResponderProfileRepository;
import nl.saxion.disaster.user_service.mapper.ResponderProfileMapper;
import nl.saxion.disaster.user_service.service.contract.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RequestMapper<User, UserRequestDto> userRequestMapper;
    private final ResponseMapper<User, UserResponseDto> userResponseMapper;
    private final PasswordEncoder passwordEncoder;
    private final ResponderProfileRepository responderProfileRepository;
    private final ResponderProfileMapper responderProfileMapper;

    // --------------------------------------------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public UserResponseDto createUser(UserRequestDto requestDto) {
        if (requestDto == null) {
            log.error("Received null UserRequestDto in createUser()");
            throw new IllegalArgumentException("User request cannot be null");
        }

        log.info("Creating new user with email: {}", requestDto.email());

        User user = userRequestMapper.toEntity(requestDto)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user data"));

        user.setPassword(passwordEncoder.encode(requestDto.password()));
        user.setPasswordUpdatedAt(OffsetDateTime.now());

        User savedUser = userRepository.createUser(user);
        if (user.getResponderProfile() != null) {
            user.getResponderProfile().setUser(savedUser);
            responderProfileRepository.save(user.getResponderProfile());
        }
        log.info("User successfully saved with ID: {}", savedUser.getId());

        return userResponseMapper.toDto(savedUser)
            .orElseThrow(() -> new IllegalStateException("Failed to map user entity to response"));
    }

    // --------------------------------------------------------------------------------------------
    // GET ALL ACTIVE USERS
    // --------------------------------------------------------------------------------------------
    @Override
    public List<UserResponseDto> getAllActiveUsers() {
        log.info("Fetching all active users...");

        List<User> users = Optional.ofNullable(userRepository.findAllActiveUsers())
                .orElse(List.of())
                .stream()
                .filter(u -> u != null && !u.isDeleted())
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

        return userRepository.findUserById(id)
                .filter(u -> !u.isDeleted())
                .flatMap(userResponseMapper::toDto);
    }

    // --------------------------------------------------------------------------------------------
    // GET USER BY EMAIL
    // --------------------------------------------------------------------------------------------
    @Override
    public Optional<UserResponseDto> getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);

        return userRepository.findUserByEmail(email)
                .filter(u -> !u.isDeleted())
                .flatMap(userResponseMapper::toDto);
    }

    // --------------------------------------------------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public UserResponseDto updateUser(Long id, UserRequestDto requestDto) {
        log.info("Updating user with ID: {}", id);

        User existingUser = userRepository.findUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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

        if (requestDto.responderProfile() != null) {
            var existingProfileOpt = responderProfileRepository.findByUserId(existingUser.getId());
            ResponderProfile profileToSave;
            if (existingProfileOpt.isPresent()) {
                var existingProfile = existingProfileOpt.get();
                responderProfileMapper.updateEntity(requestDto.responderProfile(), existingProfile);
                profileToSave = existingProfile;
            } else {
                profileToSave = responderProfileMapper.toEntity(requestDto.responderProfile(), existingUser);
            }
            profileToSave.setUser(existingUser);
            responderProfileRepository.save(profileToSave);
            existingUser.setResponderProfile(profileToSave);
        } else {
            responderProfileRepository.deleteByUserId(existingUser.getId());
            existingUser.setResponderProfile(null);
        }

        User updatedUser = userRepository.createUser(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return userResponseMapper.toDto(updatedUser)
                .orElseThrow(() -> new IllegalStateException("Failed to map updated user"));
    }

    // --------------------------------------------------------------------------------------------
    // DELETE USER (SOFT DELETE)
    // --------------------------------------------------------------------------------------------
    @Override
    public void deleteUser(Long id) {
        log.info("Soft-deleting user with ID: {}", id);

        User user = userRepository.findUserById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setDeleted(true);
        user.setUpdatedAt(OffsetDateTime.now());

        responderProfileRepository.deleteByUserId(user.getId());
        user.setResponderProfile(null);

        userRepository.createUser(user);
        log.info("User with ID {} marked as deleted.", id);
    }

    // --------------------------------------------------------------------------------------------
    // USERS BY ORGANIZATIONAL SCOPE
    // --------------------------------------------------------------------------------------------

    @Override
    public List<UserResponseDto> getUsersByDepartment(Long departmentId) {
        log.info("Fetching users by department ID: {}", departmentId);
        List<User> users = userRepository.findUsersByScope("department", departmentId);
        log.debug("Found {} users in department {}", users.size(), departmentId);
        return userResponseMapper.toDtoList(users);
    }

    @Override
    public List<UserResponseDto> getUsersByMunicipality(Long municipalityId) {
        log.info("Fetching users by municipality ID: {}", municipalityId);
        List<User> users = userRepository.findUsersByScope("municipality", municipalityId);
        log.debug("Found {} users in municipality {}", users.size(), municipalityId);
        return userResponseMapper.toDtoList(users);
    }

    @Override
    public List<UserResponseDto> getUsersByRegion(Long regionId) {
        log.info("Fetching users by region ID: {}", regionId);
        List<User> users = userRepository.findUsersByScope("region", regionId);
        log.debug("Found {} users in region {}", users.size(), regionId);
        return userResponseMapper.toDtoList(users);
    }
}
