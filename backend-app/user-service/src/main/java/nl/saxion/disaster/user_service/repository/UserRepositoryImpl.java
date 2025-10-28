package nl.saxion.disaster.user_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class UserRepositoryImpl implements UserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<User> findAllActiveUsers() {
        return entityManager.createQuery(
                        "SELECT user FROM User user WHERE user.deleted = false", User.class)
                .getResultList();
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return Optional.ofNullable(entityManager.find(User.class, id));
    }

    @Override
    public Optional<User> findUserByEmail(String email) {
        List<User> result = entityManager.createQuery(
                        "SELECT user FROM User user WHERE user.email = :email", User.class)
                .setParameter("email", email)
                .getResultList();
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    @Override
    public User createUser(User user) {
        if (user.getId() == null) {
            entityManager.persist(user);
            return user;
        } else {
            return entityManager.merge(user);
        }
    }

    @Override
    public User updateUser(User updatedUser) {
        if (updatedUser.getId() == null) {
            throw new IllegalArgumentException("Cannot update user without ID.");
        }

        User existingUser = entityManager.find(User.class, updatedUser.getId());
        if (existingUser == null) {
            throw new IllegalArgumentException("User not found with id: " + updatedUser.getId());
        }

        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setMobile(updatedUser.getMobile());
        existingUser.setPassword(updatedUser.getPassword());

        if (updatedUser.getRoles() != null) {
            existingUser.getRoles().clear();
            updatedUser.getRoles().forEach(role -> {
                role.setUser(existingUser);
                existingUser.getRoles().add(role);
            });
        }

        return entityManager.merge(existingUser);
    }


    /**
     * Soft deletes a user and all of their associated roles.
     * <p>
     * Instead of physically removing the user record from the database,
     * this method marks the user as deleted by setting {@code deleted = true}.
     * All {@link nl.saxion.disaster.user_service.model.entity.UserRole} entities
     * linked to this user will also be marked as deleted.
     * <p>
     * This ensures that user data and role history are preserved
     * for auditing and reporting purposes, while preventing the user
     * and their roles from appearing in active queries.
     *
     * @param id the unique identifier of the user to soft delete
     */
    @Override
    public void deleteUser(Long id) {
        User user = entityManager.find(User.class, id);

        if (user != null && !user.isDeleted()) {
            user.setDeleted(true);
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                user.getRoles().forEach(role -> role.setDeleted(true));
            }
            entityManager.merge(user);
        }
    }
}
