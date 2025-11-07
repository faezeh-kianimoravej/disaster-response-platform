package nl.saxion.disaster.incident_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.incident_service.dto.ResourceAllocationItemDto;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.model.entity.IncidentResource;
import nl.saxion.disaster.incident_service.model.enums.Status;
import nl.saxion.disaster.incident_service.repository.contract.IncidentResourceRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Repository
@Transactional
public class IncidentResourceRepositoryImpl implements IncidentResourceRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public void updateIncidentAfterResourceAssignment(Incident incident, List<ResourceAllocationItemDto> allocations) {
        incident.setStatus(Status.IN_PROGRESS);
        entityManager.merge(incident);

        for (var allocation : allocations) {
            IncidentResource incidentResource = IncidentResource.builder()
                    .incidentId(incident.getIncidentId())
                    .resourceId(allocation.resourceId())
                    .quantity(allocation.quantity())
                    .build();

            entityManager.persist(incidentResource);
        }

        log.info("{} resources assigned to Incident ID {}", allocations.size(), incident.getIncidentId());
    }

    /**
     * Retrieves all resource allocations for a specific incident from the database.
     * <p>
     * Executes a JPQL query on the {@code incident_resources} table to fetch all records
     * where {@code incident_id} matches the provided value.
     * </p>
     *
     * @param incidentId the unique identifier of the incident
     * @return a list of {@link IncidentResource} entities linked to the given incident
     */
    @Override
    public List<IncidentResource> findByIncidentId(Long incidentId) {
        log.debug("Fetching allocated resources for Incident ID {}", incidentId);

        return entityManager.createQuery(
                        "SELECT incidentResource FROM IncidentResource incidentResource WHERE incidentResource.incidentId = :incidentId",
                        IncidentResource.class)
                .setParameter("incidentId", incidentId)
                .getResultList();
    }

    /**
     * Retrieves the total allocated quantity per resourceId for active allocations.
     * Only considers records where isAllocated = true.
     */
    public Map<Long, Integer> findActiveAllocations(List<Long> resourceIds) {
        if (resourceIds == null || resourceIds.isEmpty()) {
            return new HashMap<>();
        }

        String jpql = """
                    SELECT ir.resourceId, SUM(ir.quantity)
                    FROM IncidentResource ir
                    WHERE ir.isAllocated = true
                      AND ir.resourceId IN :resourceIds
                    GROUP BY ir.resourceId
                """;

        TypedQuery<Object[]> query = entityManager.createQuery(jpql, Object[].class);
        query.setParameter("resourceIds", resourceIds);

        List<Object[]> results = query.getResultList();

        Map<Long, Integer> allocations = new HashMap<>();
        for (Object[] row : results) {
            Long resourceId = (Long) row[0];
            Integer total = ((Number) row[1]).intValue();
            allocations.put(resourceId, total);
        }
        return allocations;
    }
}
