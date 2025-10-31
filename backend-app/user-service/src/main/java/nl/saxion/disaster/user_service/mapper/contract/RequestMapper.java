package nl.saxion.disaster.user_service.mapper.contract;

import java.util.List;
import java.util.Optional;

/**
 * Mapper for converting Request DTOs to Entities.
 *
 * @param <E>  Entity type
 * @param <RQ> Request DTO type
 */
public interface RequestMapper<E, RQ> {

    Optional<E> toEntity(RQ dto);

    List<E> toEntityList(List<RQ> dtoList);
}
