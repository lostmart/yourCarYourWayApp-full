package com.example.carWay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

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
 */

 @Configuration
@EnableWebSocketMessageBroker  // Enables WebSocket message handling backed by message broker
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
     * - setAllowedOrigins("*") allows connections from any origin
     * - For PoC, this is fine
     * - In production, specify exact origins: setAllowedOrigins("https://yourcarway.com")
     * 
     * @param registry the STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")           // Clients connect to ws://localhost:8080/ws
                //.setAllowedOrigins("*")       // Allow all origins (PoC only!)
                .setAllowedOriginPatterns("*")  // Allow all origins (PoC only!)
                .withSockJS();                // Enable SockJS fallback
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
        registry.setApplicationDestinationPrefixes("/app");  // Prefix for client → server
        registry.enableSimpleBroker("/topic");               // Prefix for server → clients
    }
}
