package nl.saxion.disaster.regionservice.dto;


import java.util.List;

public record RegionDto(

        Long regionId,
        String name,
        String image,
        List<MunicipalityDto> municipalities
) {
}
