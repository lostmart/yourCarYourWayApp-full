import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

interface ChatMessage {
  id: number;
  sender: 'bot' | 'user';
  senderName: string;
  message: string;
  timestamp: string;
  hasLink?: boolean;
  linkText?: string;
  linkUrl?: string;
}

@Component({
  selector: 'app-sync-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sync-contact.html',
  styleUrls: ['./sync-contact.scss'],
})
export class SyncContact {
  messages: ChatMessage[] = [
    {
      id: 1,
      sender: 'bot',
      senderName: 'Ache-Me Bot',
      message: 'Hi Lorraine, How can I help you?',
      timestamp: '12:17 PM',
    },
    {
      id: 2,
      sender: 'user',
      senderName: 'Lorraine',
      message: 'I have printer issues',
      timestamp: '12:17 PM',
    },
    {
      id: 3,
      sender: 'bot',
      senderName: 'Ache-Me Bot',
      message: "I'm sorry to hear this. May I know the issue with your printer.",
      timestamp: '12:18 PM',
    },
    {
      id: 4,
      sender: 'user',
      senderName: 'Lorraine',
      message: 'Issue with paper roles',
      timestamp: '12:19 PM',
    },
    {
      id: 5,
      sender: 'bot',
      senderName: 'Ache-Me Bot',
      message: 'Follow the instructions in this link to replace rollers.',
      timestamp: '12:19 PM',
      hasLink: true,
      linkText: '*Change paper rollers*',
      linkUrl: '#',
    },
    {
      id: 6,
      sender: 'user',
      senderName: 'Lorraine',
      message: 'Thanks!',
      timestamp: '12:19 PM',
    },
  ];

  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      // Add new message logic here
      console.log('Sending message:', this.newMessage);
      this.newMessage = '';
    }
  }
}
