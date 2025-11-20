package nl.saxion.disaster.deploymentservice.model;

import jakarta.persistence.*;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.ResponderSpecialization;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "response_units")
@Data
public class ResponseUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long unitId;

    @Column(nullable = false, length = 120)
    private String unitName;

    @Column(nullable = false)
    private Long departmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private ResponseUnitType unitType;

    @ElementCollection
    @CollectionTable(
            name = "response_unit_default_resources",
            joinColumns = @JoinColumn(name = "unit_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"unit_id", "resource_id"})
    )
    private List<DefaultResource> defaultResources;

    @ElementCollection
    @CollectionTable(
            name = "response_unit_default_personnel",
            joinColumns = @JoinColumn(name = "unit_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"id"})
    )
    private List<DefaultPersonnelSlot> defaultPersonnel;

    @ElementCollection
    @CollectionTable(name = "response_unit_current_resources", joinColumns = @JoinColumn(name = "unit_id"))
    private List<CurrentResource> currentResources;

    @ElementCollection
    @CollectionTable(name = "response_unit_current_personnel", joinColumns = @JoinColumn(name = "unit_id"))
    private List<CurrentPersonnel> currentPersonnel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ResponseUnitStatus status;

    private Long currentDeploymentId;

    private Double latitude;
    private Double longitude;
    private LocalDateTime lastLocationUpdate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version; //For optimistic locking

    @Embeddable
    @Data
    public static class DefaultResource {
        @Column(nullable = false)
        private Long resourceId;

        @Column(nullable = false)
        private Integer quantity;

        private Integer requiredQuantity;

        @Column(nullable = false)
        private Boolean isPrimary;
    }

    @Embeddable
    @Data
    public static class DefaultPersonnelSlot {
        @Column(name = "id")
        private Long id;

        private Long userId;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 80)
        private ResponderSpecialization specialization;

        @Column(nullable = false)
        private Boolean isRequired;
    }

    @Embeddable
    @Data
    public static class CurrentResource {
        @Column(nullable = false)
        private Long resourceId;

        @Column(nullable = false)
        private Integer quantity;

        @Column(nullable = false)
        private Boolean isPrimary;
    }

    @Embeddable
    @Data
    public static class CurrentPersonnel {
        @Column(nullable = false)
        private Long userId;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false, length = 80)
        private ResponderSpecialization specialization;
    }
}
