package nl.saxion.disaster.regionservice.mapper;

import nl.saxion.disaster.regionservice.dto.RegionDto;
import nl.saxion.disaster.regionservice.dto.RegionSummaryDto;
import nl.saxion.disaster.regionservice.model.Region;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Collections;

@Component
public class RegionMapper implements BaseMapper<Region, RegionDto> {

    @Override
    public RegionDto toDto(Region entity) {
        if (entity == null) {
            return new RegionDto(0L, "", "", Collections.emptyList());
        }

        String base64Image = "";
        if (entity.getImage() != null && entity.getImage().length > 0) {
            base64Image = Base64.getEncoder().encodeToString(entity.getImage());
        }

        return new RegionDto(
                entity.getRegionId() != null ? entity.getRegionId() : 0L,
                entity.getName() != null ? entity.getName() : "",
                base64Image,
                Collections.emptyList() // چون در entity نداریم
        );
    }

    /**
     * Convert Region entity to simplified summary DTO (for collection endpoints).
     * Does not include municipalities to avoid deep nesting.
     */
    public RegionSummaryDto toSummaryDto(Region entity) {
        if (entity == null) {
            return new RegionSummaryDto(0L, "", "");
        }

        String base64Image = "";
        if (entity.getImage() != null && entity.getImage().length > 0) {
            base64Image = Base64.getEncoder().encodeToString(entity.getImage());
        }

        return new RegionSummaryDto(
                entity.getRegionId() != null ? entity.getRegionId() : 0L,
                entity.getName() != null ? entity.getName() : "",
                base64Image
        );
    }

    @Override
    public Region toEntity(RegionDto dto) {
        Region region = new Region();

        region.setRegionId(dto != null && dto.regionId() != null ? dto.regionId() : 0L);
        region.setName(dto != null && dto.name() != null ? dto.name() : "");

        if (dto != null && dto.image() != null && !dto.image().isEmpty()) {
            try {
                // Remove data URL prefix if present (e.g., "data:image/png;base64,")
                String base64Data = dto.image();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                region.setImage(Base64.getDecoder().decode(base64Data));
            } catch (IllegalArgumentException e) {
                System.err.println("Failed to decode region image: " + e.getMessage());
                region.setImage(new byte[0]);
            }
        } else {
            region.setImage(new byte[0]);
        }

        return region;
    }
}
