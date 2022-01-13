import type { WsApiParser } from '../types/ws';

type Listener<T extends WsApiParser<any>, C extends keyof T> = (payload: T[C]['payload']) => any;

type WebSocketData = string | Buffer | ArrayBuffer | Buffer[];

type ServerMessage<T extends WsApiParser<any>, C = keyof T> = { channel: C, payload: any }

const RECONNECT_AFTER = 300;

type SocketEventType =
  | 'open'
  | 'error'
  | 'close'
  | 'message'
;

interface SocketEvent {
  type: SocketEventType;
  event: MessageEvent;
  socket: WebSocket;
}

function parseServerMessage<T>(data?: WebSocketData): T | null {
  try {
    return data ? JSON.parse(typeof data === 'string' ? data : data.toString()) : null;
  } catch (err) {
    console.debug(err);
    return null;
  }
}



export class WebSocketSub<T extends WsApiParser<any>> {
  private isConnected = false;
  private messageQueue: string[] = [];
  private listeners: Partial<Record<string, Listener<any, any>[]>> = {};
  private socketEventsListeners: ((event: SocketEvent) => any)[] = [];
  private eventListenersByName: Partial<Record<SocketEventType, (event: MessageEvent) => any>> = {};
  private subscribedToChannelCounts: Partial<Record<string, number>> = {};
  private reconnectAttempts = 0;
  private reconnectFailureListeners: (() => any)[] = [];
  private socket: WebSocket;
  constructor(private websocketFactory: () => WebSocket) {
    this.socket = this.websocketFactory();
    this.initSocket();
  }
  private sendSubscription<C extends keyof T>(channel: C, subscribe: boolean, query: T[C]['query'] | null) {
    const messageStr = JSON.stringify({channel, subscribe, query});
    if (this.isConnected) this.socket.send(messageStr);
    else this.messageQueue.push(messageStr);
  }
  public send(channel: string, payload: any) {
    const messageStr = JSON.stringify({channel, payload});
    if (this.isConnected) this.socket.send(messageStr);
    else this.messageQueue.push(messageStr);
  }
  public subscribe<C extends keyof T>(channel: C, query: T[C]['query'], listener: Listener<T, C>): () => void {
    const channelStr = channel as string;
    if (!this.listeners[channelStr]) this.listeners[channelStr] = [];
    this.listeners[channelStr]?.push(listener);
    if (!this.subscribedToChannelCounts[channelStr])  {
      this.sendSubscription(channel, true, query);
      this.subscribedToChannelCounts[channelStr] = 1;
    } else {
      (this.subscribedToChannelCounts[channelStr] as number)++;
    }
    return () => this.unsubscribe(channel, listener);
  }
  public unsubscribe<C extends keyof T>(channel: C, listener: Listener<T, C>): void {
    const channelStr = channel as string;
    const listeners = this.listeners[channelStr];
    if (Array.isArray(listeners)) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
        if (typeof this.subscribedToChannelCounts[channelStr] === 'number') {
          (this.subscribedToChannelCounts[channelStr] as number)--;
        }
        if (!this.subscribedToChannelCounts[channelStr]) {
          this.sendSubscription(channel, false, null);
        }
      } 
    }
  }
  public addListener(listener: (event: SocketEvent) => any): () => void {
    this.socketEventsListeners.push(listener);
    return () => {
      const index = this.socketEventsListeners.indexOf(listener);
      if (index >= 0) this.socketEventsListeners.splice(index, 1);
    };
  }
  public onDisconnect(listener: () => any): () => void {
    this.reconnectFailureListeners.push(listener);
    return () => {
      const index = this.reconnectFailureListeners.indexOf(listener);
      if (index >= 0) this.reconnectFailureListeners.splice(index, 1);
    };
  }
  
  private initSocket() {
    const wrapListener = (eventType: SocketEventType): (event: any) => any => {
      const fn = (event: MessageEvent) => {
        const socketEvent: SocketEvent = {type: eventType, event, socket: this.socket};
        for (const listener of this.socketEventsListeners) listener(socketEvent);
      };
      this.eventListenersByName[eventType] = fn;
      return fn;
    };
    for (const eventType of ['open', 'close', 'message', 'error'] as SocketEventType[]) {
      this.socket.addEventListener(eventType, wrapListener(eventType));
    }
    this.addListener(event => {
      if (event.type !== 'open') return;
      this.isConnected = true;
      for (const messageStr of this.messageQueue) this.socket.send(messageStr);
      this.messageQueue = [];
    });
    this.addListener(event => {
      if (event.type === 'close') setTimeout(() => this.reconnect(), RECONNECT_AFTER);
    });
    this.addListener(event => {
      if (event.type === 'message') this.handleServerMessage(parseServerMessage(event.event.data));
    });
  }
  private reconnect() {
    this.isConnected = false;
    if (this.reconnectAttempts >= 3) {
      for (const listener of this.reconnectFailureListeners) listener();
    } else {
      for (const eventType of ['open', 'close', 'message', 'error', 'ping'] as SocketEventType[]) {
        if (this.eventListenersByName[eventType]) {
          this.socket.removeEventListener(eventType, this.eventListenersByName[eventType] as EventListenerOrEventListenerObject);
        }
      }
      
      this.socket = this.websocketFactory();
      this.initSocket();
      this.reconnectAttempts++;
    }

  }
  private handleServerMessage(message: ServerMessage<T> | null) {
    if (!message) return;
    const channelStr = message.channel as string;
    for (const listener of this.listeners[channelStr] || []) {
      listener(message.payload);
    } 
  }
}


export const defaultWebSocketFactory = () => new WebSocket(window.location.origin.replace(/http/, 'ws'))
export const wsSubFactory = <T extends WsApiParser<any> = WsApiParser<any>>(websocketFactory: () => WebSocket = defaultWebSocketFactory) => new WebSocketSub<T>(websocketFactory);