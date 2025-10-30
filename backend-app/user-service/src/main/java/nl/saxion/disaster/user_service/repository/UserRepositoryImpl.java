package nl.saxion.disaster.user_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@Transactional
public class UserRepositoryImpl implements UserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    // --------------------------------------------------------------------------------------------
    // FIND ALL ACTIVE USERS
    // --------------------------------------------------------------------------------------------
    @Override
    public List<User> findAllActiveUsers() {
        log.info("Fetching all active users from the database.");
        try {
            List<User> users = entityManager.createQuery(
                            "SELECT user FROM User user WHERE user.deleted = false", User.class)
                    .getResultList();
            log.debug("Found {} active users.", users.size());
            return users;
        } catch (Exception e) {
            log.error("Failed to fetch active users from database.", e);
            throw e;
        }
    }

    // --------------------------------------------------------------------------------------------
    // FIND USER BY ID
    // --------------------------------------------------------------------------------------------
    @Override
    public Optional<User> findUserById(Long id) {
        log.info("Searching for user with ID: {}", id);
        try {
            User user = entityManager.find(User.class, id);
            if (user == null) {
                log.warn("User with ID {} not found.", id);
            } else {
                log.debug("User found: {}", user.getEmail());
            }
            return Optional.ofNullable(user);
        } catch (Exception e) {
            log.error("Error while finding user by ID: {}", id, e);
            throw e;
        }
    }

    // --------------------------------------------------------------------------------------------
    // FIND USER BY EMAIL
    // --------------------------------------------------------------------------------------------
    @Override
    public Optional<User> findUserByEmail(String email) {
        log.info("Searching for user by email: {}", email);
        try {
            List<User> result = entityManager.createQuery(
                            "SELECT user FROM User user WHERE user.email = :email", User.class)
                    .setParameter("email", email)
                    .getResultList();
            if (result.isEmpty()) {
                log.warn("No user found with email: {}", email);
                return Optional.empty();
            } else {
                log.debug("User found with email: {}", email);
                return Optional.of(result.get(0));
            }
        } catch (Exception e) {
            log.error("Error while finding user by email: {}", email, e);
            throw e;
        }
    }

    // --------------------------------------------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public User createUser(User user) {
        if (user == null) {
            log.error("Attempted to persist null User entity.");
            throw new IllegalArgumentException("User entity cannot be null");
        }

        try {
            if (user.getId() == null) {
                log.info("Persisting new user with email: {}", user.getEmail());
                entityManager.persist(user);
                log.debug("New user persisted with temporary ID assigned.");
                return user;
            } else {
                log.info("Merging existing user with ID: {}", user.getId());
                return entityManager.merge(user);
            }
        } catch (Exception e) {
            log.error("Error while saving user with email: {}", user.getEmail(), e);
            throw e;
        }
    }

    // --------------------------------------------------------------------------------------------
    // UPDATE USER
    // --------------------------------------------------------------------------------------------
    @Override
    public User updateUser(User updatedUser) {
        if (updatedUser == null || updatedUser.getId() == null) {
            log.error("Invalid update attempt. User or ID is null.");
            throw new IllegalArgumentException("Cannot update user without ID.");
        }

        try {
            User existingUser = entityManager.find(User.class, updatedUser.getId());
            if (existingUser == null) {
                log.warn("User not found for update, ID: {}", updatedUser.getId());
                throw new IllegalArgumentException("User not found with id: " + updatedUser.getId());
            }

            log.info("Updating user with ID: {}", updatedUser.getId());
            existingUser.setFirstName(updatedUser.getFirstName());
            existingUser.setLastName(updatedUser.getLastName());
            existingUser.setEmail(updatedUser.getEmail());
            existingUser.setMobile(updatedUser.getMobile());
            existingUser.setPassword(updatedUser.getPassword());

            if (updatedUser.getRoles() != null) {
                log.debug("Updating roles for user ID: {}", updatedUser.getId());
                existingUser.getRoles().clear();
                updatedUser.getRoles().forEach(role -> {
                    role.setUser(existingUser);
                    existingUser.getRoles().add(role);
                });
            }

            User mergedUser = entityManager.merge(existingUser);
            log.info("User with ID {} successfully updated.", mergedUser.getId());
            return mergedUser;
        } catch (Exception e) {
            log.error("Error while updating user with ID: {}", updatedUser.getId(), e);
            throw e;
        }
    }

    // --------------------------------------------------------------------------------------------
    // DELETE USER (SOFT DELETE)
    // --------------------------------------------------------------------------------------------
    @Override
    public void deleteUser(Long id) {
        log.info("Soft-deleting user with ID: {}", id);

        try {
            User user = entityManager.find(User.class, id);
            if (user != null && !user.isDeleted()) {
                user.setDeleted(true);
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    log.debug("Soft-deleting {} roles for user ID: {}", user.getRoles().size(), id);
                    user.getRoles().forEach(role -> role.setDeleted(true));
                }
                entityManager.merge(user);
                log.info("User with ID {} marked as deleted.", id);
            } else {
                log.warn("User not found or already deleted with ID: {}", id);
            }
        } catch (Exception e) {
            log.error("Error while soft-deleting user with ID: {}", id, e);
            throw e;
        }
    }
}
