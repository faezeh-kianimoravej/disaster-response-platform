package nl.saxion.disaster.user_service.configuration.initializer;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import nl.saxion.disaster.user_service.model.enums.RoleType;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.model.entity.ResponderProfile;
import nl.saxion.disaster.user_service.model.enums.ResponderSpecialization;
import nl.saxion.disaster.user_service.repository.contract.ResponderProfileRepository;
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
    private final ResponderProfileRepository responderProfileRepository;

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
            createDeventerFireDepartmentUsers();
        } else if (isProdProfile()) {
            // Production environment
            createRegionAdmin();
        } else {
            log.warn("No matching profile found for data initialization: {}", activeProfile);
        }

        log.info("Data initialization completed.");
    }

    /**
     * Seeds realistic responders.
     */
    private void createDeventerFireDepartmentUsers() {
        createResponderIfNotExists("firefighter1.enschede@disaster.nl", "Henk", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 4L);
        createResponderIfNotExists("firefighter2.enschede@disaster.nl", "Mila", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 4L);
        createResponderIfNotExists("firefighter3.enschede@disaster.nl", "Daan", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 4L);
        createResponderIfNotExists("firefighter4.enschede@disaster.nl", "Sofie", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 4L);
        createResponderIfNotExists("driver1.enschede@disaster.nl", "Bas", "Chauffeur", ResponderSpecialization.DRIVER,
                4L);
        createResponderIfNotExists("driver2.enschede@disaster.nl", "Emma", "Chauffeur", ResponderSpecialization.DRIVER,
                4L);
        createResponderIfNotExists("operator1.enschede@disaster.nl", "Noah", "Operator",
                ResponderSpecialization.OPERATOR, 4L);
        createResponderIfNotExists("operator2.enschede@disaster.nl", "Tess", "Operator",
                ResponderSpecialization.OPERATOR, 4L);
        createResponderIfNotExists("firefighter1.deventer@disaster.nl", "Jan", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("firefighter2.deventer@disaster.nl", "Bram", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("firefighter3.deventer@disaster.nl", "Lisa", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("firefighter4.deventer@disaster.nl", "Tom", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("driver1.deventer@disaster.nl", "Piet", "Chauffeur", ResponderSpecialization.DRIVER,
                1L);
        createResponderIfNotExists("driver2.deventer@disaster.nl", "Sophie", "Chauffeur",
                ResponderSpecialization.DRIVER, 1L);
        createResponderIfNotExists("operator1.deventer@disaster.nl", "Sanne", "Operator",
                ResponderSpecialization.OPERATOR, 1L);
        createResponderIfNotExists("operator2.deventer@disaster.nl", "Mark", "Operator",
                ResponderSpecialization.OPERATOR, 1L);
        createResponderIfNotExists("firefighter5.deventer@disaster.nl", "Kees", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("firefighter6.deventer@disaster.nl", "Eva", "Brandweer",
                ResponderSpecialization.FIREFIGHTER, 1L);
        createResponderIfNotExists("paramedic1.deventer@disaster.nl", "Anne", "Paramedicus",
                ResponderSpecialization.PARAMEDIC, 3L);
        createResponderIfNotExists("paramedic2.deventer@disaster.nl", "Joris", "Paramedicus",
                ResponderSpecialization.PARAMEDIC, 3L);
        createResponderIfNotExists("emt1.deventer@disaster.nl", "Kim", "EMT", ResponderSpecialization.EMT_BASIC, 3L);
        createResponderIfNotExists("ambulancedriver.deventer@disaster.nl", "Wim", "Ambulancechauffeur",
                ResponderSpecialization.DRIVER, 3L);
    }

    /**
     * Creates a responder user and ResponderProfile if not already existing.
     */
    private void createResponderIfNotExists(
            String email,
            String firstName,
            String lastName,
            ResponderSpecialization specialization,
            Long departmentId) {
        if (userRepository.findUserByEmail(email).isPresent()) {
            return;
        }

        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .mobile(generateDefaultMobile(email))
                .password(passwordEncoder.encode("Responder@123"))
                .deleted(false)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        UserRole userRole = UserRole.builder()
                .roleType(RoleType.RESPONDER)
                .departmentId(departmentId)
                .deleted(false)
                .user(user)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        user.setRoles(Set.of(userRole));
        userRepository.createUser(user);

        ResponderProfile profile = ResponderProfile.builder()
                .user(user)
                .departmentId(departmentId)
                .primarySpecialization(specialization)
                .secondarySpecializations(List.of())
                .isAvailable(true)
                .build();
        responderProfileRepository.save(profile);

        log.info("Created responder: {} ({})", email, specialization);
    }

    /**
     * Checks if the current profile is one of the local development profiles.
     */
    private boolean isLocalProfile() {
        return activeProfile != null && (activeProfile.equalsIgnoreCase("local") ||
                activeProfile.equalsIgnoreCase("local-docker") ||
                activeProfile.equalsIgnoreCase("local-single"));
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
                null);
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
                    null);
        }
    }

    /**
     * Creates one Department Admin for each department under each municipality.
     */
    private void createDepartmentAdmins() {
        String[] municipalities = { "Deventer", "Enschede", "Zwolle" };
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
                        departmentId);
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
            Long departmentId) {
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
