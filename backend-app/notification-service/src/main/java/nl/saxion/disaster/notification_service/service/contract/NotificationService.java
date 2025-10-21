package nl.saxion.disaster.notification_service.service.contract;

import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;

import java.util.List;

public interface NotificationService {

    /**
     * Returns all notifications stored in the system.
     *
     * @return list of notification DTOs
     */
    List<IncidentNotificationDto> getAllNotifications();

    /**
     * Finds a specific notification by its ID.
     *
     * @param id notification ID
     * @return corresponding notification DTO
     */
    IncidentNotificationDto getNotificationById(Long id);

    /**
     * Finds notifications by their type.
     *
     * @param type notification type
     * @return list of notifications with the given type
     */
    List<IncidentNotificationDto> getNotificationsByType(String type);
}
