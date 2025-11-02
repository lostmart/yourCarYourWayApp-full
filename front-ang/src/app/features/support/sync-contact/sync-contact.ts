import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sync-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sync-contact.html',
  styleUrls: ['./sync-contact.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SyncContact implements OnInit, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  username = '';
  isConnected = false;
  isConnecting = false;

  private subs: Subscription[] = [];

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {
    console.log('Component: Constructor called');
  }

  ngOnInit(): void {
    console.log('Component: ngOnInit called');

    this.subs.push(
      this.chatService.messages$.subscribe((msgs) => {
        console.log('Component: messages$ emitted, count:', msgs.length);
        this.messages = msgs;
        this.cdr.markForCheck();
        setTimeout(() => this.scrollToBottom(), 0);
      })
    );

    this.subs.push(
      this.chatService.connectionStatus$.subscribe((status) => {
        console.log('Component: connectionStatus$ emitted:', status);
        this.isConnected = status === 'connected';
        this.isConnecting = status === 'connecting';
        this.cdr.markForCheck();
        console.log(
          'Component: isConnected =',
          this.isConnected,
          ', isConnecting =',
          this.isConnecting
        );
      })
    );
  }

  ngOnDestroy(): void {
    console.log('Component: ngOnDestroy called');
    this.subs.forEach((s) => s.unsubscribe());
    this.disconnect();
  }

  connect(): void {
    console.log('Component: connect() clicked, username:', this.username);

    if (!this.username.trim()) {
      alert('Please enter a username');
      return;
    }

    this.chatService
      .connect(this.username.trim())
      .then(() => {
        console.log('Component: Connection promise resolved');
      })
      .catch((err) => {
        console.error('Component: Connection promise rejected:', err);
        alert('Connection failed: ' + err.message);
      });
  }

  disconnect(): void {
    console.log('Component: disconnect() called');
    this.chatService.disconnect();
    this.isConnected = false;
    this.isConnecting = false;
    this.username = '';
    this.messages = [];
    this.cdr.markForCheck();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.isConnected) return;
    console.log('Component: Sending message:', this.newMessage);
    this.chatService.sendMessage(this.newMessage.trim());
    this.newMessage = '';
  }

  private scrollToBottom(): void {
    if (this.chatContainer?.nativeElement) {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    }
  }

  getMessageTime(timestamp: string): string {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  isUserMessage(message: ChatMessage): boolean {
    console.log(
      'Comparing:',
      message.sender,
      'with',
      this.username,
      'Result:',
      message.sender === this.username
    );
    return message.sender === this.username;
  }

  isSystemMessage(message: ChatMessage): boolean {
    return message.type === 'JOIN' || message.type === 'LEAVE';
  }

  getSenderInitials(sender: string): string {
    return sender
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getSenderColor(sender: string): string {
    // Generate consistent color based on sender name hash
    let hash = 0;
    for (let i = 0; i < sender.length; i++) {
      hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
    ];

    return colors[Math.abs(hash) % colors.length];
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.timestamp + message.sender;
  }
}
