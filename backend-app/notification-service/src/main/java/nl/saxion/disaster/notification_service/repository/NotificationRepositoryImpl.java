package nl.saxion.disaster.notification_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
@Transactional
public class NotificationRepositoryImpl implements NotificationRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void createNotification(Notification notification) {
        entityManager.persist(notification);
    }

    @Override
    public List<Notification> findAllNotifications() {
        String jpql = "SELECT notification FROM Notification notification ORDER BY notification.createdAt DESC";
        return entityManager.createQuery(jpql, Notification.class).getResultList();
    }
    public List<Notification> findNotificationsByRegionId(Long regionId) {
        String jpql = "SELECT notification FROM Notification notification WHERE notification.regionId = :regionId ORDER BY notification.createdAt DESC";
        return entityManager.createQuery(jpql, Notification.class)
                .setParameter("regionId", regionId)
                .getResultList();
    }

    @Override
    public Notification findNotificationById(Long id) {
        return entityManager.find(Notification.class, id);
    }

    @Override
    public List<Notification> findNotificationsByType(String type) {
        String jpql = "SELECT notification FROM Notification notification WHERE notification.notificationType = :type ORDER BY notification.createdAt DESC";
        return entityManager.createQuery(jpql, Notification.class)
                .setParameter("type", type)
                .getResultList();
    }

    @Override
    public void updateNotificationStatus(Notification notification) {
        entityManager.merge(notification);
    }

    @Override
    public List<Notification> findNotificationsAfterId(Long afterId) {
        String jpql = "SELECT notification FROM Notification notification WHERE notification.id > :afterId ORDER BY notification.id ASC";
        return entityManager.createQuery(jpql, Notification.class)
                .setParameter("afterId", afterId)
                .getResultList();
    }
}
