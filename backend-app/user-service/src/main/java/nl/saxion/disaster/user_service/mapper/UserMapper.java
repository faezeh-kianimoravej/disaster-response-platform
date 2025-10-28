package nl.saxion.disaster.user_service.mapper;

import nl.saxion.disaster.user_service.dto.UserDto;
import nl.saxion.disaster.user_service.mapper.contract.BaseMapper;
import nl.saxion.disaster.user_service.model.entity.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class UserMapper implements BaseMapper<User, UserDto> {

    private final RoleMapper roleMapper = new RoleMapper();

    @Override
    public Optional<UserDto> toDto(User entity) {
        return Optional.ofNullable(entity)
                .map(user -> new UserDto(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getMobile(),
                        null,
                        user.getRoles() == null ? List.of()
                                : user.getRoles().stream()
                                .filter(role -> !role.isDeleted())
                                .map(r -> roleMapper.toDto(r).orElse(null))
                                .filter(r -> r != null)
                                .collect(Collectors.toList())
                ));
    }

    @Override
    public Optional<User> toEntity(UserDto dto) {
        return Optional.ofNullable(dto)
                .map(d -> {
                    User user = new User();
                    user.setId(d.id());
                    user.setFirstName(d.firstName());
                    user.setLastName(d.lastName());
                    user.setEmail(d.email());
                    user.setMobile(d.mobile());
                    user.setPassword(d.password());

                    if (d.roles() != null) {
                        user.setRoles(
                                new HashSet<>(roleMapper.toEntityList(d.roles()))
                        );
                    }

                    return user;
                });
    }

    @Override
    public List<UserDto> toDtoList(List<User> entityList) {
        if (entityList == null) return List.of();
        List<UserDto> result = new ArrayList<>();
        for (User user : entityList) {
            toDto(user).ifPresent(result::add);
        }
        return result;
    }

    @Override
    public List<User> toEntityList(List<UserDto> dtoList) {
        if (dtoList == null) return List.of();
        List<User> result = new ArrayList<>();
        for (UserDto dto : dtoList) {
            toEntity(dto).ifPresent(result::add);
        }
        return result;
    }
}
