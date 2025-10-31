package nl.saxion.disaster.user_service.mapper;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.mapper.contract.RequestMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import org.springframework.stereotype.Component;

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

    @Override
    public Optional<User> toEntity(UserRequestDto dto) {
        if (dto == null) return Optional.empty();

        Set<UserRole> userRoles = Optional.ofNullable(dto.roles())
                .orElse(Collections.emptySet())
                .stream()
                .map(roleMapper::toEntity)
                .peek(role -> role.setDeleted(false))
                .collect(Collectors.toSet());

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
