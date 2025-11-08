package nl.saxion.disaster.resourceservice.dto;

/**
 * DTO returned as the result of resource search for a specific incident.
 * <p>
 * Used by the frontend to display available resources filtered by type,
 * municipality, and department. Matches the structure of the
 * <b>ResourceSearchResult</b> TypeScript interface.
 * </p>
 */
public record ResourceSearchResponseDto(

        String name,
        Long resourceId,
        String resourceType,
        String department,
        String municipality,
        int available,
        String distance
) {
}

