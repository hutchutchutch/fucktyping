import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import AudioVisualizer from './AudioVisualizer';
import { useToast } from '@/hooks/use-toast';

interface VoiceInterfaceProps {
  question?: {
    id: string | number;
    text: string;
    type: string;
    required: boolean;
    options?: string[] | null;
  };
  onAnswer?: (answer: any) => Promise<void>;
  isLastQuestion?: boolean;
  isProcessing?: boolean;
  detectedAnswer?: any;
  standalone?: boolean;
}

export default function VoiceInterface({
  question,
  onAnswer,
  isLastQuestion = false,
  isProcessing = false,
  detectedAnswer,
  standalone = false
}: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioData, setAudioData] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const visualizerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set up audio recording
  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      setAudioData([]);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Clean up
        if (visualizerRef.current) {
          clearInterval(visualizerRef.current);
          visualizerRef.current = null;
        }
        
        // For demo purposes, create simple visualization data
        setAudioData(Array(30).fill(0)); 
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Generate dummy audio data for visualization
      visualizerRef.current = setInterval(() => {
        const dummyData = Array(30).fill(0).map(() => Math.random() * 0.8);
        setAudioData(dummyData);
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // When we stop, we should have the audio blob
      // Pass it up for processing
      if (onAnswer && audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onAnswer(audioBlob);
      }
    }
  };
  
  const handleTextInputSubmit = () => {
    if (textInput.trim() && onAnswer) {
      onAnswer(textInput.trim());
      setTextInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextInputSubmit();
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (visualizerRef.current) {
        clearInterval(visualizerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1"
            disabled={isRecording || isProcessing}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleTextInputSubmit}
            disabled={!textInput.trim() || isRecording || isProcessing}
            className="self-end"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-2">
        <div className="flex-1">
          <AudioVisualizer isRecording={isRecording} audioData={audioData} />
        </div>
        
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          variant={isRecording ? "destructive" : "default"}
          className="min-w-24"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isRecording ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Record
            </>
          )}
        </Button>
        
        {isLastQuestion && standalone && (
          <Button 
            onClick={() => onAnswer && onAnswer('finish')}
            disabled={isProcessing || isRecording}
            variant="outline"
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}