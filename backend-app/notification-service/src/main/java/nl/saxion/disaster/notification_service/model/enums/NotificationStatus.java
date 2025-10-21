package nl.saxion.disaster.notification_service.model.enums;

import lombok.Getter;

/**
 * Represents the delivery lifecycle state of a notification.
 */
@Getter
public enum NotificationStatus {

    /**
     * Notification has been created and saved in the database
     * but not yet delivered to region-service.
     */
    CREATED("Notification created, waiting for delivery"),

    /**
     * Notification has been successfully delivered to region-service.
     */
    DELIVERED("Notification delivered successfully"),

    /**
     * Delivery to region-service failed.
     * It can be retried later.
     */
    FAILED("Notification delivery failed"),

    /**
     * Notification is being retried after a failed delivery attempt.
     */
    RETRYING("Retrying delivery after previous failure");

    private final String description;

    NotificationStatus(String description) {
        this.description = description;
    }
}
