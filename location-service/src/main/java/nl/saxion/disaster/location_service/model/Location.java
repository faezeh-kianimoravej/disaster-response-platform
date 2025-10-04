package nl.saxion.disaster.location_service.model;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;

@Entity
@Table(name = "locations")
@Data
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // مثلا نام محل یا ایستگاه

    @Column(columnDefinition = "geometry(Point,4326)")
    private Point coordinates;

    private String description;

    public Location() {}

    public Location(String name, Point coordinates, String description) {
        this.name = name;
        this.coordinates = coordinates;
        this.description = description;
    }
}
