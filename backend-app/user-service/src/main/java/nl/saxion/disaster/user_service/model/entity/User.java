package nl.saxion.disaster.user_service.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(unique = true, length = 20)
    private String mobile;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false)
    private boolean deleted = false;

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private Set<UserRole> roles = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * Timestamp of the last password change.
     * <p>
     * This field helps track when the user's password was last updated.
     * It can be used for:
     * <ul>
     *   <li>Enforcing password expiration policies (e.g., force change after 90 days)</li>
     *   <li>Invalidating active sessions or JWT tokens issued before a password change</li>
     *   <li>Auditing and security monitoring (e.g., detecting suspicious account changes)</li>
     * </ul>
     * It is automatically updated when the password value changes.
     */
    @Column(name = "password_updated_at")
    private OffsetDateTime passwordUpdatedAt;

    @Transient
    private String previousPassword;

    @PostLoad
    protected void recordPreviousPassword() {
        this.previousPassword = this.password;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
        if (!Objects.equals(this.previousPassword, this.password)) {
            this.passwordUpdatedAt = OffsetDateTime.now();
        }
    }
}
