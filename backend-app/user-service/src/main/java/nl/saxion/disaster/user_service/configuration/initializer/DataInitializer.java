package nl.saxion.disaster.user_service.configuration.initializer;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import nl.saxion.disaster.user_service.model.enums.RoleType;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

/**
 * =============================================================
 * DataInitializer
 * =============================================================
 * Automatically seeds initial admin users when the application starts.
 * <p>
 * Behavior:
 * - In "prod" profile → Creates only the Region Admin.
 * - In "local", "local-docker", and "local-single" → Creates Region,
 * Municipality, and Department Admins for development/testing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Reads the active Spring profile (e.g. "local", "local-docker", "prod").
     */
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * Executed after the bean is constructed.
     */
    @PostConstruct
    public void init() {
        log.info("Active Profile: {}", activeProfile);
        log.info("Starting Data Initialization...");

        if (isLocalProfile()) {
            // Local or Docker-based development
            createRegionAdmin();
            createMunicipalityAdmins();
            createDepartmentAdmins();
        } else if (isProdProfile()) {
            // Production environment
            createRegionAdmin();
        } else {
            log.warn("No matching profile found for data initialization: {}", activeProfile);
        }

        log.info("Data initialization completed.");
    }

    /**
     * Checks if the current profile is one of the local development profiles.
     */
    private boolean isLocalProfile() {
        return activeProfile != null && (
                activeProfile.equalsIgnoreCase("local") ||
                        activeProfile.equalsIgnoreCase("local-docker") ||
                        activeProfile.equalsIgnoreCase("local-single")
        );
    }

    /**
     * Checks if the current profile is the production profile.
     */
    private boolean isProdProfile() {
        return "prod".equalsIgnoreCase(activeProfile);
    }

    /**
     * Creates a Region-level admin user responsible for managing one region.
     */
    private void createRegionAdmin() {
        createAdminIfNotExists(
                "region.admin@disaster.nl",
                "Region",
                "Admin",
                RoleType.REGION_ADMIN,
                1L,
                null,
                null
        );
    }

    /**
     * Creates one Municipality Admin for each municipality record.
     * (Only for local/dev environments)
     */
    private void createMunicipalityAdmins() {
        List<Long> municipalityIds = List.of(1L, 2L, 3L);
        List<String> municipalityNames = List.of("Deventer", "Enschede", "Zwolle");

        for (int i = 0; i < municipalityIds.size(); i++) {
            createAdminIfNotExists(
                    "municipality." + municipalityNames.get(i).toLowerCase() + "@disaster.nl",
                    municipalityNames.get(i),
                    "MunicipalityAdmin",
                    RoleType.MUNICIPALITY_ADMIN,
                    null,
                    municipalityIds.get(i),
                    null
            );
        }
    }

    /**
     * Creates one Department Admin for each department under each municipality.
     */
    private void createDepartmentAdmins() {
        String[] municipalities = {"Deventer", "Enschede", "Zwolle"};
        long departmentId = 1;

        for (String municipality : municipalities) {
            for (String dept : List.of("Fire", "Police", "Medical")) {
                createAdminIfNotExists(
                        "dept." + dept.toLowerCase() + "." + municipality.toLowerCase() + "@disaster.nl",
                        dept,
                        municipality + "Admin",
                        RoleType.DEPARTMENT_ADMIN,
                        null,
                        null,
                        departmentId
                );
                departmentId++;
            }
        }
    }

    /**
     * Creates a user with the given parameters if not already existing.
     */
    private void createAdminIfNotExists(
            String email,
            String firstName,
            String lastName,
            RoleType roleType,
            Long regionId,
            Long municipalityId,
            Long departmentId
    ) {
        if (userRepository.findUserByEmail(email).isPresent()) {
            return;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .mobile(generateDefaultMobile(email))
                .password(passwordEncoder.encode("Admin@123"))
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        UserRole userRole = UserRole.builder()
                .roleType(roleType)
                .regionId(regionId)
                .municipalityId(municipalityId)
                .departmentId(departmentId)
                .deleted(false)
                .user(user)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        user.setRoles(Set.of(userRole));
        userRepository.createUser(user);

        log.info("Created admin: {} ({})", email, roleType);
    }

    /**
     * Generates a deterministic phone number from the email to avoid nulls.
     */
    private String generateDefaultMobile(String email) {
        int hash = Math.abs(email.hashCode() % 10000000);
        return String.format("06%07d", hash);
    }
}
