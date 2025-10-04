package nl.saxion.disaster.resourceservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "resources")
@Data
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private int quantity;
}
