package nl.saxion.disaster.resourceservice.dto;

public record ResourceBasicDto(

        Long id,
        String name,
        String resourceType,
        Long departmentId
) {
}
