package nl.saxion.disaster.chat_service.service.impl;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import nl.saxion.disaster.chat_service.service.ChatSseService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class ChatSseServiceImpl implements ChatSseService {

    // Map: chatGroupId -> List of emitters
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> groupEmitters = new ConcurrentHashMap<>();

    @Override
    public SseEmitter addEmitter(Long chatGroupId, Long userId) {
        log.info("Adding SSE emitter for user {} in chat group {}", userId, chatGroupId);

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        groupEmitters.computeIfAbsent(chatGroupId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE connection completed for user {} in group {}", userId, chatGroupId);
            removeEmitterFromGroup(chatGroupId, emitter);
        });

        emitter.onTimeout(() -> {
            log.warn("SSE connection timeout for user {} in group {}", userId, chatGroupId);
            removeEmitterFromGroup(chatGroupId, emitter);
        });

        emitter.onError((e) -> {
            log.error("SSE connection error for user {} in group {}: {}", userId, chatGroupId, e.getMessage());
            removeEmitterFromGroup(chatGroupId, emitter);
        });

        log.info("SSE emitter added for group {}. Total emitters: {}", 
                chatGroupId, groupEmitters.get(chatGroupId).size());

        return emitter;
    }

    @Override
    public void sendMessageToGroup(Long chatGroupId, ChatMessageResponseDto messageDto) {
        log.debug("Sending message to SSE subscribers of group {}", chatGroupId);

        CopyOnWriteArrayList<SseEmitter> emitters = groupEmitters.get(chatGroupId);
        
        if (emitters == null || emitters.isEmpty()) {
            log.debug("No SSE subscribers for group {}", chatGroupId);
            return;
        }

        int successCount = 0;
        int failureCount = 0;

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("chat-message")
                        .data(messageDto));
                successCount++;
            } catch (IOException e) {
                log.warn("Failed to send message to SSE subscriber in group {}: {}", chatGroupId, e.getMessage());
                removeEmitterFromGroup(chatGroupId, emitter);
                failureCount++;
            }
        }

        log.info("Message broadcast to group {}: {} successful, {} failed", 
                chatGroupId, successCount, failureCount);
    }

    @Override
    public void removeEmitter(Long chatGroupId, Long userId) {
        log.info("Removing SSE emitter for user {} in group {}", userId, chatGroupId);
        // Note: Since we don't track user-emitter mapping, this will be handled by onCompletion/onTimeout/onError
    }

    private void removeEmitterFromGroup(Long chatGroupId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = groupEmitters.get(chatGroupId);
        if (emitters != null) {
            emitters.remove(emitter);
            log.debug("Emitter removed from group {}. Remaining: {}", chatGroupId, emitters.size());
            
            if (emitters.isEmpty()) {
                groupEmitters.remove(chatGroupId);
                log.debug("No more emitters for group {}, removed from map", chatGroupId);
            }
        }
    }
}
