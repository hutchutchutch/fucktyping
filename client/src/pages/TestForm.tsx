import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Slider } from "../components/ui/slider";
import VoiceRecorder from "../components/form-responder/VoiceRecorder";
import { setupWebSocketConnection, sendWebSocketMessage, closeWebSocketConnection, initializeAIServices } from "../services/aiService";
import { 
  Mic, 
  MicOff, 
  Play, 
  Settings, 
  Edit, 
  ChevronLeft, 
  Save,
  Maximize, 
  RefreshCcw, 
  User,
  Bot,
  Clock,
  Zap,
  MoveHorizontal,
  BarChart,
  Volume2
} from "lucide-react";

interface Message {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  type: 'opening' | 'question' | 'closing' | 'response';
  timestamp: Date;
  stats?: {
    latency: number;
    processingTime: number;
    tokens: number;
  };
  promptSettings?: {
    temperature: number;
    maxTokens: number;
    voice: string;
    speed: number;
  };
  originalPrompt?: string;
}

export default function TestForm() {
  const { formId } = useParams<{ formId: string }>();
  const [, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeEditMessage, setActiveEditMessage] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedSettings, setEditedSettings] = useState({
    temperature: 0.7,
    maxTokens: 150,
    voice: "male",
    speed: 1.0
  });
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: 'agent',
      text: "Hello, I'm your form assistant. I'll be guiding you through this form today. What's your name?",
      type: 'opening',
      timestamp: new Date(),
      stats: {
        latency: 250,
        processingTime: 420,
        tokens: 28
      },
      promptSettings: {
        temperature: 0.7,
        maxTokens: 150,
        voice: "male",
        speed: 1.0
      },
      originalPrompt: "Introduce yourself as a form assistant and ask for the user's name."
    }
  ]);

  // Initialize WebSocket and AI services
  useEffect(() => {
    // Initialize without real API keys for demo purposes
    initializeAIServices('', '');
    
    // Setup WebSocket connection for real-time voice interaction
    setupWebSocketConnection('', (data) => {
      if (data.type === 'response') {
        // Add AI response as a message
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: data.text,
          type: 'question',
          timestamp: new Date(),
          stats: data.stats || {
            latency: 250,
            processingTime: 450,
            tokens: 30
          }
        };
        
        setMessages(prevMessages => [...prevMessages, agentMessage]);
      }
    });
    
    return () => {
      // Clean up WebSocket connection on unmount
      closeWebSocketConnection();
    };
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (userInput.trim() === "") return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput,
      type: 'response',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setUserInput("");
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      // Choose response text based on conversation state
      let responseText = "Thank you for that information. Next question: How would you rate your experience with our service on a scale from 1 to 5?";
      let responseType: Message['type'] = 'question';
      
      if (messages.length > 4) {
        responseText = "Thank you for completing the form. Your responses have been recorded.";
        responseType = 'closing';
      }
      
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: responseText,
        type: responseType,
        timestamp: new Date(),
        stats: {
          latency: Math.floor(Math.random() * 300) + 200,
          processingTime: Math.floor(Math.random() * 500) + 300,
          tokens: Math.floor(Math.random() * 30) + 15
        },
        promptSettings: {
          temperature: 0.7,
          maxTokens: 150,
          voice: "male",
          speed: 1.0
        },
        originalPrompt: "Ask the user to rate their experience on a scale from 1 to 5."
      };
      
      setMessages(prevMessages => [...prevMessages, agentMessage]);
    }, 1000);
  };

  const startEditing = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.originalPrompt) {
      setEditedPrompt(message.originalPrompt);
      setEditedSettings(message.promptSettings || {
        temperature: 0.7,
        maxTokens: 150,
        voice: "male",
        speed: 1.0
      });
      setActiveEditMessage(messageId);
    }
  };

  const saveEdits = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              originalPrompt: editedPrompt,
              promptSettings: editedSettings,
              text: "Hello, I'm your form assistant. I'll be guiding you through this form today. What's your name?", // In a real app, this would be regenerated
            }
          : msg
      )
    );
    setActiveEditMessage(null);
  };

  const regenerateMessage = (messageId: string) => {
    // In a real app, this would call the API to regenerate
    alert("Message would be regenerated with current settings");
  };

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  const handleVoiceRecording = () => {
    setShowVoiceRecorder(!showVoiceRecorder);
  };
  
  const handleTranscriptionComplete = (transcript: string) => {
    setUserInput(transcript);
    setShowVoiceRecorder(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const goBackToForm = () => {
    setLocation(`/forms/new`);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={goBackToForm}>
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Form Editor
          </Button>
          <h1 className="text-xl font-semibold">Test Form: {formId || "Untitled Form"}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset Test
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'agent' ? 'w-full' : ''}`}>
                {message.sender === 'agent' && (
                  <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs font-normal">
                      {message.type === 'opening' ? 'Opening Activity' : 
                       message.type === 'question' ? 'Question' : 'Closing Activity'}
                    </Badge>
                    
                    <div className="flex items-center ml-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{message.stats?.latency}ms latency</span>
                    </div>
                    
                    <div className="flex items-center ml-2">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>{message.stats?.processingTime}ms processing</span>
                    </div>
                    
                    <div className="flex items-center ml-2">
                      <MoveHorizontal className="h-3 w-3 mr-1" />
                      <span>{message.stats?.tokens} tokens</span>
                    </div>
                  </div>
                )}
                
                <div 
                  className={`p-4 rounded-lg shadow ${
                    message.sender === 'agent' 
                      ? 'bg-card border' 
                      : 'bg-primary text-primary-foreground ml-auto'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-2 flex-shrink-0 ${
                      message.sender === 'agent' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-primary-foreground/20 text-primary-foreground'
                    }`}>
                      {message.sender === 'agent' ? (
                        <Bot className="h-5 w-5" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p>{message.text}</p>
                    </div>
                  </div>
                  
                  {message.sender === 'agent' && (
                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                      <div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => startEditing(message.id)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Prompt
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-8">
                          <Volume2 className="h-3 w-3 mr-1" />
                          Play Audio
                        </Button>
                      </div>
                      <div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs h-8"
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              Voice Settings
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <h4 className="font-medium">Voice Settings</h4>
                              <div className="space-y-2">
                                <Label>Voice</Label>
                                <Tabs defaultValue="male" className="w-full">
                                  <TabsList className="grid grid-cols-3 w-full">
                                    <TabsTrigger value="male">Male</TabsTrigger>
                                    <TabsTrigger value="female">Female</TabsTrigger>
                                    <TabsTrigger value="neutral">Neutral</TabsTrigger>
                                  </TabsList>
                                </Tabs>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Speed</Label>
                                  <span className="text-sm">1.0x</span>
                                </div>
                                <Slider 
                                  defaultValue={[1]} 
                                  max={2} 
                                  min={0.5} 
                                  step={0.1} 
                                  className="w-full" 
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8"
                          onClick={() => regenerateMessage(message.id)}
                        >
                          <RefreshCcw className="h-3 w-3 mr-1" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Editor panel for agent messages */}
                {message.sender === 'agent' && activeEditMessage === message.id && (
                  <Card className="mt-3 border-primary/20">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="prompt-editor">System Prompt</Label>
                        <Textarea 
                          id="prompt-editor"
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Temperature</Label>
                            <span className="text-sm">{editedSettings.temperature}</span>
                          </div>
                          <Slider 
                            value={[editedSettings.temperature]} 
                            max={1} 
                            min={0} 
                            step={0.1} 
                            className="w-full"
                            onValueChange={(value) => setEditedSettings({...editedSettings, temperature: value[0]})}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Max Tokens</Label>
                            <span className="text-sm">{editedSettings.maxTokens}</span>
                          </div>
                          <Slider 
                            value={[editedSettings.maxTokens]} 
                            max={500} 
                            min={10} 
                            step={10} 
                            className="w-full"
                            onValueChange={(value) => setEditedSettings({...editedSettings, maxTokens: value[0]})}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveEditMessage(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={() => saveEdits(message.id)}
                        >
                          Save & Regenerate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          {showVoiceRecorder ? (
            <VoiceRecorder 
              onTranscriptionComplete={handleTranscriptionComplete}
              isTranscribing={isTranscribing}
              setIsTranscribing={setIsTranscribing}
            />
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  className="min-h-[60px] resize-none"
                  rows={1}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceRecording}
                  className="h-10 w-10"
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={userInput.trim() === ""}
                  className="h-10"
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}