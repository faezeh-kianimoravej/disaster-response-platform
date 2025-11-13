package nl.saxion.disaster.user_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.user_service.model.entity.ResponderProfile;
import nl.saxion.disaster.user_service.repository.contract.ResponderProfileRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@Transactional
public class ResponderProfileRepositoryImpl implements ResponderProfileRepository {
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Optional<ResponderProfile> findByUserId(Long userId) {
        return entityManager.createQuery(
                "SELECT rp FROM ResponderProfile rp WHERE rp.user.id = :userId", ResponderProfile.class)
                .setParameter("userId", userId)
                .getResultList()
                .stream()
                .findFirst();
    }

    @Override
    public ResponderProfile save(ResponderProfile profile) {
        if (profile.getId() == null) {
            entityManager.persist(profile);
            return profile;
        } else {
            return entityManager.merge(profile);
        }
    }

    @Override
    public void deleteByUserId(Long userId) {
        findByUserId(userId).ifPresent(profile -> entityManager.remove(profile));
    }
}
