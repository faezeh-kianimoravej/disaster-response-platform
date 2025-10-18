package nl.saxion.disaster.municipality_service.mapper;

import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;

@Component
public class MunicipalityMapper implements BaseMapper<Municipality, MunicipalityDto> {

    @Override
    public MunicipalityDto toDto(Municipality entity) {
        if (entity == null) {
            return null;
        }

        String base64Image = null;
        if (entity.getImage() != null && entity.getImage().length > 0) {
            base64Image = Base64.getEncoder().encodeToString(entity.getImage());
        }

        return new MunicipalityDto(
                entity.getMunicipalityId(),
                entity.getRegionId(),
                entity.getName(),
                base64Image,
                entity.getDepartmentIds() != null ? List.copyOf(entity.getDepartmentIds()) : List.of()
        );
    }

    @Override
    public Municipality toEntity(MunicipalityDto dto) {
        if (dto == null) {
            return null;
        }

        byte[] imageBytes = null;
        if (dto.image() != null && !dto.image().isEmpty()) {
            try {
                imageBytes = Base64.getDecoder().decode(dto.image());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid Base64 image data in MunicipalityDto");
            }
        }

        return Municipality.builder()
                .municipalityId(dto.municipalityId())
                .regionId(dto.regionId())
                .name(dto.name())
                .image(imageBytes)
                .departmentIds(dto.departmentIds() != null ? List.copyOf(dto.departmentIds()) : List.of())
                .build();
    }
}
