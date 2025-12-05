package nl.saxion.disaster.chat_service.exception;

public class ChatGroupNotFoundException extends RuntimeException {
    public ChatGroupNotFoundException(String message) {
        super(message);
    }

    public ChatGroupNotFoundException(Long groupId) {
        super("Chat group not found with id: " + groupId);
    }
}
