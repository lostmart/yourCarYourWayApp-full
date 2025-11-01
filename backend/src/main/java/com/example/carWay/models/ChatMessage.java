package com.example.carWay.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Represents a chat message in the system.
 * This DTO is used to transfer messages between the backend and frontend via WebSocket.
 * 
 * Fields:
 * - type: The type of message (JOIN, CHAT, LEAVE)
 * - content: The actual text content of the message
 * - sender: The username of the person who sent the message
 * - timestamp: When the message was created/sent
 */

@Data                    // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor       // Generates a no-argument constructor (needed for Jackson)
@AllArgsConstructor      // Generates a constructor with all arguments
@Builder                 // Enables builder pattern: ChatMessage.builder().sender("Sarah").build()

public class ChatMessage {
    
    /**
     * The type of message: JOIN (user joined), CHAT (regular message), or LEAVE (user left)
     */
    private MessageType type;
    
    /**
     * The actual content of the message.
     * For JOIN/LEAVE messages, this might be null or a system message.
     * For CHAT messages, this contains the user's text.
     */
    private String content;
    
    /**
     * The username of the person who sent this message.
     * This is NOT authenticated - users just provide a name when joining.
     */
    private String sender;
    
    /**
     * The timestamp when this message was created.
     * Formatted as ISO 8601 for easy parsing on the frontend.
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
}
