package nl.saxion.disaster.resourceservice.dto;

/**
 * Minimal department DTO shared with other services.
 * <p>
 * Returned by <b>department-service</b> and consumed by
 * <b>resource-service</b> when allocating or displaying resources.
 * </p>
 */
public record DepartmentBasicDto(

        Long id,
        String name,
        Long municipalityId
) {
}
