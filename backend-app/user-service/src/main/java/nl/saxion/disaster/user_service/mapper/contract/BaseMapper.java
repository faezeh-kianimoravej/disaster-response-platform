package nl.saxion.disaster.user_service.mapper.contract;

import java.util.List;
import java.util.Optional;

/**
 * Generic mapper interface for converting between Entities and DTOs.
 *
 * @param <E> Entity type
 * @param <D> DTO type
 */
public interface BaseMapper<E, D> {

    Optional<D> toDto(E entity);

    Optional<E> toEntity(D dto);

    List<D> toDtoList(List<E> entityList);

    List<E> toEntityList(List<D> dtoList);
}
