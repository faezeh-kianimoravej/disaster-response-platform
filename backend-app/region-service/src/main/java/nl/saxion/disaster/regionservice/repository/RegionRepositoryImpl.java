package nl.saxion.disaster.regionservice.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.regionservice.model.Region;
import nl.saxion.disaster.regionservice.repository.contract.RegionRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class RegionRepositoryImpl implements RegionRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Region> findAllRegions() {
        return entityManager.createQuery("SELECT region FROM Region region", Region.class)
                .getResultList();
    }

    @Override
    public Optional<Region> findRegionById(Long id) {
        Region region = entityManager.find(Region.class, id);
        return Optional.ofNullable(region);
    }

    @Override
    public Region createRegion(Region region) {
        if (region.getRegionId() == null || region.getRegionId() == 0) {
            entityManager.persist(region);
            return region;
        } else {
            return entityManager.merge(region);
        }
    }

    @Override
    public Region updateRegion(Region region) {
        return entityManager.merge(region);
    }

    @Override
    public void deleteRegionById(Long id) {
        Region region = entityManager.find(Region.class, id);
        if (region != null) {
            entityManager.remove(region);
        }
    }
}
