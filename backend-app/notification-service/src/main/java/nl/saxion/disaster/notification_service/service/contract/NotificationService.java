package nl.saxion.disaster.notification_service.service.contract;

import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;

import java.util.List;

public interface NotificationService {

    /**
     * Marks a notification as read by its ID.
     */
    boolean markNotificationAsRead(Long id);

    /**
     * Returns all incident notifications stored in the system.
     */
    List<IncidentNotificationDto> getAllNotifications();

    /**
     * Returns a specific incident notification by ID.
     */
    IncidentNotificationDto getNotificationById(Long id);

    /**
     * Returns all incident notifications for a given region.
     */
    List<IncidentNotificationDto> getNotificationsByRegionId(Long regionId);

    /**
     * Returns all deployment notifications for a given department.
     */
    List<DeploymentNotificationDto> getNotificationsByDepartmentId(Long departmentId);

    /**
     * Returns incident notifications filtered by type.
     */
    List<IncidentNotificationDto> getNotificationsByType(String type);

    /**
     * Returns incident notifications with ID greater than the given value.
     */
    List<IncidentNotificationDto> getNotificationsAfterId(Long afterId);

    /**
     * Returns deployment notifications with ID greater than the given value.
     */
    List<DeploymentNotificationDto> getDepartmentNotificationsAfterId(Long afterId, Long departmentId);

    /**
     * Returns a specific deployment notification by ID.
     */
    DeploymentNotificationDto getDeploymentNotificationById(Long id);
}
