import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Mic, 
  MicOff, 
  Send, 
  CornerDownLeft, 
  Settings, 
  ChevronRight, 
  ChevronDown, 
  Edit, 
  Clock, 
  Zap, 
  BarChart, 
  VolumeX,
  Volume2,
  Sliders
} from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { mockForms } from '../services/mockData';
import { FormWithQuestions } from '@shared/schema';
import VoiceRecorder from '../components/form-responder/VoiceRecorder';
import AudioVisualizer from '../components/form-responder/AudioVisualizer';
import Transcript from '../components/form-responder/Transcript';

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
    audioLength?: number;
  };
  promptSettings?: {
    temperature: number;
    maxTokens: number;
    voice: string;
    speed: number;
  };
  originalPrompt?: string;
  context?: string;
}

// Voice options
const VOICE_OPTIONS = [
  { id: 'male', name: 'Male (Adam)' },
  { id: 'female', name: 'Female (Emma)' },
  { id: 'neutral', name: 'Neutral (Sam)' }
];

export default function TestForm({ params }: { params?: { id: string } }) {
  // Get form ID from URL params or query parameter
  const [location, navigate] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the ID from the route params
  const pathParts = location.split('/');
  let routeFormId = null;
  
  // Extract ID from URL path - handle multiple potential URL formats
  if (pathParts.length > 3) {
    if (pathParts.includes('test') && pathParts.indexOf('test') + 1 < pathParts.length) {
      // Get the ID that comes after "test" in the URL
      const testIndex = pathParts.indexOf('test');
      routeFormId = pathParts[testIndex + 1];
    }
  }
  
  // Fallback to query param if not in path
  const urlParams = new URLSearchParams(window.location.search);
  const queryFormId = urlParams.get('formId');
  
  // Use the first available ID source
  const formId = params?.id || routeFormId || queryFormId;
  
  // State
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [formStarted, setFormStarted] = useState<boolean>(false);
  const [formCompleted, setFormCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  
  // Default agent settings
  const [agentSettings, setAgentSettings] = useState({
    temperature: 0.7,
    maxTokens: 150,
    voice: 'female',
    speed: 1.0,
    useCustomPrompts: false,
    customOpeningPrompt: '',
    customQuestionPrompt: '',
    customClosingPrompt: '',
    includeFormContext: true
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load form data
  useEffect(() => {
    if (formId) {
      try {
        // Fetch form data
        const id = parseInt(formId, 10);
        
        // Ensure mockForms is available and has data
        if (!mockForms || mockForms.length === 0) {
          console.error("Mock forms data is empty or unavailable");
          setLoading(false);
          return;
        }
        
        const foundForm = mockForms.find(f => f.id === id);
        
        if (foundForm) {
          setForm(foundForm);
          
          // Sample form context for the background
          const formContext = `Form Type: ${foundForm.title} Survey
Categories: Customer Feedback, Product Research
Target Audience: Current Customers
Goals: Measure satisfaction, identify improvement areas
Key Metrics: NPS Score, Feature Satisfaction`;
          
          // Create opening message with stats for demo
          const initialMessage: Message = {
            id: 'opening',
            sender: 'agent',
            text: `Welcome to the "${foundForm.title}" form. ${foundForm.description || ''} This form contains ${foundForm.questions?.length || 0} questions. Would you like to begin?`,
            type: 'opening',
            timestamp: new Date(),
            stats: {
              latency: 125, // ms
              processingTime: 250, // ms
              tokens: 42
            },
            promptSettings: {
              temperature: 0.7,
              maxTokens: 150,
              voice: 'female',
              speed: 1.0
            },
            originalPrompt: `You are a helpful voice assistant conducting a survey about "${foundForm.title}". Begin by greeting the user, briefly explaining the purpose, and asking if they would like to start.`,
            context: formContext
          };
          
          setMessages([initialMessage]);
        } else {
          console.error(`Form with ID ${id} not found in mock data`);
        }
      } catch (error) {
        console.error("Error loading form:", error);
      }
      
      setLoading(false);
    } else {
      console.error("No formId provided");
      setLoading(false);
    }
  }, [formId]);

  // Start the form interaction
  const startForm = () => {
    if (!form || !form.questions || form.questions.length === 0) return;
    
    setFormStarted(true);
    
    // Get the first question
    const firstQuestion = form.questions[0];
    
    // Add question message with stats
    const questionMessage: Message = {
      id: `question-${firstQuestion.id}`,
      sender: 'agent',
      text: firstQuestion.text,
      type: 'question',
      timestamp: new Date(),
      stats: {
        latency: 78, // ms
        processingTime: 189, // ms
        tokens: 36
      },
      promptSettings: {
        temperature: agentSettings.temperature,
        maxTokens: agentSettings.maxTokens,
        voice: agentSettings.voice,
        speed: agentSettings.speed
      },
      originalPrompt: `Ask the user the following question: "${firstQuestion.text}". Wait for their response before proceeding.`,
      context: agentSettings.includeFormContext ? `Question Type: ${firstQuestion.type}\nRequired: ${firstQuestion.required ? 'Yes' : 'No'}\nOrder: ${firstQuestion.order}` : undefined
    };
    
    setMessages(prev => [...prev, questionMessage]);
  };

  // Handle text input submission
  const handleSubmit = async () => {
    if (!inputText.trim() || !form || !form.questions) return;
    
    // Create user message
    const userMessage: Message = {
      id: `response-${Date.now()}`,
      sender: 'user',
      text: inputText,
      type: 'response',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Determine the current question context to send to the API
      let questionContext = "";
      let currentQuestionType = "";
      
      if (form.questions && currentQuestionIndex < form.questions.length) {
        const currentQuestion = form.questions[currentQuestionIndex];
        questionContext = `Question: "${currentQuestion.text}"\nType: ${currentQuestion.type}\nRequired: ${currentQuestion.required ? 'Yes' : 'No'}\nOrder: ${currentQuestion.order}`;
        currentQuestionType = currentQuestion.type;
      }
      
      // Create a mock response ID for demonstration purposes
      // In a real app, this would be retrieved from the database
      const mockResponseId = form.id * 1000 + Date.now() % 1000;
      
      // Call the conversation API
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId: mockResponseId,
          message: inputText,
          questionContext,
          agentSettings: {
            temperature: agentSettings.temperature,
            maxTokens: agentSettings.maxTokens,
            model: 'grok-2-1212'
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Move to next question or end the form
      const nextIndex = currentQuestionIndex + 1;
      
      // Clear input field and transcript
      setInputText('');
      setTranscript('');
      
      if (nextIndex < form.questions.length) {
        // Create AI response message
        const aiResponseMessage: Message = {
          id: `ai-response-${Date.now()}`,
          sender: 'agent',
          text: data.message,
          type: 'response',
          timestamp: new Date(),
          stats: {
            latency: response.headers.get('X-Response-Time') ? parseInt(response.headers.get('X-Response-Time') || '0') : data.stats?.processingTime || 200,
            processingTime: data.stats?.processingTime || 250,
            tokens: data.stats?.tokens || 35
          }
        };
        
        // Add AI response to messages
        setMessages(prev => [...prev, aiResponseMessage]);
        
        // Wait briefly before showing the next question
        setTimeout(() => {
          const nextQuestion = form.questions[nextIndex];
          
          // Add next question message
          const questionMessage: Message = {
            id: `question-${nextQuestion.id}`,
            sender: 'agent',
            text: nextQuestion.text,
            type: 'question',
            timestamp: new Date(),
            stats: {
              latency: 50, // Simple latency as we're just displaying text
              processingTime: 100,
              tokens: Math.floor(nextQuestion.text.length / 4)
            },
            promptSettings: {
              temperature: agentSettings.temperature,
              maxTokens: agentSettings.maxTokens,
              voice: agentSettings.voice,
              speed: agentSettings.speed
            },
            originalPrompt: `Ask the user the following question: "${nextQuestion.text}". Wait for their response before proceeding.`,
            context: agentSettings.includeFormContext ? `Question Type: ${nextQuestion.type}\nRequired: ${nextQuestion.required ? 'Yes' : 'No'}\nOrder: ${nextQuestion.order}` : undefined
          };
          
          setMessages(prev => [...prev, questionMessage]);
          setCurrentQuestionIndex(nextIndex);
        }, 1500);
      } else {
        // Form is completed
        // First show the AI's response to the last answer
        const aiResponseMessage: Message = {
          id: `ai-response-${Date.now()}`,
          sender: 'agent',
          text: data.message,
          type: 'response',
          timestamp: new Date(),
          stats: {
            latency: response.headers.get('X-Response-Time') ? parseInt(response.headers.get('X-Response-Time') || '0') : data.stats?.processingTime || 200,
            processingTime: data.stats?.processingTime || 250,
            tokens: data.stats?.tokens || 35
          }
        };
        
        // Add AI response to messages
        setMessages(prev => [...prev, aiResponseMessage]);
        
        // Then show the closing message
        setTimeout(() => {
          const closingMessage: Message = {
            id: 'closing',
            sender: 'agent',
            text: `Thank you for completing the "${form.title}" form. Your responses have been recorded.`,
            type: 'closing',
            timestamp: new Date(),
            stats: {
              latency: 50,
              processingTime: 150,
              tokens: 40
            },
            promptSettings: {
              temperature: agentSettings.temperature,
              maxTokens: agentSettings.maxTokens,
              voice: agentSettings.voice,
              speed: agentSettings.speed
            },
            originalPrompt: `Thank the user for completing the survey, inform them that their responses have been recorded, and end the conversation politely.`,
            context: agentSettings.includeFormContext ? `Form completion statistics:\nCompletion Time: ${Math.floor(Math.random() * 5) + 1} minutes\nQuestions Answered: ${form.questions.length}` : undefined
          };
          
          setMessages(prev => [...prev, closingMessage]);
          setFormCompleted(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      
      // Create an error message to show to the user
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'agent',
        text: "I'm sorry, there was an error processing your response. Please try again.",
        type: 'response',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle voice input
  const handleTranscriptionComplete = (transcriptText: string) => {
    setTranscript(transcriptText);
    setInputText(transcriptText);
  };

  // Return to forms page
  const handleBackToForms = () => {
    navigate('/forms');
  };
  
  // Update agent settings
  const updateAgentSettings = (setting: string, value: any) => {
    setAgentSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Toggle message details
  const toggleMessageDetails = (messageId: string) => {
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading form...</p>
      </div>
    );
  }

  // Render form not found
  if (!form) {
    return (
      <div className="container max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Form Not Found</h1>
        <p className="mb-6">The form you are trying to access doesn't exist or has been removed.</p>
        <Button onClick={handleBackToForms}>Back to Forms</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl mb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="outline" size="sm" onClick={handleBackToForms}>
            ← Back to Forms
          </Button>
          <h1 className="text-2xl font-bold mt-2">{form.title}</h1>
          <p className="text-muted-foreground">{form.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
            {form.status === 'active' ? 'Active' : form.status === 'draft' ? 'Draft' : 'Archived'}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Agent Settings
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6 border-dashed border-primary/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Sliders className="h-5 w-5 mr-2" />
              Voice Agent Settings
            </CardTitle>
            <CardDescription>
              Configure how the voice agent behaves during form testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="voice">
              <TabsList className="mb-4">
                <TabsTrigger value="voice">Voice & Tone</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="context">Context</TabsTrigger>
              </TabsList>
              
              <TabsContent value="voice">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="voice-select">Voice</Label>
                      <select 
                        id="voice-select"
                        className="w-full p-2 rounded-md border border-input bg-background"
                        value={agentSettings.voice}
                        onChange={(e) => updateAgentSettings('voice', e.target.value)}
                      >
                        {VOICE_OPTIONS.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="speed-slider">Speech Speed ({agentSettings.speed}x)</Label>
                      </div>
                      <Slider
                        id="speed-slider"
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={[agentSettings.speed]}
                        onValueChange={(value) => updateAgentSettings('speed', value[0])}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="temperature-slider">Temperature ({agentSettings.temperature})</Label>
                      </div>
                      <Slider
                        id="temperature-slider"
                        min={0}
                        max={1}
                        step={0.1}
                        value={[agentSettings.temperature]}
                        onValueChange={(value) => updateAgentSettings('temperature', value[0])}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lower values are more focused, higher values are more creative
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label htmlFor="tokens-slider">Max Tokens ({agentSettings.maxTokens})</Label>
                      </div>
                      <Slider
                        id="tokens-slider"
                        min={50}
                        max={500}
                        step={10}
                        value={[agentSettings.maxTokens]}
                        onValueChange={(value) => updateAgentSettings('maxTokens', value[0])}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="prompts">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="custom-prompts" 
                      checked={agentSettings.useCustomPrompts}
                      onCheckedChange={(checked) => updateAgentSettings('useCustomPrompts', checked)}
                    />
                    <Label htmlFor="custom-prompts">Use custom prompts</Label>
                  </div>
                  
                  {agentSettings.useCustomPrompts && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="opening-prompt">Opening Prompt</Label>
                        <Textarea 
                          id="opening-prompt"
                          placeholder="Enter custom opening prompt..."
                          className="mt-1"
                          value={agentSettings.customOpeningPrompt}
                          onChange={(e) => updateAgentSettings('customOpeningPrompt', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="question-prompt">Question Prompt Template</Label>
                        <Textarea 
                          id="question-prompt"
                          placeholder="Enter custom question prompt template... Use {{question}} to insert the actual question."
                          className="mt-1"
                          value={agentSettings.customQuestionPrompt}
                          onChange={(e) => updateAgentSettings('customQuestionPrompt', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="closing-prompt">Closing Prompt</Label>
                        <Textarea 
                          id="closing-prompt"
                          placeholder="Enter custom closing prompt..."
                          className="mt-1"
                          value={agentSettings.customClosingPrompt}
                          onChange={(e) => updateAgentSettings('customClosingPrompt', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="context">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-context" 
                      checked={agentSettings.includeFormContext}
                      onCheckedChange={(checked) => updateAgentSettings('includeFormContext', checked)}
                    />
                    <Label htmlFor="include-context">Include form context in prompts</Label>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>When enabled, the agent will have access to additional context about the form and questions:</p>
                    <ul className="list-disc ml-5 mt-2">
                      <li>Form type and purpose</li>
                      <li>Question type (multiple choice, text, etc.)</li>
                      <li>Whether questions are required</li>
                      <li>Question order and placement in the form</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Test Mode</CardTitle>
          <CardDescription>
            This is a test environment for your form. Try responding to questions using text or voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.sender === 'agent' ? 'items-start' : 'items-end'
                }`}
              >
                {/* Agent KPI Stats (for agent messages only) */}
                {message.sender === 'agent' && message.stats && (
                  <div className="flex space-x-4 text-xs text-muted-foreground px-2 mb-1">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Latency: {message.stats.latency}ms</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>Processing: {message.stats.processingTime}ms</span>
                    </div>
                    <div className="flex items-center">
                      <BarChart className="h-3 w-3 mr-1" />
                      <span>Tokens: {message.stats.tokens}</span>
                    </div>
                  </div>
                )}
                
                {/* Message Bubble Container */}
                <div className="flex">
                  {/* Message Content */}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === 'agent'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p>{message.text}</p>
                    {message.type === 'question' && (
                      <div className="text-xs mt-1 opacity-70">
                        Question {currentQuestionIndex + 1} of {form.questions?.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Settings/Edit chip for agent messages */}
                  {message.sender === 'agent' && (
                    <div className="ml-2 flex flex-col justify-start mt-1">
                      <Badge 
                        variant="outline" 
                        className="cursor-pointer hover:bg-secondary/60 transition-colors"
                        onClick={() => toggleMessageDetails(message.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Adjust Settings
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Expandable message details */}
                {message.sender === 'agent' && selectedMessageId === message.id && (
                  <div className="mt-2 mb-4 ml-2 max-w-[90%] bg-muted/50 rounded-md border border-border p-3 text-sm">
                    {/* Message type indicator */}
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="secondary">
                        {message.type === 'opening' ? 'Opening Activity' : 
                         message.type === 'closing' ? 'Closing Activity' : 
                         `Question #${currentQuestionIndex + 1}`}
                      </Badge>
                      
                      {/* Dynamic Variables Section */}
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground mb-1">Dynamic Variables:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.type === 'opening' && (
                            <>
                              <Badge variant="outline" className="text-xs">form.title</Badge>
                              <Badge variant="outline" className="text-xs">form.description</Badge>
                              <Badge variant="outline" className="text-xs">questions.length</Badge>
                            </>
                          )}
                          {message.type === 'question' && (
                            <>
                              <Badge variant="outline" className="text-xs">question.text</Badge>
                              <Badge variant="outline" className="text-xs">question.type</Badge>
                              {form?.questions && form.questions[currentQuestionIndex]?.options && (
                                <Badge variant="outline" className="text-xs">question.options</Badge>
                              )}
                            </>
                          )}
                          {message.type === 'closing' && (
                            <>
                              <Badge variant="outline" className="text-xs">form.title</Badge>
                              <Badge variant="outline" className="text-xs">responses.summary</Badge>
                            </>
                          )}
                          {message.type !== 'opening' && message.type !== 'question' && message.type !== 'closing' && (
                            <Badge variant="outline" className="text-xs">None</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Tabs defaultValue="prompt">
                      <TabsList className="mb-2">
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        {message.context && <TabsTrigger value="context">Context</TabsTrigger>}
                      </TabsList>
                      
                      <TabsContent value="prompt">
                        <p className="text-xs font-medium mb-1">Original Prompt:</p>
                        <div className="p-2 bg-background rounded border border-border text-xs font-mono">
                          {message.originalPrompt || "No prompt data available"}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="settings">
                        {message.promptSettings ? (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <div>
                              <p className="font-medium">Temperature:</p>
                              <p>{message.promptSettings.temperature}</p>
                            </div>
                            <div>
                              <p className="font-medium">Max Tokens:</p>
                              <p>{message.promptSettings.maxTokens}</p>
                            </div>
                            <div>
                              <p className="font-medium">Voice:</p>
                              <p>{VOICE_OPTIONS.find(v => v.id === message.promptSettings?.voice)?.name || message.promptSettings?.voice}</p>
                            </div>
                            <div>
                              <p className="font-medium">Speed:</p>
                              <p>{message.promptSettings.speed}x</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs">No settings data available</p>
                        )}
                      </TabsContent>
                      
                      {message.context && (
                        <TabsContent value="context">
                          <p className="text-xs font-medium mb-1">Context Used:</p>
                          <div className="p-2 bg-background rounded border border-border text-xs font-mono whitespace-pre-line">
                            {message.context}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {!formStarted && !formCompleted && (
            <div className="mt-6 text-center">
              <Button onClick={startForm} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Start Form
              </Button>
            </div>
          )}

          {formStarted && !formCompleted && (
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Type your response here..."
                  className="min-h-[100px] pr-12"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                <Button
                  className="absolute bottom-3 right-3 h-6 w-6 p-0"
                  onClick={handleSubmit}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {transcript && <Transcript text={transcript} isLoading={isTranscribing} />}
                </div>
                <div className="flex space-x-2 items-center">
                  <AudioVisualizer isRecording={isRecording} />
                  <VoiceRecorder
                    onTranscriptionComplete={handleTranscriptionComplete}
                    isTranscribing={isTranscribing}
                    setIsTranscribing={setIsTranscribing}
                  />
                </div>
              </div>
            </div>
          )}

          {formCompleted && (
            <div className="mt-6 text-center">
              <p className="mb-4">Thank you for completing this form.</p>
              <Button onClick={handleBackToForms} variant="outline">
                Back to Forms
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}