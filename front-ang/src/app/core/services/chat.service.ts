import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

export interface ChatMessage {
  type: 'JOIN' | 'CHAT' | 'LEAVE';
  content: string;
  sender: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private stompClient: Client | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private connectionStatus = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>(
    'disconnected'
  );
  public connectionStatus$ = this.connectionStatus.asObservable();

  private username = '';

  constructor(private ngZone: NgZone) {} // ← Inject NgZone

  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.stompClient?.active) {
        resolve();
        return;
      }

      this.username = username;
      this.ngZone.run(() => this.connectionStatus.next('connecting')); // ← Inside zone

      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = () => {
        console.log('STOMP CONNECTED');
        this.ngZone.run(() => this.connectionStatus.next('connected')); // ← Inside zone

        this.stompClient!.subscribe('/topic/public', (msg: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(msg.body);
          const current = this.messagesSubject.value;
          this.ngZone.run(() => this.messagesSubject.next([...current, chatMessage])); // ← Inside zone
        });

        this.sendJoinMessage();
        resolve();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP Error:', frame);
        this.ngZone.run(() => this.connectionStatus.next('disconnected')); // ← Inside zone
        reject(new Error('STOMP connection failed'));
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error('WebSocket Error:', error);
        this.ngZone.run(() => this.connectionStatus.next('disconnected')); // ← Inside zone
        reject(error);
      };

      console.log('Activating STOMP client...');
      this.stompClient.activate();
    });
  }

  sendMessage(content: string): void {
    if (!this.stompClient?.active) return;

    const msg: ChatMessage = {
      type: 'CHAT',
      content,
      sender: this.username,
      timestamp: new Date().toISOString(),
    };

    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(msg),
    });
  }

  private sendJoinMessage(): void {
    if (!this.stompClient?.active) return;

    const msg: ChatMessage = {
      type: 'JOIN',
      content: '',
      sender: this.username,
      timestamp: new Date().toISOString(),
    };

    this.stompClient.publish({
      destination: '/app/chat.join',
      body: JSON.stringify(msg),
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.ngZone.run(() => {
      this.connectionStatus.next('disconnected');
      this.messagesSubject.next([]);
    }); // ← Inside zone
  }
}
