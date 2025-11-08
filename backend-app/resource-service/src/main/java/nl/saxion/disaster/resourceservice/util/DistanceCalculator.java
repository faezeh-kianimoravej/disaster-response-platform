package nl.saxion.disaster.resourceservice.util;

/**
 * Defines a contract for calculating distance between two geographic coordinates.
 * <p>
 * Implementations may use different methods (e.g., Haversine, external APIs)
 * to calculate the distance between two points on Earth.
 * </p>
 */
public interface DistanceCalculator {

    /**
     * Calculates the distance (in kilometers) between two points given their
     * latitude and longitude coordinates.
     *
     * @param lat1 latitude of the first point
     * @param lon1 longitude of the first point
     * @param lat2 latitude of the second point
     * @param lon2 longitude of the second point
     * @return distance in kilometers
     */
    double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2);
}
