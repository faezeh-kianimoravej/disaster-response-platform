package nl.saxion.disaster.resourceservice.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import nl.saxion.disaster.resourceservice.model.enums.ResourceStatus;
import nl.saxion.disaster.resourceservice.model.enums.ResourceKind;
import nl.saxion.disaster.resourceservice.model.enums.ResourceCategory;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "department_id")
    private Long departmentId;

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Positive(message = "Total quantity must be greater than zero")
    private Integer totalQuantity;

    private Integer availableQuantity;

    @NotNull(message = "Resource resourceType must be specified")
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    @NotNull(message = "Resource category must be specified")
    @Enumerated(EnumType.STRING)
    private ResourceCategory category;
    
    @NotNull(message = "Resource kind must be specified")
    @Enumerated(EnumType.STRING)
    private ResourceKind resourceKind;
    
    @Enumerated(EnumType.STRING)
    private ResourceStatus status;

    private String unit;

    private Boolean isTrackable;

    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate;

    private Long currentDeploymentId;
    private Integer deployedQuantity;

    @Lob
    @Column(name = "image", columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] image;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
