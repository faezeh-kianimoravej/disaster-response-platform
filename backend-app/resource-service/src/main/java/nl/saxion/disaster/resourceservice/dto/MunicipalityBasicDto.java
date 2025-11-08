package nl.saxion.disaster.resourceservice.dto;

import java.util.List;

/**
 * Lightweight DTO used for inter-service communication.
 * <p>
 * Sent from <b>municipality-service</b> to <b>resource-service</b>
 * when only basic municipality data (ID and name) is required.
 * </p>
 */
public record MunicipalityBasicDto(

        Long id,
        String name,
        List<Long> departmentIds
) {
}
