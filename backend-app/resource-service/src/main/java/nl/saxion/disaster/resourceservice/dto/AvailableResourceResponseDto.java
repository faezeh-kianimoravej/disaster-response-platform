package nl.saxion.disaster.resourceservice.dto;

public record AvailableResourceResponseDto(

        Long id,
        String type,
        String department,
        String municipality,
        int available,
        Double distance
) {
}
