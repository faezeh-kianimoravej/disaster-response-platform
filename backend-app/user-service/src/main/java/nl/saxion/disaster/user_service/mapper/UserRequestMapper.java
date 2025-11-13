package nl.saxion.disaster.user_service.mapper;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.mapper.contract.RequestMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import org.springframework.stereotype.Component;
import nl.saxion.disaster.user_service.dto.ResponderProfileDto;
import nl.saxion.disaster.user_service.model.entity.ResponderProfile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Maps UserRequestDto to User entity.
 * <p>
 * Converts incoming user registration/update requests (with RoleDto set)
 * into full User entity including related UserRole objects.
 */
@Component
@RequiredArgsConstructor
public class UserRequestMapper implements RequestMapper<User, UserRequestDto> {
    private final RoleMapper roleMapper;
    private final ResponderProfileMapper responderProfileMapper;

    @Override
    public Optional<User> toEntity(UserRequestDto dto) {
        if (dto == null) return Optional.empty();

        Set<UserRole> userRoles = Optional.ofNullable(dto.roles())
                .orElse(Collections.emptySet())
                .stream()
                .map(roleMapper::toEntity)
                .peek(role -> role.setDeleted(false))
                .collect(Collectors.toSet());

        boolean hasResponderRole = userRoles.stream().anyMatch(r -> r.getRoleType() != null && r.getRoleType().name().equals("RESPONDER"));
        if (hasResponderRole && dto.responderProfile() == null) {
            throw new IllegalArgumentException("A responder profile is required when assigning the RESPONDER role.");
        }

        User user = User.builder()
            .firstName(dto.firstName())
            .lastName(dto.lastName())
            .email(dto.email())
            .mobile(dto.mobile())
            .password(dto.password())
            .roles(userRoles)
            .deleted(false)
            .build();

    userRoles.forEach(r -> r.setUser(user));

        ResponderProfileDto profileDto = dto.responderProfile();
        if (profileDto != null) {
            ResponderProfile profile = responderProfileMapper.toEntity(profileDto, user);
            user.setResponderProfile(profile);
        }

        return Optional.of(user);
    }

    @Override
    public List<User> toEntityList(List<UserRequestDto> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) return Collections.emptyList();
        return dtoList.stream()
                .map(this::toEntity)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
    }
}
