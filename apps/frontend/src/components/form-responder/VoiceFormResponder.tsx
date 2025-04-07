import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@hooks/use-toast";
import websocketService from '@services/websocketService';
import VoiceInterface from '@components/form-responder/VoiceInterface';
import Transcript from '@components/form-responder/Transcript';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Mic, MicOff, Radio, MessageSquare, AlertTriangle } from 'lucide-react';
import { Badge } from "@ui/badge";
import { useParams, useLocation } from 'wouter';

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  type: 'opening' | 'question' | 'closing' | 'response';
  timestamp: Date;
  stats?: {
    latency?: number;
    processingTime?: number;
    tokens?: number;
    audioLength?: number;
    confidence?: number;
  };
}

interface Question {
  id: number | string;
  text: string;
  type: string;
  required: boolean;
  options?: string[] | null;
}

interface VoiceFormResponderProps {
  formId?: number;
  standalone?: boolean;
}

const VoiceFormResponder: React.FC<VoiceFormResponderProps> = ({ formId, standalone = false }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const [, setLocation] = useLocation();
  
  // Use formId from props or URL params
  const activeFormId = formId || (params.id ? parseInt(params.id) : undefined);

  useEffect(() => {
    if (!activeFormId) {
      toast({
        title: "Error",
        description: "No form ID provided",
        variant: "destructive"
      });
      return;
    }

    // Connect to WebSocket service
    websocketService.connect({
      onOpen: () => {
        setIsConnected(true);
        // Initialize session
        websocketService.initializeFormSession(activeFormId);
        
        // Add initial welcome message
        addMessage({
          id: Date.now().toString(),
          sender: 'agent',
          text: "Welcome to the voice form. I'll guide you through the questions. You can speak your answers or type them.",
          type: 'opening',
          timestamp: new Date()
        });

        // Set first question
        setCurrentQuestion({
          id: 1,
          text: "How would you rate your experience with our product?",
          type: "rating",
          required: true
        });
      },
      onClose: () => {
        setIsConnected(false);
      },
      onError: () => {
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive"
        });
      },
      onResponse: (data) => {
        setIsProcessing(false);
        
        // Add agent response message
        addMessage({
          id: data.messageId || Date.now().toString(),
          sender: 'agent',
          text: data.text,
          type: 'response',
          timestamp: new Date(),
          stats: {
            latency: data.stats?.latency,
            processingTime: data.stats?.processingTime,
            tokens: data.stats?.tokens
          }
        });

        // Simulate moving to next question
        setTimeout(() => {
          const nextQuestionId = typeof currentQuestion?.id === 'number' 
            ? currentQuestion.id + 1 
            : 2;
          
          if (nextQuestionId <= 3) {
            const nextQuestions = [
              {
                id: 2,
                text: "What specific features do you like about our product?",
                type: "text",
                required: true
              },
              {
                id: 3,
                text: "Would you recommend our product to others?",
                type: "multiple_choice",
                options: ["Yes, definitely", "Maybe", "No"],
                required: true
              }
            ];
            
            setCurrentQuestion(nextQuestions[nextQuestionId - 2]);
          } else {
            // Form completed
            setCurrentQuestion(null);
            setIsCompleted(true);
            
            // Add closing message
            addMessage({
              id: Date.now().toString(),
              sender: 'agent',
              text: 'Thank you for completing the form! Your responses have been recorded.',
              type: 'closing',
              timestamp: new Date()
            });
          }
        }, 1000);
      },
      onTranscription: (data) => {
        setTranscript(data.text);
        setIsProcessing(true);
        
        // Add user message
        addMessage({
          id: data.messageId || Date.now().toString(),
          sender: 'user',
          text: data.text,
          type: 'response',
          timestamp: new Date(),
          stats: {
            confidence: data.confidence,
            processingTime: data.processingTime
          }
        });
        
        // Send transcript to server for processing
        if (currentQuestion) {
          websocketService.sendTranscript(
            data.text,
            activeFormId,
            typeof currentQuestion.id === 'number' ? currentQuestion.id : undefined,
            currentQuestion.type,
            `Question: ${currentQuestion.text}${currentQuestion.options ? '. Options: ' + currentQuestion.options.join(', ') : ''}`,
            { temperature: 0.7, maxTokens: 150 }
          );
        }
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, [activeFormId, toast]);

  // Auto-scroll to the bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a message to the chat
  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Handle start recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscript('');
  };

  // Handle stop recording
  const handleStopRecording = (audioBlob: Blob) => {
    setIsRecording(false);
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data:audio/webm;base64, part
      const audioData = base64data.split(',')[1];
      
      // Send audio data to server
      if (currentQuestion) {
        websocketService.sendAudio(
          audioData,
          activeFormId,
          typeof currentQuestion.id === 'number' ? currentQuestion.id : undefined
        );
      }
    };
  };

  // Handle text submission
  const handleTextSubmit = (text: string) => {
    if (!text.trim()) return;
    
    setTranscript(text);
    
    // Add user message
    addMessage({
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      type: 'response',
      timestamp: new Date()
    });
    
    setIsProcessing(true);
    
    // Send text to server
    if (currentQuestion) {
      websocketService.sendTranscript(
        text,
        activeFormId,
        typeof currentQuestion.id === 'number' ? currentQuestion.id : undefined,
        currentQuestion.type,
        `Question: ${currentQuestion.text}${currentQuestion.options ? '. Options: ' + currentQuestion.options.join(', ') : ''}`,
        { temperature: 0.7, maxTokens: 150 }
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-background flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {!isConnected && (
            <Card className="mb-4 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Connection Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 dark:text-red-400">
                  Not connected to the voice service. Please refresh the page to try again.
                </p>
              </CardContent>
            </Card>
          )}
          
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[85%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : ''}`}>
                <CardHeader className="p-3 pb-1">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {message.sender === 'agent' ? (
                        <>
                          <Radio className="h-4 w-4" />
                          Assistant
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4" />
                          You
                        </>
                      )}
                    </CardTitle>
                    {message.type === 'opening' && (
                      <Badge variant="outline" className="text-xs">Opening</Badge>
                    )}
                    {message.type === 'closing' && (
                      <Badge variant="outline" className="text-xs">Closing</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-1">
                  <p>{message.text}</p>
                </CardContent>
                {message.stats && (
                  <CardFooter className="p-2 pt-0 text-xs text-muted-foreground flex flex-wrap gap-2">
                    {message.stats.tokens && (
                      <span>Tokens: {message.stats.tokens}</span>
                    )}
                    {message.stats.processingTime && (
                      <span>Processing: {message.stats.processingTime}ms</span>
                    )}
                    {message.stats.confidence && (
                      <span>Confidence: {Math.round(message.stats.confidence * 100)}%</span>
                    )}
                  </CardFooter>
                )}
              </Card>
            </div>
          ))}
          <div ref={messagesEndRef} />
          
          {currentQuestion && (
            <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Question {currentQuestion.id}</CardTitle>
                <CardDescription>
                  {currentQuestion.required && (
                    <Badge variant="secondary" className="mr-2">Required</Badge>
                  )}
                  {currentQuestion.type === 'multiple_choice' && (
                    <Badge>Multiple Choice</Badge>
                  )}
                  {currentQuestion.type === 'text' && (
                    <Badge>Text</Badge>
                  )}
                  {currentQuestion.type === 'rating' && (
                    <Badge>Rating</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{currentQuestion.text}</p>
                {currentQuestion.options && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Options:</p>
                    <ul className="list-disc pl-5">
                      {currentQuestion.options.map((option, index) => (
                        <li key={index}>{option}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {isCompleted && (
            <div className="mt-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Form Completed</h3>
              <p className="mb-6">Thank you for your responses!</p>
              <Button onClick={() => setLocation('/forms')}>
                Return to Forms
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {!isCompleted && currentQuestion && (
        <div className="border-t bg-background p-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <Transcript text={transcript} isLoading={isProcessing} />
            </div>
            
            <VoiceInterface
              question={currentQuestion}
              onAnswer={(answer) => Promise.resolve()} // We're handling this through WebSockets
              isProcessing={isProcessing}
              isLastQuestion={currentQuestion.id === 3}
              standalone={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceFormResponder;