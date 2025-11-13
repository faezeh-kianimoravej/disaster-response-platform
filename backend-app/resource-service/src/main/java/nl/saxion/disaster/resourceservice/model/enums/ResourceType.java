package nl.saxion.disaster.resourceservice.model.enums;

public enum ResourceType {
    // General
    COMMAND_VEHICLE(ResourceCategory.VEHICLE),
    TEAM(ResourceCategory.VEHICLE),
    BOAT(ResourceCategory.VEHICLE),
    HELICOPTER(ResourceCategory.VEHICLE),
    DRONE(ResourceCategory.VEHICLE),

    // Fire
    FIRE_TRUCK(ResourceCategory.VEHICLE),
    LADDER_TRUCK(ResourceCategory.VEHICLE),

    // Medical
    AMBULANCE(ResourceCategory.VEHICLE),
    TRAUMA_HELICOPTER(ResourceCategory.VEHICLE),

    // Police
    PATROL_CAR(ResourceCategory.VEHICLE),
    SWAT_CAR(ResourceCategory.VEHICLE),

    // Army
    ARMORED_VEHICLE(ResourceCategory.VEHICLE),
    TRANSPORT_TRUCK(ResourceCategory.VEHICLE),

    // Specialized
    RESCUE_VEHICLE(ResourceCategory.VEHICLE),
    WATER_TANKER(ResourceCategory.VEHICLE),
    COASTGUARD_VESSEL(ResourceCategory.VEHICLE),

    // Equipment
    DEFIBRILLATOR(ResourceCategory.EQUIPMENT),
    GENERATOR(ResourceCategory.EQUIPMENT),

    // Consumables
    WATER_BOTTLE(ResourceCategory.CONSUMABLE),
    MEDICAL_KIT(ResourceCategory.CONSUMABLE);

    private final ResourceCategory category;

    ResourceType(ResourceCategory category) {
        this.category = category;
    }

    public ResourceCategory getCategory() {
        return category;
    }
}
