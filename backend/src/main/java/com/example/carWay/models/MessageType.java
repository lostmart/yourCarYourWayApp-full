package com.example.carWay.models;

/**
 * Enum representing the different types of messages in the chat system.
 * 
 * - JOIN: Sent when a user joins the chat
 * - CHAT: Regular chat message from a user
 * - LEAVE: Sent when a user leaves the chat
 */

public enum MessageType {
    JOIN,
    CHAT,
    LEAVE
}
