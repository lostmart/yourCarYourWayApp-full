import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  public messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');
  public connectionStatus$: Observable<'disconnected' | 'connecting' | 'connected'> = this.connectionStatusSubject.asObservable();

  private username = '';

  constructor(private ngZone: NgZone) {
    console.log('ChatService: Constructor called');
  }

  connect(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('ChatService: connect() called with username:', username);

      if (this.stompClient?.active) {
        console.log('ChatService: Already connected');
        resolve();
        return;
      }

      this.username = username;

      // CRITICAL: Set connecting status inside zone
      this.ngZone.run(() => {
        console.log('ChatService: Setting status to CONNECTING');
        this.connectionStatusSubject.next('connecting');
      });

      const socket = new SockJS('http://localhost:8080/ws');
      this.stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      this.stompClient.onConnect = (frame) => {
        console.log('STOMP: onConnect fired', frame);

        // CRITICAL: All state changes inside ngZone.run
        this.ngZone.run(() => {
          console.log('ChatService: Setting status to CONNECTED');
          this.connectionStatusSubject.next('connected');

          // Subscribe to messages
          this.stompClient!.subscribe('/topic/public', (msg: IMessage) => {
            console.log('STOMP: Message received:', msg.body);
            const chatMessage: ChatMessage = JSON.parse(msg.body);

            // CRITICAL: Update messages inside zone
            this.ngZone.run(() => {
              const current = this.messagesSubject.value;
              this.messagesSubject.next([...current, chatMessage]);
            });
          });

          // Send join message
          this.sendJoinMessage();

          console.log('ChatService: Resolving promise');
          resolve();
        });
      };

      this.stompClient.onStompError = (frame) => {
        console.error('STOMP Error:', frame);

        this.ngZone.run(() => {
          console.log('ChatService: Setting status to DISCONNECTED (error)');
          this.connectionStatusSubject.next('disconnected');
          reject(new Error('STOMP connection failed'));
        });
      };

      this.stompClient.onWebSocketError = (error) => {
        console.error('WebSocket Error:', error);

        this.ngZone.run(() => {
          console.log('ChatService: Setting status to DISCONNECTED (ws error)');
          this.connectionStatusSubject.next('disconnected');
          reject(error);
        });
      };

      console.log('ChatService: Activating STOMP client...');
      this.stompClient.activate();
    });
  }

  sendMessage(content: string): void {
    if (!this.stompClient?.active) {
      console.warn('ChatService: Cannot send message, not connected');
      return;
    }

    const msg: ChatMessage = {
      type: 'CHAT',
      content,
      sender: this.username,
      timestamp: new Date().toISOString(),
    };

    console.log('ChatService: Sending message:', msg);
    this.stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(msg),
    });
  }

  private sendJoinMessage(): void {
    if (!this.stompClient?.active) {
      console.warn('ChatService: Cannot send join message, not connected');
      return;
    }

    const msg: ChatMessage = {
      type: 'JOIN',
      content: '',
      sender: this.username,
      timestamp: new Date().toISOString(),
    };

    console.log('ChatService: Sending join message:', msg);
    this.stompClient.publish({
      destination: '/app/chat.join',
      body: JSON.stringify(msg),
    });
  }

  disconnect(): void {
    console.log('ChatService: disconnect() called');

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }

    this.ngZone.run(() => {
      console.log('ChatService: Resetting state');
      this.connectionStatusSubject.next('disconnected');
      this.messagesSubject.next([]);
    });
  }
}
