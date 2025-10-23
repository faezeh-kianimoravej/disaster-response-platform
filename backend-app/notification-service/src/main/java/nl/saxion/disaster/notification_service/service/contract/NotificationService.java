package nl.saxion.disaster.notification_service.service.contract;

import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;

import java.util.List;

public interface NotificationService {

    /**
     * Marks a notification as read by its ID.
     * @param id notification ID
     * @return true if updated, false if not found
     */
    boolean markNotificationAsRead(Long id);
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
     * Finds notifications by region ID.
     *
     * @param regionId region ID
     * @return list of notifications for the given region
     */
    List<IncidentNotificationDto> getNotificationsByRegionId(Long regionId);

    /**
     * Finds notifications by their type.
     *
     * @param type notification type
     * @return list of notifications with the given type
     */
    List<IncidentNotificationDto> getNotificationsByType(String type);

    /**
     * Finds notifications with ID greater than the given value.
     *
     * @param afterId notification ID
     * @return list of notifications with ID > afterId
     */
    List<IncidentNotificationDto> getNotificationsAfterId(Long afterId);
}
