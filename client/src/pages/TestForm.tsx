import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Loader2, Mic, MicOff, Send, CornerDownLeft } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockForms } from '../services/mockData';
import { FormWithQuestions } from '@shared/schema';
import VoiceRecorder from '../components/form-responder/VoiceRecorder';
import AudioVisualizer from '../components/form-responder/AudioVisualizer';
import Transcript from '../components/form-responder/Transcript';
// TestForm will be wrapped by AppLayout through routes.jsx

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

export default function TestForm({ params }: { params?: { id: string } }) {
  // Get form ID from URL params or query parameter
  const [location, navigate] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const queryFormId = urlParams.get('formId');
  const formId = params?.id || queryFormId;
  
  // State
  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  console.log("TestForm component mounted with formId:", formId, "params:", params);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [formStarted, setFormStarted] = useState<boolean>(false);
  const [formCompleted, setFormCompleted] = useState<boolean>(false);

  // Load form data
  useEffect(() => {
    console.log("Loading form data with formId:", formId);
    console.log("Available forms:", mockForms);
    
    if (formId) {
      try {
        // Fetch form data
        const id = parseInt(formId, 10);
        console.log("Looking for form with ID:", id);
        
        // Ensure mockForms is available and has data
        if (!mockForms || mockForms.length === 0) {
          console.error("Mock forms data is empty or unavailable");
          setLoading(false);
          return;
        }
        
        const foundForm = mockForms.find(f => f.id === id);
        console.log("Found form:", foundForm);
        
        if (foundForm) {
          setForm(foundForm);
          
          // Create opening message
          const initialMessage: Message = {
            id: 'opening',
            sender: 'agent',
            text: `Welcome to the "${foundForm.title}" form. ${foundForm.description || ''} This form contains ${foundForm.questions?.length || 0} questions. Would you like to begin?`,
            type: 'opening',
            timestamp: new Date()
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
    
    // Add question message
    const questionMessage: Message = {
      id: `question-${firstQuestion.id}`,
      sender: 'agent',
      text: firstQuestion.text,
      type: 'question',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, questionMessage]);
  };

  // Handle text input submission
  const handleSubmit = () => {
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
    setInputText('');
    
    // Move to next question or end the form
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < form.questions.length) {
      // Add next question
      setTimeout(() => {
        const nextQuestion = form.questions[nextIndex];
        
        // Add question message
        const questionMessage: Message = {
          id: `question-${nextQuestion.id}`,
          sender: 'agent',
          text: nextQuestion.text,
          type: 'question',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, questionMessage]);
        setCurrentQuestionIndex(nextIndex);
      }, 1000);
    } else {
      // Form is completed
      setTimeout(() => {
        const closingMessage: Message = {
          id: 'closing',
          sender: 'agent',
          text: `Thank you for completing the "${form.title}" form. Your responses have been recorded.`,
          type: 'closing',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, closingMessage]);
        setFormCompleted(true);
      }, 1000);
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
      <div className="max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button variant="outline" size="sm" onClick={handleBackToForms}>
              ← Back to Forms
            </Button>
            <h1 className="text-2xl font-bold mt-2">{form.title}</h1>
            <p className="text-muted-foreground">{form.description}</p>
          </div>
          <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
            {form.status === 'active' ? 'Active' : form.status === 'draft' ? 'Draft' : 'Archived'}
          </Badge>
        </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Form Test Mode</CardTitle>
          <CardDescription>
            This is a test environment for your form. Try responding to questions using text or voice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'agent' ? 'justify-start' : 'justify-end'
                }`}
              >
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
              </div>
            ))}
          </div>

          {!formStarted && !formCompleted && (
            <div className="mt-6 text-center">
              <Button onClick={startForm} className="bg-gradient-to-r from-purple-600 to-indigo-600">
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
                  {transcript && <Transcript text={transcript} />}
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