import React, { useEffect, useRef, useState } from 'react';
import WebRTCClient from 'webrtc-client';
import { Button } from '@ui/button';

const WebRTCAudioTest = () => {
  const [roomId, setRoomId] = useState<string>(`room-${Math.floor(Math.random() * 1000)}`);
  const [userId, setUserId] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
  const [status, setStatus] = useState<string>('Disconnected');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [audioVisualizerData, setAudioVisualizerData] = useState<number[]>(Array(50).fill(0));
  
  const webrtcClientRef = useRef<WebRTCClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Create audio context if supported
    if (typeof AudioContext !== 'undefined') {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    // Cleanup function
    return () => {
      if (webrtcClientRef.current) {
        webrtcClientRef.current.disconnect();
        webrtcClientRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateAudioVisualizer = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Convert to normalized values for visualization
    const visualData = Array.from(dataArray.slice(0, 50)).map(val => val / 255);
    setAudioVisualizerData(visualData);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
  };

  const handleConnect = async () => {
    try {
      // Create WebRTC client instance
      webrtcClientRef.current = new WebRTCClient({
        signalingUrl: 'http://localhost:3000',
        userId,
        audio: true,
        video: false,
        onLocalStream: (stream) => {
          addMessage('Got local stream');
          setIsTransmitting(true);
          
          // Set up audio visualization
          if (audioContextRef.current && analyserRef.current) {
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            updateAudioVisualizer();
          }
        },
        onRemoteStream: (stream) => {
          addMessage('Got remote stream');
          
          // Play remote audio
          const audioElement = new Audio();
          audioElement.srcObject = stream;
          audioElement.play();
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
      await webrtcClientRef.current.startLocalStream({ audio: true, video: false });
      addMessage('Local audio stream started');

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
      setIsTransmitting(false);
      addMessage('Disconnected');
      
      // Stop audio visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebRTC Audio Test</h1>
      
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
      
      <div className="p-4 border rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Audio Visualizer</h2>
        <div className={`h-24 border rounded flex items-end justify-center gap-1 p-2 ${isTransmitting ? 'bg-indigo-50' : 'bg-gray-50'}`}>
          {audioVisualizerData.map((value, index) => (
            <div 
              key={index}
              className="w-2 bg-indigo-500 rounded-t"
              style={{ 
                height: `${value * 100}%`,
                opacity: isTransmitting ? 1 : 0.3
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-center text-sm">
          {isTransmitting ? 
            <span className="text-green-600 font-medium">Transmitting audio</span> : 
            <span className="text-gray-500">Audio inactive</span>
          }
        </div>
      </div>
      
      <div className="mb-6 p-4 border rounded bg-blue-50">
        <h2 className="text-lg font-semibold mb-2">How to Test</h2>
        <ol className="list-decimal ml-5 space-y-2">
          <li>Open this page in two different browser windows or devices</li>
          <li>Use the same room ID in both windows</li>
          <li>Click "Connect" in both windows</li>
          <li>Start speaking into your microphone</li>
          <li>You should hear the audio from the other window/device</li>
          <li>The audio visualizer will show your microphone input levels</li>
        </ol>
      </div>
      
      <div className="text-sm text-gray-600 italic p-4 border-t">
        <p>Note: WebRTC requires proper STUN/TURN servers for production use across NATs and firewalls. 
        This demo uses Google's public STUN servers which may not work in all network environments.</p>
      </div>
    </div>
  );
};

export default WebRTCAudioTest;