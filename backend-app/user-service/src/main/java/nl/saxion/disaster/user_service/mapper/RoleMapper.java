package nl.saxion.disaster.user_service.mapper;

import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.mapper.contract.BaseMapper;
import nl.saxion.disaster.user_service.model.entity.UserRole;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class RoleMapper implements BaseMapper<UserRole, RoleDto> {

    @Override
    public Optional<RoleDto> toDto(UserRole entity) {
        return Optional.ofNullable(entity)
                .map(role -> new RoleDto(
                        role.getRoleType(),
                        role.getDepartment(),
                        role.getMunicipality(),
                        role.getRegion()
                ));
    }

    @Override
    public Optional<UserRole> toEntity(RoleDto dto) {
        return Optional.ofNullable(dto)
                .map(r -> {
                    UserRole role = new UserRole();
                    role.setRoleType(r.roleType());
                    role.setDepartment(r.department());
                    role.setMunicipality(r.municipality());
                    role.setRegion(r.region());
                    return role;
                });
    }

    @Override
    public List<RoleDto> toDtoList(List<UserRole> entityList) {
        if (entityList == null) return List.of();
        List<RoleDto> result = new ArrayList<>();
        for (UserRole role : entityList) {
            toDto(role).ifPresent(result::add);
        }
        return result;
    }

    @Override
    public List<UserRole> toEntityList(List<RoleDto> dtoList) {
        if (dtoList == null) return List.of();
        List<UserRole> result = new ArrayList<>();
        for (RoleDto dto : dtoList) {
            toEntity(dto).ifPresent(result::add);
        }
        return result;
    }
}
