import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef, // ← Add this
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
})
export class SyncContact implements OnInit, OnDestroy {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  username = '';
  isConnected = false;
  isConnecting = false;

  private subs: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef // ← Inject this
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.chatService.messages$.subscribe((msgs) => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 0);
        this.cdr.detectChanges(); // ← Add this
      }),

      this.chatService.connectionStatus$.subscribe((status) => {
        console.log('UI: connectionStatus$', status);
        this.isConnected = status === 'connected';
        this.isConnecting = status === 'connecting';
        this.cdr.detectChanges(); // ← CRITICAL: Force UI update
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe()); // ← CRITICAL FIX
    this.disconnect();
  }

  connect(): void {
    if (!this.username.trim()) {
      alert('Please enter a username');
      return;
    }

    // DO NOT SET isConnecting HERE — let observable do it
    this.chatService
      .connect(this.username.trim())
      .then(() => {
        console.log('Connected! UI will update via observable.');
      })
      .catch((err) => {
        console.error('Failed:', err);
        alert('Connection failed.');
        // Let observable set 'disconnected'
      });
  }

  disconnect(): void {
    this.chatService.disconnect();
    this.isConnected = false;
    this.isConnecting = false;
    this.username = '';
    this.messages = [];
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.isConnected) return;
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
