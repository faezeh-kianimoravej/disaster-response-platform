package nl.saxion.disaster.user_service.mapper.contract;

import java.util.List;
import java.util.Optional;

/**
 * Mapper for converting Entities to Response DTOs.
 *
 * @param <E>  Entity type
 * @param <RS> Response DTO type
 */
public interface ResponseMapper<E, RS> {

    Optional<RS> toDto(E entity);

    List<RS> toDtoList(List<E> entityList);
}
