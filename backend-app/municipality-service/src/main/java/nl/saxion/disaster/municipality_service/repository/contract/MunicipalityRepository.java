package nl.saxion.disaster.municipality_service.repository.contract;

import nl.saxion.disaster.municipality_service.model.entity.Municipality;

import java.util.List;
import java.util.Optional;

public interface MunicipalityRepository {

    List<Municipality> findAllMunicipality();

    Optional<Municipality> findMunicipalityById(Long id);

    Municipality createMunicipality(Municipality municipality);

    Municipality updateMunicipality(Municipality municipality);

    boolean existsById(Long id);

    public void deleteMunicipality(Long id);

}
