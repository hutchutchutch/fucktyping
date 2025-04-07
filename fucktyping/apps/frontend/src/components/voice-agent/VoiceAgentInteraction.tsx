import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './components/ui/card';
import { Mic, MicOff, Play, Square, Send, RotateCw, Volume2 } from 'lucide-react';
import { useToast } from './hooks/use-toast';
import AudioVisualizer from './components/form-responder/AudioVisualizer';
import Transcript from './components/form-responder/Transcript';

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  type: 'opening' | 'question' | 'response' | 'closing';
  timestamp: Date;
  audioUrl?: string;
  stats?: {
    latency?: number;
    processingTime?: number;
    tokens?: number;
    confidence?: number;
  };
}

interface VoiceAgentInteractionProps {
  formId?: number;
  title?: string;
  description?: string;
}

export default function VoiceAgentInteraction({ 
  formId, 
  title = "Voice Agent", 
  description = "Interact with this voice agent"
}: VoiceAgentInteractionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize conversation when formId changes
  useEffect(() => {
    if (formId) {
      startConversation();
    }
    
    // Clean up socket connection and audio on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [formId]);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      if (formId) {
        socket.send(JSON.stringify({
          type: 'init',
          formId: formId
        }));
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSocketMessage(data);
      } catch (err) {
        console.error('Error parsing socket message:', err);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to voice agent. Please try again.',
        variant: 'destructive'
      });
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      socket.close();
    };
  }, [formId]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start a new conversation
  const startConversation = async () => {
    if (!formId) return;
    
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/voice-forms/${formId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }
      
      const data = await response.json();
      setConversationId(data.conversationId);
      
      // Add initial greeting message from the agent
      if (data.message) {
        addMessage({
          id: Date.now().toString(),
          sender: 'agent',
          text: data.message,
          type: 'opening',
          timestamp: new Date(),
          audioUrl: data.audioUrl,
          stats: data.stats
        });
        
        // Play audio if available
        if (data.audioUrl) {
          playAudio(data.audioUrl);
        }
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast({
        title: 'Error',
        description: 'Failed to start conversation with the voice agent',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Continue the conversation with a message
  const continueConversation = async (message: string) => {
    if (!conversationId || !message.trim()) return;
    
    try {
      setIsProcessing(true);
      
      // Add user message to the conversation
      addMessage({
        id: Date.now().toString(),
        sender: 'user',
        text: message,
        type: 'response',
        timestamp: new Date()
      });
      
      const response = await fetch(`/api/voice-conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to continue conversation');
      }
      
      const data = await response.json();
      
      // Add agent response to the conversation
      if (data.message) {
        addMessage({
          id: Date.now().toString(),
          sender: 'agent',
          text: data.message,
          type: data.type || 'question',
          timestamp: new Date(),
          audioUrl: data.audioUrl,
          stats: data.stats
        });
        
        // Play audio if available
        if (data.audioUrl) {
          playAudio(data.audioUrl);
        }
      }
    } catch (err) {
      console.error('Error continuing conversation:', err);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the voice agent',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setTranscript('');
    }
  };

  // Handle WebSocket messages
  const handleSocketMessage = (data: any) => {
    console.log('Received socket message:', data);
    
    switch (data.type) {
      case 'response':
        // Agent response via WebSocket
        addMessage({
          id: Date.now().toString(),
          sender: 'agent',
          text: data.text,
          type: data.questionType || 'question',
          timestamp: new Date(),
          stats: data.stats
        });
        break;
        
      case 'transcription':
        // Transcription result
        setTranscript(data.text);
        break;
        
      case 'audio':
        // Audio data from text-to-speech
        if (data.audioUrl) {
          // Update the last agent message with audio URL
          setMessages(prev => {
            const newMessages = [...prev];
            const lastAgentMessageIndex = [...newMessages].reverse().findIndex(m => m.sender === 'agent');
            if (lastAgentMessageIndex !== -1) {
              const actualIndex = newMessages.length - 1 - lastAgentMessageIndex;
              newMessages[actualIndex] = {
                ...newMessages[actualIndex],
                audioUrl: data.audioUrl
              };
            }
            return newMessages;
          });
          
          // Play the audio
          playAudio(data.audioUrl);
        }
        break;
        
      case 'error':
        // Error message
        toast({
          title: 'Error',
          description: data.error || 'Something went wrong',
          variant: 'destructive'
        });
        break;
    }
  };

  // Add a message to the conversation
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };
      
      // Create audio visualization data
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVisualization = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const normalizedData = Array.from(dataArray).map(val => val / 255);
          setAudioData(normalizedData);
          requestAnimationFrame(updateVisualization);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      updateVisualization();
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks in the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear visualization data
      setAudioData([]);
    }
  };

  // Process recorded audio
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix
        
        // If using WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'audio',
            audioData: base64Data,
            formId: formId,
            conversationId: conversationId
          }));
        } else {
          // Fallback to REST API
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio: base64Data
            })
          });
          
          if (!response.ok) {
            throw new Error('Transcription failed');
          }
          
          const data = await response.json();
          
          if (data.transcript) {
            setTranscript(data.transcript);
            continueConversation(data.transcript);
          }
        }
      };
    } catch (err) {
      console.error('Error processing audio:', err);
      toast({
        title: 'Processing Error',
        description: 'Failed to process your audio. Please try again.',
        variant: 'destructive'
      });
      setIsProcessing(false);
    }
  };

  // Play audio from URL
  const playAudio = (audioUrl: string) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }
    
    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    
    audio.onended = () => {
      setCurrentAudio(null);
    };
    
    audio.onerror = () => {
      toast({
        title: 'Audio Error',
        description: 'Could not play the response audio',
        variant: 'destructive'
      });
      setCurrentAudio(null);
    };
    
    audio.play().catch(err => {
      console.error('Error playing audio:', err);
    });
  };

  // Send text message
  const sendTextMessage = () => {
    if (transcript.trim()) {
      continueConversation(transcript);
    }
  };

  // Reset the conversation
  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setTranscript('');
    startConversation();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 h-96 overflow-y-auto border rounded-md p-4 bg-background">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {isProcessing ? 'Starting conversation...' : 'No messages yet. Start a conversation.'}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <div className="mb-1">{message.text}</div>
                    
                    {message.audioUrl && message.sender === 'agent' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={() => playAudio(message.audioUrl!)}
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Play audio
                      </Button>
                    )}
                    
                    {message.stats && (
                      <div className="text-xs opacity-70 mt-1">
                        {message.stats.processingTime && `Processed in ${message.stats.processingTime.toFixed(2)}s`}
                        {message.stats.tokens && ` · ${message.stats.tokens} tokens`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              disabled={isProcessing}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1 border rounded-md p-2 min-h-[50px]">
              {isRecording ? (
                <AudioVisualizer isRecording={isRecording} audioData={audioData} />
              ) : (
                <Transcript text={transcript} isLoading={isProcessing} />
              )}
            </div>
            
            <Button
              variant="default"
              size="icon"
              disabled={isRecording || isProcessing || !transcript.trim()}
              onClick={sendTextMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={resetConversation}
          disabled={isProcessing || isRecording}
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Reset Conversation
        </Button>
        
        <div className="text-xs text-muted-foreground">
          {conversationId ? `Conversation ID: ${conversationId}` : 'No active conversation'}
        </div>
      </CardFooter>
    </Card>
  );
}