package nl.saxion.disaster.notification_service.mapper;

import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@Qualifier("deploymentNotificationMapper")
public class DeploymentNotificationMapper implements BaseMapper<Notification, DeploymentNotificationDto> {

    @Override
    public DeploymentNotificationDto toDto(Notification entity) {
        if (entity == null) return null;

        return new DeploymentNotificationDto(
                entity.getNotificationId(),
                entity.getDepartmentId(),
                entity.getDeploymentRequestId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getNotificationType(),
                entity.getCreatedAt(),
                entity.isRead()
        );
    }

    @Override
    public Notification toEntity(DeploymentNotificationDto dto) {
        if (dto == null) return null;

        return Notification.builder()
                .notificationId(dto.notificationId())
                .departmentId(dto.departmentId())
                .deploymentRequestId(dto.deploymentRequestId())
                .title(dto.title())
                .description(dto.description())
                .notificationType(dto.notificationType())
                .createdAt(dto.createdAt())
                .read(dto.read())
                .incidentId(null)
                .regionId(null)
                .build();
    }

    @Override
    public List<DeploymentNotificationDto> toDtoList(List<Notification> entities) {
        if (entities == null) return null;

        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> toEntityList(List<DeploymentNotificationDto> dtos) {
        if (dtos == null) return null;

        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }
}
