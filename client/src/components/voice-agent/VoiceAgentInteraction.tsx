import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentInteractionProps {
  formId?: number;
  title?: string;
  description?: string;
}

export default function VoiceAgentInteraction({ 
  formId = 1, 
  title = "Voice-Driven Form Conversation", 
  description = "Use your voice to interact with the AI-powered form assistant."
}: VoiceAgentInteractionProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize conversation when component mounts
  useEffect(() => {
    if (!formId) return;
    
    const initializeConversation = async () => {
      try {
        setIsStarting(true);
        const response = await fetch(`/api/voice-forms/${formId}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        
        const data = await response.json();
        
        if (data.success && data.conversation && data.conversation.conversationId) {
          setConversationId(data.conversation.conversationId);
          
          // Add the opening message
          if (data.nextMessage) {
            setMessages([{
              id: Date.now().toString(),
              role: 'assistant',
              content: data.nextMessage,
              timestamp: new Date()
            }]);
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to start the conversation.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not connect to the voice form agent.",
          variant: "destructive"
        });
        console.error('Error initializing conversation:', error);
      } finally {
        setIsStarting(false);
      }
    };
    
    initializeConversation();
    
    // Clean up any audio streams when component unmounts
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [formId, toast]);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        
        // Convert audio to base64 for sending to API
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          
          if (base64Audio) {
            // Transcribe the audio
            try {
              setIsProcessing(true);
              const transcribeResponse = await fetch('/api/voice/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio })
              });
              
              const transcribeResult = await transcribeResponse.json();
              
              if (transcribeResult.transcript) {
                // Set the transcript as the user input
                setUserInput(transcribeResult.transcript);
                // Automatically send the transcribed message
                sendMessage(transcribeResult.transcript);
              } else {
                toast({
                  title: "Transcription Failed",
                  description: "Could not transcribe audio. Try speaking more clearly or typing your response.",
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error('Error transcribing audio:', error);
              toast({
                title: "Error",
                description: "Failed to process audio.",
                variant: "destructive"
              });
            } finally {
              setIsProcessing(false);
            }
          }
        };
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  };

  // Send a message to the conversation
  const sendMessage = async (text: string = userInput) => {
    if (!text.trim() || !conversationId || isProcessing) return;
    
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    
    try {
      setIsProcessing(true);
      const response = await fetch(`/api/voice-conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: text.trim() })
      });
      
      const data = await response.json();
      
      if (data.success && data.nextMessage) {
        const newAssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: data.nextMessage,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newAssistantMessage]);
        
        // Synthesize speech for the assistant's message
        try {
          const synthesizeResponse = await fetch('/api/voice/synthesize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.nextMessage })
          });
          
          const synthesizeResult = await synthesizeResponse.json();
          
          if (synthesizeResult.audioUrl) {
            // Play the audio
            const audio = new Audio(synthesizeResult.audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error('Error synthesizing speech:', error);
        }
      } else if (!data.success) {
        toast({
          title: "Error",
          description: data.message || "Failed to process message.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-4 h-[400px] overflow-y-auto">
        {isStarting ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Initializing conversation...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    message.role === 'assistant' 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-4 gap-2">
        {isProcessing && <Progress value={50} className="h-1 mb-2" />}
        <Textarea
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="min-h-[60px]"
          disabled={isProcessing || isStarting}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              variant="outline" 
              size="icon"
              onClick={startRecording}
              disabled={isRecording || isProcessing || isStarting}
            >
              <Mic className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="icon"
              onClick={stopRecording}
              className="bg-red-100"
            >
              <MicOff className="h-4 w-4" />
            </Button>
          )}
          <Button 
            onClick={() => sendMessage()}
            disabled={!userInput.trim() || isProcessing || isStarting}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}