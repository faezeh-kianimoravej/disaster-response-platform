package nl.saxion.disaster.municipality_service.mapper;

import nl.saxion.disaster.municipality_service.dto.MunicipalityDto;
import nl.saxion.disaster.municipality_service.dto.MunicipalitySummaryDto;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Collections;
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

        // Departments will be populated by the service layer via Feign client
        return new MunicipalityDto(
                entity.getMunicipalityId(),
                entity.getRegionId(),
                entity.getName(),
                base64Image,
                Collections.emptyList() // Will be populated by service
        );
    }

    /**
     * Convert Municipality entity to simplified summary DTO (for collection endpoints).
     * Does not include department IDs to avoid deep nesting.
     */
    public MunicipalitySummaryDto toSummaryDto(Municipality entity) {
        if (entity == null) {
            return null;
        }

        String base64Image = null;
        if (entity.getImage() != null && entity.getImage().length > 0) {
            base64Image = Base64.getEncoder().encodeToString(entity.getImage());
        }

        return new MunicipalitySummaryDto(
                entity.getMunicipalityId(),
                entity.getRegionId(),
                entity.getName(),
                base64Image
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
                // Remove data URL prefix if present (e.g., "data:image/png;base64,")
                String base64Data = dto.image();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                imageBytes = Base64.getDecoder().decode(base64Data);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid Base64 image data in MunicipalityDto: " + e.getMessage());
            }
        }

        // Extract department IDs from department summaries
        List<Long> departmentIds = Collections.emptyList();
        if (dto.departments() != null) {
            departmentIds = dto.departments().stream()
                    .map(dept -> dept.departmentId())
                    .toList();
        }

        return Municipality.builder()
                .municipalityId(dto.municipalityId())
                .regionId(dto.regionId())
                .name(dto.name())
                .image(imageBytes)
                .departmentIds(departmentIds)
                .build();
    }
}
