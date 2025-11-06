package nl.saxion.disaster.user_service.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum RoleType {

    CITIZEN("Citizen"),
    RESPONDER("Responder"),
    OFFICER_ON_DUTY("Officer on Duty"),
    LEADER_COPI("Leader CoPI"),
    CALAMITY_COORDINATOR("Calamity Coordinator"),
    OPERATIONAL_LEADER("Operational Leader"),
    MAYOR("Mayor"),
    CHAIR_SAFETY_REGION("Chair Safety Region"),
    SYSTEM_ADMIN("System Admin"),
    DEPARTMENT_ADMIN("Department Admin"),
    MUNICIPALITY_ADMIN("Municipality Admin"),
    REGION_ADMIN("Region Admin");

    private final String label;

    RoleType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static RoleType fromValue(String value) {
        for (RoleType type : RoleType.values()) {
            if (type.label.equalsIgnoreCase(value) || type.name().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown role type: " + value);
    }
}
