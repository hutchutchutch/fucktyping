import React, { useState, useRef, useEffect } from 'react';
import { Bot, Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { Button } from "@ui/button";
import { Card, CardContent } from "@ui/card";
import { cn } from "@lib/utils";

interface AIChatInputProps {
  onSendMessage: (text: string) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  className?: string;
  placeholder?: string;
  expanded?: boolean;
}

export default function AIChatInput({ 
  onSendMessage, 
  onSendVoice, 
  className, 
  placeholder = "Type a message...",
  expanded = false 
}: AIChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);
  
  // Handle timer for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        
        if (onSendVoice) {
          onSendVoice(audioBlob);
        }
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  return (
    <Card className={cn("border border-indigo-100", className)}>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          {expanded && (
            <div className="flex items-center">
              <Bot className="h-4 w-4 text-indigo-500 mr-2" />
              <span className="text-sm text-indigo-800">How can I help you today?</span>
              <Sparkles className="h-3 w-3 text-yellow-500 ml-1" />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input 
                ref={inputRef}
                type="text" 
                placeholder={placeholder} 
                className="w-full h-9 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRecording}
              />
              
              {isRecording && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <div className="flex items-center">
                    <span className="animate-pulse text-red-500 mr-1">●</span>
                    <span className="text-xs font-medium text-gray-600">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 w-9 flex-shrink-0 border-gray-300",
                isRecording 
                  ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700" 
                  : "hover:bg-indigo-50 hover:text-indigo-600"
              )}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="h-9 w-9 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleSendMessage}
              disabled={!message.trim() && !audioBlob}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}