package nl.saxion.disaster.deploymentservice.client;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

@Data
public class ResourceLocationDTO {
    @JsonSerialize(using = ToStringSerializer.class)
    private Long resourceId;
    private Double latitude;
    private Double longitude;
}
