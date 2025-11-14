package nl.saxion.disaster.user_service.model.entity;

import jakarta.persistence.*;
import lombok.*;
import nl.saxion.disaster.user_service.model.enums.ResponderSpecialization;
import java.util.List;

@Entity
@Table(name = "responder_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponderProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_specialization", nullable = false)
    private ResponderSpecialization primarySpecialization;

    @ElementCollection(targetClass = ResponderSpecialization.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "responder_secondary_specializations", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "specialization")
    private List<ResponderSpecialization> secondarySpecializations;

    @Column(name = "is_available", nullable = false)
    private boolean isAvailable;

    @Column(name = "current_deployment_id")
    private Long currentDeploymentId;
}
