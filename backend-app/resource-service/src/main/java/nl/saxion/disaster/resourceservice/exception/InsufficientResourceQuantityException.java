package nl.saxion.disaster.resourceservice.exception;

public class InsufficientResourceQuantityException extends RuntimeException {
    public InsufficientResourceQuantityException(Long resourceId, int requested, int available) {
        super("Resource " + resourceId + " has insufficient quantity. Requested=" +
                requested + ", Available=" + available);
    }
}
