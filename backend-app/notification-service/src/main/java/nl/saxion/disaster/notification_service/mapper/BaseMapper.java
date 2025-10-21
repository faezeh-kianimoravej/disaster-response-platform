package nl.saxion.disaster.notification_service.mapper;

import java.util.List;

/**
 * Base interface for mapping between Entity (E) and DTO (D).
 * Provides method signatures for single and list conversions.
 */
public interface BaseMapper<E, D> {

    /**
     * Converts an entity to its corresponding DTO.
     *
     * @param entity the source entity
     * @return DTO representation of the entity
     */
    D toDto(E entity);

    /**
     * Converts a DTO to its corresponding entity.
     *
     * @param dto the source DTO
     * @return Entity representation of the DTO
     */
    E toEntity(D dto);

    /**
     * Converts a list of entities to a list of DTOs.
     *
     * @param entities list of entities
     * @return list of DTOs
     */
    List<D> toDtoList(List<E> entities);

    /**
     * Converts a list of DTOs to a list of entities.
     *
     * @param dtos list of DTOs
     * @return list of entities
     */
    List<E> toEntityList(List<D> dtos);
}
