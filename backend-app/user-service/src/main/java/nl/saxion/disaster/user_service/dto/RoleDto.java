package nl.saxion.disaster.user_service.dto;

import nl.saxion.disaster.user_service.model.enums.RoleType;

/**
 * RoleDto represents a simplified version of the Role entity,
 * used for transferring user role information through the API layer.
 * <p>
 * Each role may optionally be associated with a specific
 * department, municipality, or region — depending on its type.
 * <p>
 * Example:
 * - RoleType.ADMIN → all IDs are null
 * - RoleType.DEPARTMENT_USER → departmentId is set
 * - RoleType.MUNICIPALITY_USER → municipalityId is set
 * - RoleType.REGION_USER → regionId is set
 */
public record RoleDto(
        RoleType roleType,
        Long departmentId,
        Long municipalityId,
        Long regionId
) {
}
