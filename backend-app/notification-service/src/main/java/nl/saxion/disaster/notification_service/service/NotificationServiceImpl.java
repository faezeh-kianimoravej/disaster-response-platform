package nl.saxion.disaster.notification_service.service;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
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

    private final NotificationRepository notificationRepository;
    private final BaseMapper<Notification, IncidentNotificationDto> incidentNotificationMapper;
    private final BaseMapper<Notification, DeploymentNotificationDto> deploymentNotificationMapper;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            @Qualifier("incidentNotificationMapper")
            BaseMapper<Notification, IncidentNotificationDto> incidentNotificationMapper,
            @Qualifier("deploymentNotificationMapper")
            BaseMapper<Notification, DeploymentNotificationDto> deploymentNotificationMapper
    ) {
        this.notificationRepository = notificationRepository;
        this.incidentNotificationMapper = incidentNotificationMapper;
        this.deploymentNotificationMapper = deploymentNotificationMapper;
    }

    // -------------------- Common --------------------
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

    // -------------------- INCIDENT --------------------

    @Override
    public List<IncidentNotificationDto> getAllNotifications() {
        List<Notification> notifications = notificationRepository.findAllNotifications();
        return incidentNotificationMapper.toDtoList(notifications);
    }

    @Override
    public List<IncidentNotificationDto> getNotificationsByRegionId(Long regionId) {
        List<Notification> notifications = notificationRepository.findNotificationsByRegionId(regionId);
        return incidentNotificationMapper.toDtoList(notifications);
    }

    @Override
    public IncidentNotificationDto getNotificationById(Long id) {
        Notification notification = notificationRepository.findNotificationById(id);
        return incidentNotificationMapper.toDto(notification);
    }

    @Override
    public List<IncidentNotificationDto> getNotificationsByType(String type) {
        List<Notification> notifications = notificationRepository.findNotificationsByType(type);
        return incidentNotificationMapper.toDtoList(notifications);
    }

    @Override
    public List<IncidentNotificationDto> getNotificationsAfterId(Long afterId) {
        List<Notification> notifications = notificationRepository.findNotificationsAfterId(afterId);
        return incidentNotificationMapper.toDtoList(notifications);
    }

    // -------------------- DEPLOYMENT --------------------

    @Override
    public List<DeploymentNotificationDto> getNotificationsByDepartmentId(Long departmentId) {
        List<Notification> notifications = notificationRepository.findNotificationsByDepartmentId(departmentId);
        return deploymentNotificationMapper.toDtoList(notifications);
    }

    @Override
    public DeploymentNotificationDto getDeploymentNotificationById(Long id) {
        Notification notification = notificationRepository.findNotificationById(id);
        return deploymentNotificationMapper.toDto(notification);
    }

    @Override
    public List<DeploymentNotificationDto> getDepartmentNotificationsAfterId(Long afterId, Long departmentId) {
        List<Notification> notifications =
                notificationRepository.findDepartmentNotificationsAfterId(afterId, departmentId);

        return deploymentNotificationMapper.toDtoList(notifications);
    }
}
