package nl.saxion.disaster.user_service.service;


import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.UserDto;
import nl.saxion.disaster.user_service.mapper.RoleMapper;
import nl.saxion.disaster.user_service.mapper.UserMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.service.contract.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleMapper roleMapper;

    @Override
    public UserDto createUser(UserDto userDto) {
        User user = userMapper.toEntity(userDto)
                .orElseThrow(() -> new IllegalArgumentException("User DTO cannot be null"));
        User saved = userRepository.createUser(user);
        return userMapper.toDto(saved)
                .orElseThrow(() -> new IllegalStateException("Failed to map created user"));
    }

    @Override
    public List<UserDto> getAllActiveUsers() {
        return userRepository.findAllActiveUsers().stream()
                .filter(u -> !u.isDeleted())
                .map(u -> userMapper.toDto(u).orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<UserDto> getUserById(Long id) {
        return userRepository.findUserById(id)
                .filter(u -> !u.isDeleted())
                .flatMap(userMapper::toDto);
    }

    @Override
    public UserDto updateUser(Long id, UserDto updatedDto) {
        User existingUser = userRepository.findUserById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new IllegalArgumentException("User not found or deleted"));

        if (updatedDto.firstName() != null) existingUser.setFirstName(updatedDto.firstName());
        if (updatedDto.lastName() != null) existingUser.setLastName(updatedDto.lastName());
        if (updatedDto.email() != null) existingUser.setEmail(updatedDto.email());
        if (updatedDto.mobile() != null) existingUser.setMobile(updatedDto.mobile());
        if (updatedDto.password() != null) existingUser.setPassword(updatedDto.password());

        if (updatedDto.roles() != null) {
            existingUser.setRoles(
                    updatedDto.roles().stream()
                            .flatMap(r -> roleMapper.toEntity(r).stream())
                            .collect(Collectors.toSet())
            );
        }

        User savedUser = userRepository.createUser(existingUser);

        return userMapper.toDto(savedUser)
                .orElseThrow(() -> new IllegalStateException("Failed to map updated user"));
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.findUserById(id).ifPresent(user -> {
            if (!user.isDeleted()) {
                user.setDeleted(true);
                if (user.getRoles() != null) {
                    user.getRoles().forEach(role -> role.setDeleted(true));
                }
                userRepository.createUser(user);
            }
        });
    }
}
