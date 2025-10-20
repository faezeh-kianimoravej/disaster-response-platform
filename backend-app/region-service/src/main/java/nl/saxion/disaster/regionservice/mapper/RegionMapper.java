package nl.saxion.disaster.regionservice.mapper;

import nl.saxion.disaster.regionservice.dto.RegionDto;
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

    @Override
    public Region toEntity(RegionDto dto) {
        Region region = new Region();

        region.setRegionId(dto != null && dto.regionId() != null ? dto.regionId() : 0L);
        region.setName(dto != null && dto.name() != null ? dto.name() : "");

        if (dto != null && dto.image() != null && !dto.image().isEmpty()) {
            region.setImage(Base64.getDecoder().decode(dto.image()));
        } else {
            region.setImage(new byte[0]);
        }

        return region;
    }
}
