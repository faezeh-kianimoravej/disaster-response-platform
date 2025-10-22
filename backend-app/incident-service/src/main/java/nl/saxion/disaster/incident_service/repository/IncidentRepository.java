package nl.saxion.disaster.incident_service.repository;

import nl.saxion.disaster.incident_service.model.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByReportedBy(String reportedBy);
}