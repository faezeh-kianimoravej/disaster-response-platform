package nl.saxion.disaster.departmentservice.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;


@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceId;

    @NotNull(message = "Department must not be null")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Positive(message = "Quantity must be greater than zero")
    private int quantity;

    private boolean available;

    @NotNull(message = "Resource type must be specified")
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;

    private Double latitude;// Current position of the resource (for mobile assets)

    private Double longitude;

    @Lob
    private byte[] image;

}
