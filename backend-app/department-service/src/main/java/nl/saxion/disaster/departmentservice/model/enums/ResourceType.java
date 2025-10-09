package nl.saxion.disaster.departmentservice.model.enums;

public enum ResourceType {

    FIELD_OPERATOR("Human from department"),
    TRANSPORT_VEHICLE("Transports people"),
    FIRE_TRUCK("firetruck"),
    AMBULANCE("ambulance"),
    RIOT_CAR("Used during riots");

    private final String description;

    ResourceType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
