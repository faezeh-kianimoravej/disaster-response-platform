package nl.saxion.disaster.regionservice.mapper;


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
}
