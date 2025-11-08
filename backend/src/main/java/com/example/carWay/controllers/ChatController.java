package com.example.carWay.controllers;

import com.example.carWay.models.ChatMessage;
import com.example.carWay.models.MessageType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.Map;

/**
 * Controller handling chat messages via WebSocket.
 * Routes: /app/chat.send and /app/chat.join
 * Broadcasts to: /topic/public
 */
@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    /**
     * Handles chat messages sent to /app/chat.send
     * Adds server-side timestamp and broadcasts to /topic/public
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@NonNull @Payload ChatMessage chatMessage) {
        // Always set server-side timestamp for consistency
        chatMessage.setTimestamp(Instant.now());
        return chatMessage;
    }

    /**
     * Handles user joining chat at /app/chat.join
     * Stores username in WebSocket session and broadcasts join message
     */
    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @NonNull @Payload ChatMessage chatMessage,
            @NonNull SimpMessageHeaderAccessor headerAccessor) {

        // Safely get session attributes with null check
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null) {
            sessionAttributes.put("username", chatMessage.getSender());
            logger.debug("User '{}' joined chat session", chatMessage.getSender());
        } else {
            logger.warn("Session attributes are null for user '{}'", chatMessage.getSender());
        }

        // Set server-side timestamp and ensure type is JOIN
        chatMessage.setTimestamp(Instant.now());
        chatMessage.setType(MessageType.JOIN);

        return chatMessage;
    }
}