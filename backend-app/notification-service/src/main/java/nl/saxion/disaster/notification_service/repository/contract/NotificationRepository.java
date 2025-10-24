package nl.saxion.disaster.notification_service.repository.contract;

import nl.saxion.disaster.notification_service.model.entity.Notification;

import java.util.List;

public interface NotificationRepository {

    void createNotification(Notification notification);
    
    List<Notification> findAllNotifications();
    
    Notification findNotificationById(Long id);
    
    List<Notification> findNotificationsByType(String type);
    
    void updateNotificationStatus(Notification notification);
    
    /**
     * Finds notifications by region ID.
     *
     * @param regionId region ID
     * @return list of notifications for the given region
     */
    List<Notification> findNotificationsByRegionId(Long regionId);

    /**
     * Finds notifications with ID greater than the given value.
     *
     * @param afterId notification ID
     * @return list of notifications with ID > afterId
     */
    List<Notification> findNotificationsAfterId(Long afterId);
}
