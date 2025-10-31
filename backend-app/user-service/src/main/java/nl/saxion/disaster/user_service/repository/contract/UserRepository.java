package nl.saxion.disaster.user_service.repository.contract;

import nl.saxion.disaster.user_service.model.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository {

    List<User> findAllActiveUsers();

    Optional<User> findUserById(Long id);

    Optional<User> findUserByEmail(String email);

    List<User> findUsersByScope(String scopeType, Long scopeId);

    User createUser(User user);

    User updateUser(User user);

    void deleteUser(Long id);
}
