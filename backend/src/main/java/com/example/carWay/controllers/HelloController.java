package com.example.carWay.controllers;

import java.time.LocalDateTime;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.carWay.models.ChatMessage;
import com.example.carWay.models.MessageType;

@RestController
public class HelloController {
    
    @GetMapping("/")
    public String sayHello() {
        return "Hello, Spring Boot! 🚀";
    }

    @GetMapping("/test-chat-message")
    public ChatMessage testChatMessage() {
        return ChatMessage.builder()
            .type(MessageType.CHAT)
            .content("Test message")
            .sender("TestUser")
            .timestamp(LocalDateTime.now())
            .build();
    }
}
