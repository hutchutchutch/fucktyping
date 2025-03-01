import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Mic, MicOff, Square, Play } from 'lucide-react';
import { transcribeAudio } from '../../services/aiService';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (value: boolean) => void;
}

export default function VoiceRecorder({ 
  onTranscriptionComplete, 
  isTranscribing,
  setIsTranscribing 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const processAudio = async () => {
    if (audioBlob) {
      try {
        setIsTranscribing(true);
        
        // In a real app, this would send the audio to the backend for processing
        // Here we use our aiService transcribeAudio function
        const transcript = await transcribeAudio(audioBlob);
        
        // Pass the transcript up to the parent component
        onTranscriptionComplete(transcript);
        
      } catch (error) {
        console.error('Error processing audio:', error);
        onTranscriptionComplete('Error transcribing audio. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    }
  };
  
  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-3">
      <Card className="p-4 bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            {audioUrl && !isRecording && (
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={playAudio}
                disabled={isPlaying || isTranscribing}
              >
                <Play className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="text-center">
            {isRecording ? (
              <div className="flex items-center gap-2 text-destructive">
                <span className="animate-pulse">●</span>
                <span>Recording - {formatTime(recordingTime)}</span>
              </div>
            ) : audioUrl ? (
              <Button 
                variant="default" 
                onClick={processAudio}
                disabled={isTranscribing}
                className="w-full"
              >
                {isTranscribing ? "Processing..." : "Transcribe Audio"}
              </Button>
            ) : (
              <span className="text-muted-foreground">Press the microphone button to start recording</span>
            )}
          </div>
        </div>
      </Card>
      
      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </div>
  );
}