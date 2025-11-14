package nl.saxion.disaster.user_service.repository.contract;

import nl.saxion.disaster.user_service.model.entity.ResponderProfile;
import java.util.Optional;

public interface ResponderProfileRepository {
    Optional<ResponderProfile> findByUserId(Long userId);
    ResponderProfile save(ResponderProfile profile);
    void deleteByUserId(Long userId);
}
