package nl.saxion.disaster.regionservice.dto;

/**
 * Simplified DTO for region list endpoints.
 * Does not include nested municipalities to avoid deep nesting in collection responses.
 */
public record RegionSummaryDto(
        Long regionId,
        String name,
        String image
) {
}
