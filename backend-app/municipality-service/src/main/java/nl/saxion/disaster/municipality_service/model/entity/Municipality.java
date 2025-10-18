package nl.saxion.disaster.municipality_service.model.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "municipality")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Municipality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "municipality_id")
    private Long municipalityId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "region_id")
    private Long regionId;

    @Lob
    @Column(name = "image", columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] image;

    @Schema(hidden = true)
    @ElementCollection
    @CollectionTable(
            name = "municipality_departments",
            joinColumns = @JoinColumn(name = "municipality_id")
    )
    @Column(name = "department_id")
    private List<Long> departmentIds;

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
