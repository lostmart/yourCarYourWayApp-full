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
  changeDetection: ChangeDetectionStrategy.OnPush, // CRITICAL: Use OnPush
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

    // Subscribe to messages
    this.subs.push(
      this.chatService.messages$.subscribe((msgs) => {
        console.log('Component: messages$ emitted, count:', msgs.length);
        this.messages = msgs;
        this.cdr.markForCheck(); // CRITICAL: Mark for check instead of detectChanges
        setTimeout(() => this.scrollToBottom(), 0);
      })
    );

    // Subscribe to connection status
    this.subs.push(
      this.chatService.connectionStatus$.subscribe((status) => {
        console.log('Component: connectionStatus$ emitted:', status);
        this.isConnected = status === 'connected';
        this.isConnecting = status === 'connecting';
        this.cdr.markForCheck(); // CRITICAL: Mark for check
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
    return message.sender === this.username;
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.timestamp + message.sender;
  }
}
