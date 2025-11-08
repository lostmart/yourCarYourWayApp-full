package com.example.carWay.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private MessageType type;
    private String content;
    private String sender;

    // Only allow writing (serialization) to JSON, not reading (deserialization)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant timestamp;
}