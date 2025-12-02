package nl.saxion.disaster.chat_service.model;

public enum MessageType {
    DEFAULT,  // Regular user message
    LEADER,   // Message from a leader (region admin, municipality admin, etc.)
    SYSTEM    // System-generated message
}
