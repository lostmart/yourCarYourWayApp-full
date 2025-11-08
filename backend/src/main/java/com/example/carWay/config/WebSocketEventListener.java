package com.example.carWay.config;

import com.example.carWay.models.ChatMessage;
import com.example.carWay.models.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.Map;

/**
 * Listens for WebSocket disconnect events and notifies other users
 */
@Component
public class WebSocketEventListener {
 
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final SimpMessageSendingOperations messagingTemplate;

    public WebSocketEventListener(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(@NonNull SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // Safely get session attributes with null check
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        if (sessionAttributes != null) {
            String username = (String) sessionAttributes.get("username");
            
            if (username != null) {
                logger.info("User '{}' disconnected from chat", username);
                
                ChatMessage chatMessage = ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .timestamp(Instant.now())
                    .build();
                
                messagingTemplate.convertAndSend("/topic/public", chatMessage);
            } else {
                logger.debug("Disconnected session had no username stored");
            }
        } else {
            logger.warn("Session attributes are null in disconnect event");
        }
    }
}