package nl.saxion.disaster.user_service.mapper;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleMapper {

    public RoleDto toDto(UserRole entity) {
        return new RoleDto(
                entity.getRoleType(),
                entity.getDepartmentId(),
                entity.getMunicipalityId(),
                entity.getRegionId()
        );
    }

    public UserRole toEntity(RoleDto dto) {
        return UserRole.builder()
                .roleType(dto.roleType())
                .departmentId(dto.departmentId())
                .municipalityId(dto.municipalityId())
                .regionId(dto.regionId())
                .deleted(false)
                .build();
    }
}
