package nl.saxion.disaster.municipality_service.exception;

public class MunicipalityNotFoundException extends RuntimeException {

    public MunicipalityNotFoundException(Long id) {
        super("Municipality not found with id: " + id);
    }

    public MunicipalityNotFoundException(String message) {
        super(message);
    }
}
