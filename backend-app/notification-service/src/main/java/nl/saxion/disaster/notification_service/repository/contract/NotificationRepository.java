package nl.saxion.disaster.notification_service.repository.contract;

import nl.saxion.disaster.notification_service.model.entity.Notification;

import java.util.List;

public interface NotificationRepository {

    void createNotification(Notification notification);

    List<Notification> findAllNotifications();

    Notification findNotificationById(Long id);

    List<Notification> findNotificationsByType(String type);

    void updateNotificationStatus(Notification notification);
}
