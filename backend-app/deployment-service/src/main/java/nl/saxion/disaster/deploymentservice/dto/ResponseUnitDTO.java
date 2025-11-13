package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.ResponderSpecialization;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ResponseUnitDTO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long unitId;
    private String unitName;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long departmentId;
    private ResponseUnitType unitType;

    private List<DefaultResourceDTO> defaultResources;
    private List<DefaultPersonnelSlotDTO> defaultPersonnel;

    private List<CurrentResourceDTO> currentResources;
    private List<CurrentPersonnelDTO> currentPersonnel;

    private ResponseUnitStatus status;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long currentDeploymentId;

    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class DefaultResourceDTO {
        @JsonSerialize(using = ToStringSerializer.class)
        private Long resourceId;
        private Integer quantity;
        private Boolean isPrimary;
    }

    @Data
    public static class DefaultPersonnelSlotDTO {
        @JsonSerialize(using = ToStringSerializer.class)
        private Long userId;
        private ResponderSpecialization specialization;
        private Boolean isRequired;
    }

    @Data
    public static class CurrentResourceDTO {
        @JsonSerialize(using = ToStringSerializer.class)
        private Long resourceId;
        private Integer quantity;
        private Boolean isPrimary;
    }

    @Data
    public static class CurrentPersonnelDTO {
        @JsonSerialize(using = ToStringSerializer.class)
        private Long userId;
        private ResponderSpecialization specialization;
    }
}
