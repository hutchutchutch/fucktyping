import { io, Socket } from 'socket.io-client';
import { RTCSignalData } from 'shared';

export interface WebRTCClientOptions {
  serverUrl: string;
  iceServers?: RTCIceServer[];
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onRemoteTrack?: (track: MediaStreamTrack, stream: MediaStream) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export class WebRTCClient {
  private socket: Socket;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private roomId: string | null = null;
  private userId: string = Math.random().toString(36).substring(2, 9);
  private options: WebRTCClientOptions;

  constructor(options: WebRTCClientOptions) {
    this.options = options;
    this.socket = io(options.serverUrl);
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (this.options.onConnect) this.options.onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      if (this.options.onDisconnect) this.options.onDisconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      if (this.options.onError) this.options.onError(new Error(error));
    });

    this.socket.on('signal', async (data: RTCSignalData) => {
      if (data.target !== this.userId) return;
      
      try {
        if (data.type === 'offer') {
          await this.handleOffer(data.payload);
        } else if (data.type === 'answer') {
          await this.handleAnswer(data.payload);
        } else if (data.type === 'candidate') {
          await this.handleCandidate(data.payload);
        }
      } catch (error) {
        console.error('Error handling signal:', error);
        if (this.options.onError) this.options.onError(error as Error);
      }
    });
  }

  async joinRoom(roomId: string) {
    this.roomId = roomId;
    this.socket.emit('join-room', { roomId, userId: this.userId });
    this.setupPeerConnection();
  }

  async leaveRoom() {
    if (this.roomId) {
      this.socket.emit('leave-room', { roomId: this.roomId, userId: this.userId });
      this.roomId = null;
      this.closePeerConnection();
    }
  }

  private setupPeerConnection() {
    const config: RTCConfiguration = {
      iceServers: this.options.iceServers || [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
    
    this.peerConnection = new RTCPeerConnection(config);
    
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'candidate',
          payload: event.candidate,
          sender: this.userId
        });
      }
    };
    
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      
      if (this.options.onRemoteTrack) {
        event.streams[0].getTracks().forEach(track => {
          this.options.onRemoteTrack!(track, event.streams[0]);
        });
      }
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      if (this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange(this.peerConnection!.connectionState);
      }
    };
  }

  private closePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.ontrack = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
  }

  private sendSignal(data: RTCSignalData) {
    if (!this.roomId) {
      throw new Error('Not in a room. Call joinRoom() first.');
    }
    this.socket.emit('signal', { ...data, roomId: this.roomId });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      this.setupPeerConnection();
    }
    
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    
    this.sendSignal({
      type: 'answer',
      payload: answer,
      sender: this.userId
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  async startLocalStream(constraints: MediaStreamConstraints = { audio: true, video: false }) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.peerConnection) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, this.localStream!);
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      if (this.options.onError) this.options.onError(error as Error);
      throw error;
    }
  }

  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not established. Call joinRoom() first.');
    }
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignal({
        type: 'offer',
        payload: offer,
        sender: this.userId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      if (this.options.onError) this.options.onError(error as Error);
      throw error;
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  disconnect() {
    this.leaveRoom();
    this.socket.disconnect();
  }
}

export default WebRTCClient;