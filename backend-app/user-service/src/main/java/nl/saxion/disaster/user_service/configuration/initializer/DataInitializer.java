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
 * This component automatically inserts initial admin users
 * into the database when the application starts.
 * <p>
 * Behavior:
 * - In all environments → Creates the System Admin user.
 * - In development and local environments → Also creates
 * Region, Municipality, and Department Admins.
 * <p>
 * Purpose:
 * Ensures that at least one privileged user exists
 * after a clean database setup, preventing manual inserts.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Reads the currently active Spring profile
     * (e.g., "local", "local-docker", "dev", "prod").
     */
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    /**
     * Executed automatically by Spring after the bean is constructed.
     * This method is responsible for seeding admin user accounts.
     */
    @PostConstruct
    public void init() {
        log.info("Active Profile: {}", activeProfile);
        log.info("Starting Data Initialization...");

        // Always create the main System Admin account.
        createSystemAdmin();

        // Only create the additional admins if running in a dev or local environment.
        if (isDevProfile()) {
            createRegionAdmin();
            createMunicipalityAdmins();
            createDepartmentAdmins();
        }

        log.info("Data initialization completed.");
    }

    /**
     * Determines if the current profile represents a
     * development or local testing environment.
     *
     * @return true if the profile name contains "local" or "dev"
     */
    private boolean isDevProfile() {
        return activeProfile != null &&
                (activeProfile.contains("local") || activeProfile.contains("dev"));
    }

    /**
     * Creates the main System Administrator.
     * This account always exists in every environment.
     */
    private void createSystemAdmin() {
        createAdminIfNotExists(
                "system.admin@disaster.nl",
                "System",
                "Admin",
                RoleType.SYSTEM_ADMIN,
                null,
                null,
                null
        );
    }

    /**
     * Creates a Region-level admin user responsible for managing one region.
     * Only runs in local/dev profiles.
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
     * Each admin belongs to a single municipality.
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
     * Example:
     * - dept.fire.deventer@disaster.nl
     * - dept.police.enschede@disaster.nl
     * - dept.medical.zwolle@disaster.nl
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
     * Creates a user with the given parameters if they do not already exist.
     *
     * @param email          unique email for the user
     * @param firstName      first name
     * @param lastName       last name
     * @param roleType       user's role (SYSTEM_ADMIN, REGION_ADMIN, etc.)
     * @param regionId       optional region assignment
     * @param municipalityId optional municipality assignment
     * @param departmentId   optional department assignment
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
        // Skip creation if the user already exists.
        if (userRepository.findUserByEmail(email).isPresent()) {
            return;
        }

        // Create the user entity.
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .mobile(generateDefaultMobile(email)) // ✅ Added mobile number
                .password(passwordEncoder.encode("Admin@123")) // Securely encoded password
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        // Create and link the user role entity.
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

        // Link the user and role, then persist.
        user.setRoles(Set.of(userRole));
        userRepository.createUser(user);

        log.info("Created admin: {} ({})", email, roleType);
    }

    /**
     * Generates a simple deterministic phone number based on the email prefix.
     * This prevents NULL values in the 'mobile' column.
     */
    private String generateDefaultMobile(String email) {
        // Example: "system.admin@disaster.nl" -> "0000000001"
        int hash = Math.abs(email.hashCode() % 10000000);
        return String.format("06%07d", hash);
    }
}
