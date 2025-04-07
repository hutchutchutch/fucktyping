import React, { useEffect, useRef, useState } from 'react';
import WebRTCClient from '@webrtc/client';
import { Button } from '@ui/button';

const WebRTCTest = () => {
  const [roomId, setRoomId] = useState<string>(`room-${Math.floor(Math.random() * 1000)}`);
  const [userId, setUserId] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
  const [status, setStatus] = useState<string>('Disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  
  const webrtcClientRef = useRef<WebRTCClient | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.disconnect();
        webrtcClientRef.current = null;
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      // Create WebRTC client instance
      webrtcClientRef.current = new WebRTCClient({
        signalingUrl: 'http://localhost:3000',
        userId,
        audio: true,
        video: true,
        onLocalStream: (stream) => {
          addMessage('Got local stream');
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        },
        onRemoteStream: (stream) => {
          addMessage('Got remote stream');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        },
        onConnectionStateChange: (state) => {
          addMessage(`Connection state changed: ${state}`);
          setStatus(state);
        },
        onSignalingStateChange: (state) => {
          addMessage(`Signaling state changed: ${state}`);
        },
        onError: (error) => {
          addMessage(`Error: ${error.message}`);
        }
      });

      // Start local stream
      await webrtcClientRef.current.startLocalStream({ audio: true, video: true });
      addMessage('Local stream started');

      // Join room
      await webrtcClientRef.current.joinRoom(roomId);
      addMessage(`Joined room: ${roomId}`);
      
    } catch (error) {
      console.error('Failed to connect:', error);
      addMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDisconnect = () => {
    if (webrtcClientRef.current) {
      webrtcClientRef.current.disconnect();
      webrtcClientRef.current = null;
      setStatus('Disconnected');
      addMessage('Disconnected');
      
      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebRTC Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Connection Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Room ID</label>
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User ID</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <div className="p-2 border rounded bg-gray-100">
                {status}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleConnect} disabled={!!webrtcClientRef.current}>
                Connect
              </Button>
              <Button onClick={handleDisconnect} disabled={!webrtcClientRef.current} variant="outline">
                Disconnect
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Event Log</h2>
          <div className="h-60 overflow-y-auto border rounded p-2 bg-black text-white font-mono text-sm">
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Local Video</h2>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto border bg-gray-900"
          />
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Remote Video</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-auto border bg-gray-900"
          />
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p>How to test:</p>
        <ol className="list-decimal ml-5">
          <li>Open this page in two different browser windows</li>
          <li>Use the same room ID in both windows</li>
          <li>Click Connect in both windows</li>
          <li>You should see the video from the other window appear in the Remote Video panel</li>
        </ol>
      </div>
    </div>
  );
};

export default WebRTCTest;