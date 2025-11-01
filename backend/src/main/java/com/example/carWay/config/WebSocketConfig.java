package com.example.carWay.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

/**
 * WebSocket configuration for the chat functionality.
 * 
 * This class sets up the infrastructure for real-time bidirectional communication
 * between the server and clients using WebSocket and STOMP protocol.
 * 
 * Key components configured:
 * 1. STOMP endpoints - Where clients connect
 * 2. Message broker - How messages are routed
 * 3. Application destination prefix - Routing for incoming messages
 * 4. Message converters - How JSON messages are serialized/deserialized
 */

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    /**
     * Register STOMP endpoints that clients will use to connect to the WebSocket server.
     * 
     * Endpoint: /ws
     * - This is the URL clients connect to: ws://localhost:8080/ws
     * - Think of it as the "front door" to the WebSocket server
     * 
     * SockJS:
     * - Provides fallback options for browsers that don't support WebSocket
     * - Falls back to HTTP streaming, then long-polling if needed
     * - For modern browsers, native WebSocket will be used
     * 
     * CORS:
     * - setAllowedOriginPatterns("*") allows connections from any origin
     * - For PoC, this is fine
     * - In production, specify exact origins: setAllowedOrigins("https://yourcarway.com")
     * 
     * @param registry the STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configure the message broker that will route messages between clients and server.
     * 
     * Two types of destinations are configured:
     * 
     * 1. Application Destination Prefix: /app
     *    - Used for messages FROM clients TO server
     *    - Example: Client sends to /app/chat.send
     *    - These messages are routed to @MessageMapping methods in controllers
     * 
     * 2. Simple Broker: /topic
     *    - Used for messages FROM server TO clients (broadcasting)
     *    - Example: Server sends to /topic/public
     *    - All clients subscribed to /topic/public will receive the message
     * 
     * Message Flow Example:
     * 1. Client sends message to: /app/chat.send
     * 2. ChatController method with @MessageMapping("/chat.send") receives it
     * 3. Controller processes and sends to: /topic/public
     * 4. All clients subscribed to /topic/public receive it instantly
     * 
     * Why "simple" broker?
     * - In-memory message routing (no external message broker like RabbitMQ/ActiveMQ)
     * - Perfect for PoC and small-scale applications
     * - For production with high load, consider external broker
     * 
     * @param registry the message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }

    /**
     * Configure message converters for WebSocket communication.
     * 
     * This is critical for proper JSON serialization/deserialization of messages.
     * 
     * Problem being solved:
     * - By default, Spring's WebSocket message converter doesn't handle Java 8 date/time types
     * - Angular sends timestamps in ISO-8601 format: "2025-11-01T19:15:34.730Z"
     * - Without JavaTimeModule, Jackson can't deserialize this into Instant
     * 
     * Solution:
     * - Register JavaTimeModule to teach Jackson about Instant, LocalDateTime, etc.
     * - Disable WRITE_DATES_AS_TIMESTAMPS to use ISO-8601 strings (human-readable)
     * 
     * This ensures:
     * - Client → Server: ISO-8601 strings are properly parsed into Instant
     * - Server → Client: Instant is serialized back to ISO-8601 strings
     * 
     * @param messageConverters the list of message converters
     * @return false to keep default converters in addition to this one
     */
    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        // Create ObjectMapper with Java 8 date/time support
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Create Jackson message converter with configured ObjectMapper
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        
        // Add our converter to the list
        messageConverters.add(converter);
        
        // Return false to keep default converters as well
        return false;
    }
}