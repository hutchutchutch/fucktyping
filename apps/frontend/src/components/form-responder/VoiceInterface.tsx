import React, { useState, useRef } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Mic, MicOff, Send, Loader2, Volume2, Pause, Play, X, CheckCircle2, ArrowRight } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { useToast } from './hooks/use-toast';

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
  const [isPaused, setIsPaused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioChunksRef.current = [];
      
      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioBlob);
        setAudioUrl(url);
        
        // Cleanup stream tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      
      // Generate dummy data for visualization
      const visualizationInterval = setInterval(() => {
        const data = Array(30).fill(0).map(() => Math.random() * 0.8 + 0.2);
        setAudioData(data);
      }, 100);
      
      // Cleanup on stop
      mediaRecorderRef.current.onstart = () => {
        // Clear previous audio
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
          setAudioUrl(null);
          setRecordedAudio(null);
        }
      };
      
      // Cleanup function
      return () => {
        clearInterval(visualizationInterval);
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions and try again.",
        variant: "destructive"
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioData([]);
    }
  };
  
  // Play recorded audio
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Pause recorded audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle audio end
  const handleAudioEnd = () => {
    setIsPlaying(false);
  };
  
  // Submit recorded audio
  const submitAudio = async () => {
    if (!recordedAudio || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (onAnswer) {
        await onAnswer(recordedAudio);
      }
      
      // Clear recording after submit
      if (!standalone) {
        setRecordedAudio(null);
        setAudioUrl(null);
      }
    } catch (error) {
      console.error('Error submitting audio:', error);
      toast({
        title: "Submission Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit text response
  const submitText = async () => {
    if (!textInput.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (onAnswer) {
        await onAnswer(textInput);
      }
      
      // Clear text after submit
      if (!standalone) {
        setTextInput('');
      }
    } catch (error) {
      console.error('Error submitting text:', error);
      toast({
        title: "Submission Error",
        description: "Failed to process text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle between voice and text input
  const toggleInputMode = () => {
    if (isRecording) {
      stopRecording();
    }
    setIsTyping(!isTyping);
  };
  
  // Cancel recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      setIsRecording(false);
      setIsPaused(false);
      setAudioData([]);
    }
  };
  
  return (
    <div className="relative">
      {/* Audio element for playback */}
      <audio 
        ref={audioRef} 
        src={audioUrl || ''} 
        onEnded={handleAudioEnd}
        className="hidden"
      />
      
      {/* Audio visualizer */}
      <AudioVisualizer isRecording={isRecording} audioData={audioData} />
      
      {/* Input interface */}
      <Card className="overflow-hidden">
        <CardContent className="p-3">
          {isTyping ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isSubmitting || isProcessing}
                placeholder="Type your response..."
                className="flex-1 min-h-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitText();
                  }
                }}
              />
              <Button 
                onClick={submitText} 
                disabled={isSubmitting || !textInput.trim() || isProcessing}
                size="icon"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={toggleInputMode}
                variant="outline"
                size="icon"
                disabled={isSubmitting || isProcessing}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-between gap-2">
              {!recordedAudio ? (
                // Recording controls
                <>
                  <Button
                    variant={isRecording ? "destructive" : "default"}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSubmitting || isProcessing}
                    className="flex-1"
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="mr-2 h-4 w-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                  {isRecording && (
                    <Button
                      variant="outline"
                      onClick={cancelRecording}
                      disabled={isSubmitting || isProcessing}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={toggleInputMode}
                    disabled={isSubmitting || isProcessing || isRecording}
                  >
                    Type Instead
                  </Button>
                </>
              ) : (
                // Playback controls
                <>
                  <Button
                    variant="outline"
                    onClick={isPlaying ? pauseAudio : playAudio}
                    disabled={isSubmitting || isProcessing}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRecordedAudio(null);
                      setAudioUrl(null);
                    }}
                    disabled={isSubmitting || isProcessing}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Discard
                  </Button>
                  <Button
                    onClick={submitAudio}
                    disabled={isSubmitting || isProcessing}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isLastQuestion ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Next
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={toggleInputMode}
                    disabled={isSubmitting || isProcessing}
                  >
                    Type Instead
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-md backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}