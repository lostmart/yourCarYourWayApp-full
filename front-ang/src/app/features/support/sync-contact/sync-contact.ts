import { Component, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private botResponses: string[] = [
    'I understand. Let me help you with that.',
    "That's a great question. Here's what you can do...",
    'I see. Have you tried restarting the device?',
    'Thanks for providing that information. Let me check on this for you.',
    "I'm here to help! Could you provide more details?",
  ];

  private currentResponseIndex = 0;
  private messageIdCounter = 7;

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
  ];

  newMessage: string = '';

  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }

  sendMessage() {
    if (!this.newMessage.trim()) {
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: this.messageIdCounter++,
      sender: 'user',
      senderName: 'Lorraine',
      message: this.newMessage.trim(),
      timestamp: this.getCurrentTime(),
    };

    this.messages = [...this.messages, userMessage];
    this.newMessage = '';

    setTimeout(() => this.scrollToBottom(), 100);

    // TODO: Replace with WebSocket send
    // this.chatService.sendMessage(userMessage.message);
  }

  private scrollToBottom(): void {
    if (this.chatContainer?.nativeElement) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  private getCurrentTime(): string {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutesStr} ${ampm}`;
  }

  // TODO: This will be replaced with WebSocket subscription
  // ngOnInit() {
  //   this.chatService.messages$.subscribe((message: ChatMessage) => {
  //     this.messages = [...this.messages, message];
  //     setTimeout(() => this.scrollToBottom(), 100);
  //   });
  // }
}
