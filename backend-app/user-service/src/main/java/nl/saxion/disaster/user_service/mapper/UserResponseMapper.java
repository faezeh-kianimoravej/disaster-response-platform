package nl.saxion.disaster.user_service.mapper;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.mapper.contract.ResponseMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Maps User entity to UserResponseDto.
 * <p>
 * Converts a full User entity, including related UserRole entities,
 * into a DTO that can be safely returned by the API.
 */
@Component
@RequiredArgsConstructor
public class UserResponseMapper implements ResponseMapper<User, UserResponseDto> {

    private final RoleMapper roleMapper;

    @Override
    public Optional<UserResponseDto> toDto(User entity) {
        if (entity == null) return Optional.empty();

        Set<RoleDto> roles = Optional.ofNullable(entity.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .map(roleMapper::toDto)
                .collect(Collectors.toSet());

        return Optional.of(new UserResponseDto(
                entity.getId(),
                entity.getFirstName(),
                entity.getLastName(),
                entity.getEmail(),
                entity.getMobile(),
                entity.isDeleted(),
                roles,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getPasswordUpdatedAt(),
                entity.getResponderProfile() != null
                    ? new nl.saxion.disaster.user_service.dto.ResponderProfileDto(
                        entity.getResponderProfile().getUser() != null ? entity.getResponderProfile().getUser().getId() : null,
                        entity.getResponderProfile().getDepartmentId(),
                        entity.getResponderProfile().getPrimarySpecialization(),
                        entity.getResponderProfile().getSecondarySpecializations(),
                        entity.getResponderProfile().isAvailable(),
                        entity.getResponderProfile().getCurrentDeploymentId()
                    )
                    : null
        ));
    }

    @Override
    public List<UserResponseDto> toDtoList(List<User> entityList) {
        if (entityList == null || entityList.isEmpty()) return Collections.emptyList();
        return entityList.stream()
                .map(this::toDto)
                .flatMap(Optional::stream)
                .collect(Collectors.toList());
    }
}
