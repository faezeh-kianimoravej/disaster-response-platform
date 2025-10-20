package nl.saxion.disaster.municipality_service.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import nl.saxion.disaster.municipality_service.model.entity.Municipality;
import nl.saxion.disaster.municipality_service.repository.contract.MunicipalityRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class MunicipalityRepositoryImpl implements MunicipalityRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Municipality> findAllMunicipality() {
        return entityManager.createQuery("SELECT m FROM Municipality m", Municipality.class)
                .getResultList();
    }

    @Override
    public Optional<Municipality> findMunicipalityById(Long id) {
        Municipality municipality = entityManager.find(Municipality.class, id);
        return Optional.ofNullable(municipality);
    }

    @Override
    public List<Municipality> findMunicipalitiesByRegionId(Long regionId) {
        return entityManager.createQuery(
                        "SELECT municipality FROM Municipality municipality WHERE municipality.regionId = :regionId", Municipality.class)
                .setParameter("regionId", regionId)
                .getResultList();
    }

    @Override
    public Municipality createMunicipality(Municipality municipality) {
        if (municipality.getMunicipalityId() == null) {
            entityManager.persist(municipality); // create
            return municipality;
        } else {
            return entityManager.merge(municipality); // update
        }
    }

    @Override
    public Municipality updateMunicipality(Municipality municipality) {
        return entityManager.merge(municipality);
    }

    public boolean existsById(Long id) {
        Long count = entityManager.createQuery(
                        "SELECT COUNT(m) FROM Municipality m WHERE m.municipalityId = :id", Long.class)
                .setParameter("id", id)
                .getSingleResult();
        return count > 0;
    }

    @Override
    public void deleteMunicipality(Long id) {
        Municipality municipality = entityManager.find(Municipality.class, id);
        if (municipality != null) {
            entityManager.remove(municipality);
        }
    }
}
