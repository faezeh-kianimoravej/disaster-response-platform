package nl.saxion.disaster.notification_service.model.enums;

import lombok.Getter;

@Getter
public enum NotificationType {

    // ===============================
    // INCIDENT-RELATED NOTIFICATIONS
    // ===============================

    /**
     * A new incident has been reported in a specific region.
     */
    NEW_INCIDENT("A new incident has been reported"),

    /**
     * Details of an existing incident have been updated (e.g., severity change).
     */
    INCIDENT_UPDATE("Incident details have been updated"),

    /**
     * An incident has been resolved or closed.
     */
    INCIDENT_RESOLVED("Incident has been resolved"),


    // ===============================
    //  RESOURCE-RELATED NOTIFICATIONS
    // ===============================

    /**
     * A new resource has been assigned or deployed to a region.
     */
    RESOURCE_DEPLOYED("A resource has been deployed to the region"),

    /**
     * A resource (e.g., fire truck, ambulance) has been requested by a region.
     */
    RESOURCE_REQUEST("A region has requested a new resource"),

    /**
     * A resource has completed its mission and returned to base.
     */
    RESOURCE_RETURNED("A resource has returned to base"),


    // ===============================
    //  ENVIRONMENTAL OR GENERAL ALERTS
    // ===============================

    /**
     * A weather-related warning (e.g., storm, flood) affecting a region.
     */
    WEATHER_WARNING("Weather-related alert for the region"),

    /**
     * A general administrative or informational message.
     */
    GENERAL_ALERT("General information or system-wide alert");


    // ===============================
    //  Fields and Constructor
    // ===============================

    /**
     * Short description of what this notification type means.
     */
    private final String description;

    /**
     * Constructor for NotificationType.
     *
     * @param description a human-readable summary of the notification purpose
     */
    NotificationType(String description) {
        this.description = description;
    }
}
