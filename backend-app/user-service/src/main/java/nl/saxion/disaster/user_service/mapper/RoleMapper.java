package nl.saxion.disaster.user_service.mapper;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import org.springframework.stereotype.Component;

/**
 * RoleMapper is responsible for converting between
 * UserRole entities (used by JPA/database) and RoleDto objects (used in API responses).
 * <p>
 * This ensures that domain logic and API layers remain decoupled.
 */
@Component
@RequiredArgsConstructor
public class RoleMapper {

    /**
     * Converts a UserRole entity into a RoleDto for API responses.
     *
     * @param entity The UserRole entity fetched from the database
     * @return A RoleDto containing role type and optional scope IDs
     */
    public RoleDto toDto(UserRole entity) {
        if (entity == null) return null;

        return new RoleDto(
                entity.getRoleType(),
                entity.getDepartmentId(),
                entity.getMunicipalityId(),
                entity.getRegionId()
        );
    }

    /**
     * Converts a RoleDto (received from API) into a UserRole entity for persistence.
     *
     * @param dto The RoleDto containing role details
     * @return A UserRole entity ready to be saved into the database
     */
    public UserRole toEntity(RoleDto dto) {
        if (dto == null) return null;

        return UserRole.builder()
                .roleType(dto.roleType())
                .departmentId(dto.departmentId())
                .municipalityId(dto.municipalityId())
                .regionId(dto.regionId())
                .deleted(false)
                .build();
    }
}
