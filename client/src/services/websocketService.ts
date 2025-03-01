/**
 * WebSocket Service - For real-time voice interactions with Groq Llama models
 */

import { toast } from "../hooks/use-toast";

// Event types supported by the WebSocket
export type WebSocketEventType = 
  | 'connection'
  | 'transcript'
  | 'response' 
  | 'transcription'
  | 'error'
  | 'init'
  | 'audio';

// Interfaces for different message types
interface BaseWebSocketMessage {
  type: WebSocketEventType;
  messageId?: string;
}

interface TranscriptMessage extends BaseWebSocketMessage {
  type: 'transcript';
  text: string;
  formId?: number;
  questionId?: number;
  questionType?: string;
  questionContext?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ResponseMessage extends BaseWebSocketMessage {
  type: 'response';
  text: string;
  formId?: number;
  questionId?: number;
  stats?: {
    latency: number;
    processingTime: number;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
  };
}

interface AudioMessage extends BaseWebSocketMessage {
  type: 'audio';
  audioData: string;
  formId?: number;
  questionId?: number;
}

interface TranscriptionMessage extends BaseWebSocketMessage {
  type: 'transcription';
  text: string;
  confidence: number;
  processingTime: number;
  formId?: number;
  questionId?: number;
}

interface ErrorMessage extends BaseWebSocketMessage {
  type: 'error';
  error: string;
  details?: string;
}

interface InitMessage extends BaseWebSocketMessage {
  type: 'init';
  formId: number;
}

// Union type of all possible message types
type WebSocketMessage = 
  | TranscriptMessage
  | ResponseMessage
  | AudioMessage
  | TranscriptionMessage
  | ErrorMessage
  | InitMessage;

// Event handler callbacks
type WebSocketEventHandlers = {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: WebSocketMessage) => void;
  onResponse?: (data: ResponseMessage) => void;
  onTranscription?: (data: TranscriptionMessage) => void;
};

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000; // 5 seconds
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private handlers: WebSocketEventHandlers = {};
  private connectionId: string | null = null;

  constructor() {
    // Set up the WebSocket URL using the same host and the /ws path
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = `${protocol}//${window.location.host}/ws`;
  }

  /**
   * Connect to the WebSocket server
   * @param handlers Event handlers for WebSocket events
   */
  connect(handlers: WebSocketEventHandlers = {}): void {
    // Store handlers
    this.handlers = handlers;

    // Close any existing connection
    if (this.socket) {
      this.socket.close();
    }

    // Create a new WebSocket connection
    try {
      this.socket = new WebSocket(this.url);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);

      console.log('WebSocket connection initialized.');
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionId = null;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Send a text transcript message to the server
   * @param text The transcript text to send
   * @param formId Optional form ID for context
   * @param questionId Optional question ID for context
   * @param questionType Optional question type for context
   * @param options Additional options like temperature
   */
  sendTranscript(
    text: string, 
    formId?: number, 
    questionId?: number, 
    questionType?: string,
    questionContext?: string,
    options: { temperature?: number; maxTokens?: number } = {}
  ): void {
    const message: TranscriptMessage = {
      type: 'transcript',
      text,
      formId,
      questionId,
      questionType,
      questionContext,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    };

    this.sendMessage(message);
  }

  /**
   * Send audio data to the server for transcription
   * @param audioData Base64-encoded audio data
   * @param formId Optional form ID for context
   * @param questionId Optional question ID for context
   */
  sendAudio(audioData: string, formId?: number, questionId?: number): void {
    const message: AudioMessage = {
      type: 'audio',
      audioData,
      formId,
      questionId
    };

    this.sendMessage(message);
  }

  /**
   * Initialize a session for a specific form
   * @param formId The form ID to initialize
   */
  initializeFormSession(formId: number): void {
    const message: InitMessage = {
      type: 'init',
      formId
    };

    this.sendMessage(message);
  }

  /**
   * Send a message to the WebSocket server
   * @param message The message to send
   */
  private sendMessage(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected. Message not sent:', message);
      toast({
        title: "Connection Error",
        description: "Not connected to voice service. Please try again.",
        variant: "destructive"
      });
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
      console.log('Sent WebSocket message:', message.type);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      toast({
        title: "Connection Error",
        description: "Failed to send message to voice service.",
        variant: "destructive"
      });
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0;

    if (this.handlers.onOpen) {
      this.handlers.onOpen();
    }
  }

  /**
   * Handle WebSocket close event
   */
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    
    if (this.handlers.onClose) {
      this.handlers.onClose();
    }

    this.attemptReconnect();
  }

  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    
    if (this.handlers.onError) {
      this.handlers.onError(event);
    }
  }

  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      console.log('Received WebSocket message:', data.type);

      // Store connection ID if this is a connection message
      if ('connectionId' in data && typeof data.connectionId === 'string') {
        this.connectionId = data.connectionId;
      }

      // Call general message handler if provided
      if (this.handlers.onMessage) {
        this.handlers.onMessage(data);
      }

      // Call specific handlers based on message type
      switch (data.type) {
        case 'response':
          if (this.handlers.onResponse) {
            this.handlers.onResponse(data as ResponseMessage);
          }
          break;
        case 'transcription':
          if (this.handlers.onTranscription) {
            this.handlers.onTranscription(data as TranscriptionMessage);
          }
          break;
        case 'error':
          const errorMsg = data as ErrorMessage;
          console.error('WebSocket error message:', errorMsg.error, errorMsg.details);
          toast({
            title: "Voice Service Error",
            description: errorMsg.error,
            variant: "destructive"
          });
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
    }
  }

  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Maximum reconnect attempts reached. Giving up.');
      toast({
        title: "Connection Failed",
        description: "Could not connect to voice service. Please reload the page.",
        variant: "destructive"
      });
      return;
    }

    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval / 1000}s...`);
    
    setTimeout(() => {
      console.log('Reconnecting...');
      this.connect(this.handlers);
    }, this.reconnectInterval);
  }

  /**
   * Check if the WebSocket is currently connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current connection ID
   */
  getConnectionId(): string | null {
    return this.connectionId;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;