package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.ResponderSpecialization;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.util.List;

@Data
public class ResponseUnitCreateDTO {

    @NotBlank
    private String unitName;

    @NotNull
    @Min(1)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long departmentId;

    @NotNull
    private ResponseUnitType unitType;

    private List<DefaultResourceDTO> defaultResources;
    private List<DefaultPersonnelDTO> defaultPersonnel;

    @NotNull
    private ResponseUnitStatus status;

    @Data
    public static class DefaultResourceDTO {
        @NotNull
        @Min(1)
        @JsonSerialize(using = ToStringSerializer.class)
        private Long resourceId;

        @NotNull
        @Min(1)
        private Integer quantity;

        @NotNull
        private Boolean isPrimary;
    }

    @Data
    public static class DefaultPersonnelDTO {
        @NotNull
        @Min(1)
        @JsonSerialize(using = ToStringSerializer.class)
        private Long userId;

        @NotNull
        private ResponderSpecialization specialization;

        @NotNull
        private Boolean isRequired;
    }
}
