package nl.saxion.disaster.chat_service.exception;

public class ChatUserNotFoundException extends RuntimeException {
    public ChatUserNotFoundException(String message) {
        super(message);
    }

    public ChatUserNotFoundException(Long chatGroupId, Long userId) {
        super("Chat user not found with chatGroupId: " + chatGroupId + " and userId: " + userId);
    }
}
