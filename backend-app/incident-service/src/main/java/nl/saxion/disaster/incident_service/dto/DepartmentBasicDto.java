package nl.saxion.disaster.incident_service.dto;

public record DepartmentBasicDto(

        Long id,
        String name,
        Long municipalityId
) {
}
