package nl.saxion.disaster.incident_service.incident.integration;

import net.jqwik.api.*;
import nl.saxion.disaster.incident_service.model.enums.GripLevel;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.model.enums.Status;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static net.jqwik.api.Arbitraries.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * NOTE:
 * These property-based tests validate API contract invariants
 * (input constraints, boundaries, enums) without infrastructure
 * dependencies.
 *
 * This is an intentional Phase 1 decision to keep tests fast,
 * deterministic, and CI-friendly.
 *
 * Full HTTP-level property-based integration tests using
 * SpringBootTest + RestAssured + TestContainers are planned
 * for subsequent phases, as described in ADR_Integration_Testing_Strategy.
 */

@Tag("property-based")
@Tag("incident-service")
class IncidentControllerPropertyTest {

    /* ============================================================
       TITLE
       ============================================================ */

    @Property(tries = 100)
    void titleMustBeNonEmptyAndAtMost255Chars(
            @ForAll("validTitles") String title
    ) {
        assertFalse(title.isBlank());
        assertTrue(title.length() <= 255);
    }

    @Property(tries = 50)
    void titleLongerThan255CharsIsInvalid(
            @ForAll("invalidTitles") String title
    ) {
        assertTrue(title.length() > 255);
    }

    /* ============================================================
       ENUMS
       ============================================================ */

    @Property
    void severityIsAlwaysValid(@ForAll Severity severity) {
        assertNotNull(severity);
    }

    @Property
    void gripLevelIsAlwaysValid(@ForAll GripLevel gripLevel) {
        assertNotNull(gripLevel);
    }

    @Property
    void statusIsAlwaysValid(@ForAll Status status) {
        assertNotNull(status);
    }

    /* ============================================================
       REPORTED BY
       ============================================================ */

    @Property
    void reportedByMustNotBeBlank(@ForAll("userNames") String reportedBy) {
        assertFalse(reportedBy.isBlank());
    }

    /* ============================================================
       REGION
       ============================================================ */

    @Property
    void regionIdMustBePositive(@ForAll("positiveIds") Long regionId) {
        assertTrue(regionId > 0);
    }

    /* ============================================================
       COORDINATES
       ============================================================ */

    @Property
    void latitudeMustBeWithinEarthRange(@ForAll("latitudes") double lat) {
        assertTrue(lat >= -90.0 && lat <= 90.0);
    }

    @Property
    void longitudeMustBeWithinEarthRange(@ForAll("longitudes") double lon) {
        assertTrue(lon >= -180.0 && lon <= 180.0);
    }

    /* ============================================================
       DATE / TIME
       ============================================================ */

    @Property
    void reportedAtMustNotBeInFuture(@ForAll("pastDates") OffsetDateTime time) {
        assertTrue(time.isBefore(OffsetDateTime.now()) || time.isEqual(OffsetDateTime.now()));
    }

    /* ============================================================
       CROSS-FIELD CONSISTENCY
       ============================================================ */

    @Property
    void closedIncidentMustHaveStatusClosed(
            @ForAll Status status,
            @ForAll("pastDates") OffsetDateTime reportedAt
    ) {
        if (status == Status.CLOSED) {
            assertEquals(Status.CLOSED, status);
            assertNotNull(reportedAt);
        }
    }

    /* ============================================================
       GENERATORS
       ============================================================ */

    @Provide
    Arbitrary<String> validTitles() {
        return strings()
                .alpha()
                .ofMinLength(1)
                .ofMaxLength(255);
    }

    @Provide
    Arbitrary<String> invalidTitles() {
        return strings()
                .alpha()
                .ofMinLength(256)
                .ofMaxLength(600);
    }

    @Provide
    Arbitrary<String> userNames() {
        return strings()
                .alpha()
                .ofMinLength(3)
                .ofMaxLength(50);
    }

    @Provide
    Arbitrary<Long> positiveIds() {
        return longs().greaterOrEqual(1);
    }

    @Provide
    Arbitrary<Double> latitudes() {
        return doubles().between(-90.0, 90.0);
    }

    @Provide
    Arbitrary<Double> longitudes() {
        return doubles().between(-180.0, 180.0);
    }

    /**
     * Generator for past OffsetDateTime values (last 10 years).
     */
    @Provide
    Arbitrary<OffsetDateTime> pastDates() {
        long now = Instant.now().toEpochMilli();
        long tenYearsAgo = OffsetDateTime.now()
                .minusYears(10)
                .toInstant()
                .toEpochMilli();

        return longs()
                .between(tenYearsAgo, now)
                .map(millis -> OffsetDateTime.ofInstant(
                        Instant.ofEpochMilli(millis),
                        ZoneOffset.UTC
                ));
    }
}
