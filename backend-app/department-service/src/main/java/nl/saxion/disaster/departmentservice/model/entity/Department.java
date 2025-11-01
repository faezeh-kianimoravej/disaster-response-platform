package nl.saxion.disaster.departmentservice.model.entity;

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
@Table(name = "department")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "municipality_id")
    private Long municipalityId;

    @Lob
    @Column(name = "image", columnDefinition = "BYTEA")
    @JdbcTypeCode(SqlTypes.BINARY)
    private byte[] image;

    @Schema(hidden = true)
    @ElementCollection
    @CollectionTable(
            name = "department_resources",
            joinColumns = @JoinColumn(name = "department_id")
    )
    @Column(name = "resource_id")
    private List<Long> resourceIds;

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
