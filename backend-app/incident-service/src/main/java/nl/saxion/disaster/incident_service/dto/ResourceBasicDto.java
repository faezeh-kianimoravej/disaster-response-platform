package nl.saxion.disaster.incident_service.dto;

public record ResourceBasicDto(

        Long id,
        String resourceType,
        Long departmentId
) {
}
