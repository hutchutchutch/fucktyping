import { io, Socket } from 'socket.io-client';

export interface RTCPeerConfig {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
  iceCandidatePoolSize?: number;
}

export interface WebRTCClientOptions {
  signalingUrl: string;
  peerConfig?: RTCPeerConfig;
  roomId?: string;
  userId?: string;
  audio?: boolean;
  video?: boolean;
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onSignalingStateChange?: (state: RTCSignalingState) => void;
  onError?: (error: Error) => void;
}

export default class WebRTCClient {
  private socket: Socket;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string | null = null;
  private userId: string;
  private options: WebRTCClientOptions;
  private isInitiator: boolean = false;
  private remoteUserId: string | null = null;
  private isConnected: boolean = false;
  private isNegotiating: boolean = false;

  constructor(options: WebRTCClientOptions) {
    this.options = options;
    this.userId = options.userId || this.generateRandomId();
    this.roomId = options.roomId || null;
    
    // Initialize socket connection for signaling
    this.socket = io(options.signalingUrl, {
      transports: ['websocket'],
      query: {
        userId: this.userId
      }
    });
    
    this.setupSocketListeners();
  }

  /**
   * Generate a random ID if user ID is not provided
   */
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  /**
   * Set up WebSocket event listeners for signaling
   */
  private setupSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      
      // Join room if roomId is provided in options
      if (this.roomId) {
        this.joinRoom(this.roomId);
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
    });
    
    this.socket.on('error', (error: any) => {
      console.error('Signaling server error:', error);
      if (this.options.onError) {
        this.options.onError(new Error(`Signaling server error: ${error}`));
      }
    });
    
    // Handle room joined event
    this.socket.on('room_joined', (data: { roomId: string, isInitiator: boolean, peers: string[] }) => {
      console.log(`Joined room ${data.roomId} as ${data.isInitiator ? 'initiator' : 'participant'}`);
      this.isInitiator = data.isInitiator;
      
      // If there are other peers in the room and we're not the initiator, wait for offers
      if (data.peers.length > 0 && !this.isInitiator) {
        console.log(`Room has ${data.peers.length} peers. Waiting for offers.`);
      }
    });
    
    // Handle new user joined room
    this.socket.on('user_joined', (data: { roomId: string, userId: string }) => {
      console.log(`User ${data.userId} joined room ${data.roomId}`);
      
      // Store the remote user ID
      this.remoteUserId = data.userId;
      
      // If we're the initiator, send an offer
      if (this.isInitiator && this.peerConnection) {
        this.createOffer();
      }
    });
    
    // Handle user left room
    this.socket.on('user_left', (data: { roomId: string, userId: string }) => {
      console.log(`User ${data.userId} left room ${data.roomId}`);
      
      // If this was our peer, reset the connection
      if (data.userId === this.remoteUserId) {
        this.remoteUserId = null;
        this.isConnected = false;
        
        // Close and recreate peer connection
        this.closePeerConnection();
        this.setupPeerConnection();
      }
    });
    
    // Handle incoming WebRTC signaling messages
    
    // Offer from remote peer
    this.socket.on('rtc_offer', async (data: { 
      from: string, 
      to: string, 
      roomId: string, 
      sdp: RTCSessionDescriptionInit 
    }) => {
      if (data.to !== this.userId || data.roomId !== this.roomId) return;
      console.log(`Received offer from ${data.from}`);
      
      this.remoteUserId = data.from;
      
      // Make sure we have a peer connection
      if (!this.peerConnection) {
        await this.setupPeerConnection();
      }
      
      try {
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('Set remote description from offer');
        
        // Create and send answer
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        
        this.socket.emit('rtc_answer', {
          from: this.userId,
          to: data.from,
          roomId: this.roomId,
          sdp: answer
        });
        console.log('Sent answer to remote peer');
      } catch (error) {
        console.error('Error handling offer:', error);
        if (this.options.onError) {
          this.options.onError(error as Error);
        }
      }
    });
    
    // Answer from remote peer
    this.socket.on('rtc_answer', async (data: { 
      from: string, 
      to: string, 
      roomId: string, 
      sdp: RTCSessionDescriptionInit 
    }) => {
      if (data.to !== this.userId || data.roomId !== this.roomId) return;
      console.log(`Received answer from ${data.from}`);
      
      if (!this.peerConnection) {
        console.warn('Received answer but no peer connection exists');
        return;
      }
      
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('Set remote description from answer');
      } catch (error) {
        console.error('Error handling answer:', error);
        if (this.options.onError) {
          this.options.onError(error as Error);
        }
      }
    });
    
    // ICE candidate from remote peer
    this.socket.on('rtc_ice_candidate', async (data: { 
      from: string, 
      to: string, 
      roomId: string, 
      candidate: RTCIceCandidateInit 
    }) => {
      if (data.to !== this.userId || data.roomId !== this.roomId) return;
      console.log(`Received ICE candidate from ${data.from}`);
      
      if (!this.peerConnection) {
        console.warn('Received ICE candidate but no peer connection exists');
        return;
      }
      
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('Added ICE candidate');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
        if (this.options.onError) {
          this.options.onError(error as Error);
        }
      }
    });
  }

  /**
   * Set up WebRTC peer connection
   */
  private async setupPeerConnection(): Promise<void> {
    // Create RTCPeerConnection with provided configuration or defaults
    const config: RTCConfiguration = this.options.peerConfig || {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    this.peerConnection = new RTCPeerConnection(config);
    console.log('Created new RTCPeerConnection');
    
    // Set up event handlers
    
    // ICE candidate event
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.remoteUserId) {
        this.socket.emit('rtc_ice_candidate', {
          from: this.userId,
          to: this.remoteUserId,
          roomId: this.roomId,
          candidate: event.candidate
        });
        console.log('Sent ICE candidate');
      }
    };
    
    // ICE connection state change
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection!.iceConnectionState);
    };
    
    // Connection state change
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('Connection state:', state);
      
      if (this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange(state);
      }
      
      if (state === 'connected') {
        this.isConnected = true;
        console.log('WebRTC connection established');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.isConnected = false;
      }
    };
    
    // Signaling state change
    this.peerConnection.onsignalingstatechange = () => {
      console.log('Signaling state:', this.peerConnection!.signalingState);
      
      if (this.options.onSignalingStateChange) {
        this.options.onSignalingStateChange(this.peerConnection!.signalingState);
      }
      
      this.isNegotiating = (this.peerConnection!.signalingState !== 'stable');
    };
    
    // Track event - when remote stream is received
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream!.addTrack(track);
      });
      
      if (this.options.onRemoteStream) {
        this.options.onRemoteStream(this.remoteStream);
      }
    };
    
    // Negotiation needed event
    this.peerConnection.onnegotiationneeded = async () => {
      console.log('Negotiation needed');
      
      // Only handle negotiation if we're the initiator and not already negotiating
      if (this.isInitiator && !this.isNegotiating && this.remoteUserId) {
        try {
          this.isNegotiating = true;
          await this.createOffer();
        } catch (error) {
          console.error('Error during negotiation:', error);
          if (this.options.onError) {
            this.options.onError(error as Error);
          }
        } finally {
          this.isNegotiating = false;
        }
      }
    };
    
    // Add local media tracks to the connection if they exist
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
        console.log(`Added local ${track.kind} track to peer connection`);
      });
    }
  }

  /**
   * Join a WebRTC room
   */
  public async joinRoom(roomId: string): Promise<void> {
    if (this.roomId === roomId) {
      console.log(`Already in room ${roomId}`);
      return;
    }
    
    // Leave current room if in one
    if (this.roomId) {
      await this.leaveRoom();
    }
    
    this.roomId = roomId;
    
    // Set up peer connection
    await this.setupPeerConnection();
    
    // Join room through signaling server
    this.socket.emit('join_room', {
      roomId,
      userId: this.userId
    });
  }

  /**
   * Leave current WebRTC room
   */
  public async leaveRoom(): Promise<void> {
    if (!this.roomId) {
      console.log('Not in a room');
      return;
    }
    
    // Emit leave room event
    this.socket.emit('leave_room', {
      roomId: this.roomId,
      userId: this.userId
    });
    
    // Close peer connection
    this.closePeerConnection();
    
    // Reset state
    this.roomId = null;
    this.remoteUserId = null;
    this.isInitiator = false;
    this.isConnected = false;
    
    console.log('Left room');
  }

  /**
   * Close the peer connection
   */
  private closePeerConnection(): void {
    if (this.peerConnection) {
      // Remove all event listeners
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.onnegotiationneeded = null;
      
      // Close the connection
      this.peerConnection.close();
      this.peerConnection = null;
      
      console.log('Closed peer connection');
    }
    
    // Stop remote stream tracks
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }
  }

  /**
   * Start local media stream (audio/video)
   */
  public async startLocalStream(constraints: MediaStreamConstraints = {}): Promise<MediaStream> {
    // Use provided constraints or defaults from options
    const finalConstraints: MediaStreamConstraints = {
      audio: constraints.audio ?? this.options.audio ?? true,
      video: constraints.video ?? this.options.video ?? false
    };
    
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      console.log('Got local media stream');
      
      // Add tracks to peer connection if it exists
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
          console.log(`Added local ${track.kind} track to peer connection`);
        });
      }
      
      // Notify callback
      if (this.options.onLocalStream) {
        this.options.onLocalStream(this.localStream);
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Stop local media stream
   */
  public stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      
      console.log('Stopped local media stream');
    }
  }

  /**
   * Create and send WebRTC offer
   */
  private async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.remoteUserId || !this.roomId) {
      throw new Error('Cannot create offer: missing peer connection, remote user, or room ID');
    }
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer through signaling server
      this.socket.emit('rtc_offer', {
        from: this.userId,
        to: this.remoteUserId,
        roomId: this.roomId,
        sdp: offer
      });
      
      console.log('Sent offer to remote peer');
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Get the local media stream
   */
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get the remote media stream
   */
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Check if connected to a peer
   */
  public isConnectedToPeer(): boolean {
    return this.isConnected;
  }

  /**
   * Get current room ID
   */
  public getCurrentRoomId(): string | null {
    return this.roomId;
  }

  /**
   * Get user ID
   */
  public getUserId(): string {
    return this.userId;
  }

  /**
   * Disconnect from signaling server and clean up
   */
  public disconnect(): void {
    // Leave room if in one
    if (this.roomId) {
      this.leaveRoom();
    }
    
    // Stop local stream
    this.stopLocalStream();
    
    // Disconnect socket
    this.socket.disconnect();
    
    console.log('Disconnected from WebRTC and signaling');
  }
}