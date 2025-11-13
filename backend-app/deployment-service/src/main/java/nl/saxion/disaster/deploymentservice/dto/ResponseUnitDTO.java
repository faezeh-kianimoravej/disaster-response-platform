package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ResponseUnitDTO {
    private Long unitId;
    private String unitName;
    private Long departmentId;
    private String unitType;

    private List<DefaultResourceDTO> defaultResources;
    private List<DefaultPersonnelSlotDTO> defaultPersonnel;

    private List<CurrentResourceDTO> currentResources;
    private List<CurrentPersonnelDTO> currentPersonnel;

    private String status;
    private Long currentDeploymentId;

    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    public static class DefaultResourceDTO {
        private Long resourceId;
        private Integer quantity;
        private Boolean isPrimary;
    }

    @Data
    public static class DefaultPersonnelSlotDTO {
        private Long userId;
        private String specialization;
        private Boolean isRequired;
    }

    @Data
    public static class CurrentResourceDTO {
        private Long resourceId;
        private Integer quantity;
        private Boolean isPrimary;
    }

    @Data
    public static class CurrentPersonnelDTO {
        private Long userId;
        private String specialization;
    }
}
