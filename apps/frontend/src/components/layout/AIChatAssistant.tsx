import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2, Play } from 'lucide-react';
import { Button } from '@ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { Badge } from '@ui/badge';
import { Textarea } from '@ui/textarea';
import { useToast } from '@hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  thinking?: boolean;
}

interface AIChatAssistantProps {
  onStartTour?: () => void;
}

export default function AIChatAssistant({ onStartTour }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Simulate initial greeting message after 3 seconds on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length === 0) {
        const greeting: Message = {
          id: Date.now().toString(),
          sender: 'assistant',
          text: "👋 Hi there! I'm your FormVoice AI assistant. I can help you analyze form results, suggest questions, and optimize your forms. Would you like a quick tour of the platform?",
          timestamp: new Date()
        };
        setMessages([greeting]);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsThinking(true);
    
    // Simulate AI thinking
    const thinkingMessage: Message = {
      id: `thinking-${Date.now()}`,
      sender: 'assistant',
      text: '...',
      timestamp: new Date(),
      thinking: true
    };
    
    setMessages(prev => [...prev, thinkingMessage]);
    
    // Process the message and generate a response
    setTimeout(() => {
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.thinking));
      setIsThinking(false);
      
      // Handle special commands
      if (message.toLowerCase().includes('tour') || 
          message.toLowerCase().includes('help') || 
          message.toLowerCase().includes('guide')) {
        handleTourRequest();
        return;
      }
      
      // Add AI response
      const responses = [
        "I can help you analyze your form results. Would you like to see completion rates or sentiment analysis?",
        "Based on your form responses, your participants are most engaged with the multiple-choice questions. Consider adding more of those.",
        "Your form's completion rate is 78%, which is better than the average of 65%. Great job!",
        "I noticed your form has mostly text questions. Would you like me to suggest some multiple-choice questions to improve completion rates?",
        "Looking at your response data, I recommend adding a rating question to get more quantifiable feedback.",
        "Your voice forms are performing exceptionally well with an 87% completion rate. Would you like to convert more of your forms to voice format?"
      ];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };
  
  const handleTourRequest = () => {
    // Remove thinking message
    setMessages(prev => prev.filter(msg => !msg.thinking));
    setIsThinking(false);
    
    // Add AI response about starting the tour
    const aiMessage: Message = {
      id: Date.now().toString(),
      sender: 'assistant',
      text: "I'd be happy to give you a tour of FormVoice! I'll show you how to create forms, categorize them, and analyze results. Ready to start?",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Simulate user clicking "Yes" after 2 seconds
    setTimeout(() => {
      if (onStartTour) {
        onStartTour();
        
        // Minimize chat during tour
        setIsMinimized(true);
        
        toast({
          title: "Tour Started",
          description: "Follow along as I guide you through FormVoice's features!",
        });
      }
    }, 2000);
  };
  
  const startTour = () => {
    if (onStartTour) {
      // Add message from user
      const userMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: "Yes, I'd like a tour please.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process like a normal message would
      setIsThinking(true);
      
      // Handle tour request after brief delay
      setTimeout(() => {
        handleTourRequest();
      }, 1000);
    }
  };

  return (
    <>
      {/* Chat button */}
      <div 
        className={`fixed right-6 bottom-6 z-40 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Button 
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg ai-assistant-trigger"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed right-6 bottom-6 z-40"
          >
            <Card className={`w-80 md:w-96 shadow-xl border-primary/20 transition-all duration-300 ${isMinimized ? 'h-20' : 'h-[500px]'}`}>
              <CardHeader className="p-4 border-b flex flex-row justify-between items-center space-y-0 gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-assistant.png" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">FormVoice Assistant</h3>
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Online
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8">
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {!isMinimized && (
                <>
                  <CardContent className="p-4 flex-1 overflow-y-auto h-[380px] space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.sender === 'user' 
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          } ${msg.thinking ? 'thinking-animation' : ''}`}
                        >
                          {msg.thinking ? (
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                    
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Bot className="h-12 w-12 mb-4 text-primary/30" />
                        <h3 className="text-lg font-medium mb-2">FormVoice Assistant</h3>
                        <p className="text-sm mb-4">I can help you create better forms and analyze responses.</p>
                        <Button onClick={startTour} variant="outline" size="sm" className="gap-2">
                          <Play className="h-4 w-4" />
                          Start Product Tour
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-2 border-t">
                    <div className="flex w-full gap-2">
                      <Textarea
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Ask me anything about your forms..."
                        className="min-h-10 flex-1 resize-none"
                        disabled={isThinking}
                      />
                      <Button 
                        onClick={sendMessage} 
                        size="icon"
                        disabled={!message.trim() || isThinking}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}