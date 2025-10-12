package nl.saxion.disaster.municipality_service.model.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "municipality")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Municipality {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "municipality_id")
    private Long municipalityId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    private Long regionId;

    @Schema(hidden = true)
    @ElementCollection
    @CollectionTable(
            name = "municipality_departments",
            joinColumns = @JoinColumn(name = "municipality_id")
    )
    @Column(name = "department_id")
    private List<Long> departmentIds;
}
