package nl.saxion.disaster.notification_service.service;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.mapper.BaseMapper;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import nl.saxion.disaster.notification_service.service.contract.NotificationService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Override
    public boolean markNotificationAsRead(Long id) {
        Notification notification = notificationRepository.findNotificationById(id);
        if (notification == null) {
            return false;
        }
        if (!notification.isRead()) {
            notification.setRead(true);
            notificationRepository.updateNotificationStatus(notification);
        }
        return true;
    }

    private final NotificationRepository notificationRepository;

    @Qualifier("incidentNotificationMapper")
    private final BaseMapper<Notification, IncidentNotificationDto> incidentNotificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, BaseMapper<Notification,
            IncidentNotificationDto> incidentNotificationMapper) {
        this.notificationRepository = notificationRepository;
        this.incidentNotificationMapper = incidentNotificationMapper;
    }

    @Override
    public List<IncidentNotificationDto> getAllNotifications() {
        log.info("📋 Fetching all notifications...");
        List<Notification> notifications = notificationRepository.findAllNotifications();
        return incidentNotificationMapper.toDtoList(notifications);
    }

    public List<IncidentNotificationDto> getNotificationsByRegionId(Long regionId) {
        log.info("📋 Fetching notifications for regionId={}", regionId);
        List<Notification> notifications = notificationRepository.findNotificationsByRegionId(regionId);
        return incidentNotificationMapper.toDtoList(notifications);
    }

    @Override
    public IncidentNotificationDto getNotificationById(Long id) {
        log.info("🔍 Fetching notification with ID {}", id);
        Notification notification = notificationRepository.findNotificationById(id);
        return incidentNotificationMapper.toDto(notification);
    }

    @Override
    public List<IncidentNotificationDto> getNotificationsByType(String type) {
        log.info("📂 Fetching notifications by type: {}", type);
        List<Notification> notifications = notificationRepository.findNotificationsByType(type);
        return incidentNotificationMapper.toDtoList(notifications);
    }
    
    @Override
    public List<IncidentNotificationDto> getNotificationsAfterId(Long afterId) {
        log.info("Fetching notifications with ID > {}", afterId);
        List<Notification> notifications = notificationRepository.findNotificationsAfterId(afterId);
        return incidentNotificationMapper.toDtoList(notifications);
    }
}
