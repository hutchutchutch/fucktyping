import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  thinking?: boolean;
}

interface AIAssistantPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistantPopup({ isOpen, onClose }: AIAssistantPopupProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Generate initial greeting message when the assistant opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: "Hi there! I'm your FormVoice assistant. How can I help you with your forms today?",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    
    // Process the message and generate a response after a short delay
    setTimeout(() => {
      // Remove thinking message
      setMessages(prev => prev.filter(msg => !msg.thinking));
      setIsThinking(false);
      
      // Sample responses for demonstration
      const responses = [
        "I can help you analyze your form results. Would you like to see your completion rates or sentiment analysis?",
        "Creating voice-enabled forms is easy! Would you like me to walk you through the process?",
        "Based on your form responses, participants seem most engaged with the multiple-choice questions. Consider adding more of those.",
        "I notice you have a few forms in your dashboard. Would you like suggestions on how to optimize them for better completion rates?",
        "Voice forms have 78% higher completion rates than text-only forms. Would you like to convert some of your existing forms to voice format?",
        "Looking at your response patterns, most users complete your forms on mobile devices. Let me suggest some mobile-friendly question types."
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="shadow-xl border-primary/20 overflow-hidden">
              <CardHeader className="p-4 border-b flex flex-row justify-between items-center space-y-0">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-assistant.png" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium flex items-center gap-1">
                      FormVoice Assistant <Sparkles className="h-3 w-3 text-yellow-500" />
                    </h3>
                    <p className="text-xs text-muted-foreground">Powered by Groq</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="p-4 flex-1 overflow-y-auto h-[350px] space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && !msg.thinking && (
                      <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
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
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              
              <CardFooter className="p-4 pt-2 border-t">
                <div className="flex w-full gap-2">
                  <Textarea
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Ask me anything about your forms..."
                    className="min-h-10 resize-none"
                    rows={2}
                    disabled={isThinking}
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="icon"
                    disabled={!message.trim() || isThinking}
                    className="h-10 w-10 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}