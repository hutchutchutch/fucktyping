import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAudioReturnType {
  isRecording: boolean;
  isPaused: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  transcript: string;
  audioData: number[];
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
  togglePause: () => void;
}

export function useAudio(): UseAudioReturnType {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Start the recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        // Simulate receiving a transcript after a short delay
        setTimeout(() => {
          setTranscript('This is a mock transcript for testing.');
        }, 1000);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Generate mock audio data for visualization
      const intervalId = setInterval(() => {
        if (isRecording && !isPaused) {
          const newData = Array(30).fill(0).map(() => Math.random() * 0.5);
          setAudioData(newData);
        }
      }, 100);
      
      // Store the interval ID to clear it later, but don't return anything
      // to match the Promise<void> return type
      const cleanupFunc = () => clearInterval(intervalId);
      setTimeout(cleanupFunc, 10000); // Auto cleanup after 10 seconds if not cleared
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [isRecording, isPaused]);
  
  // Stop the recording
  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, []);
  
  // Reset the recording
  const resetRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setTranscript('');
    setAudioData([]);
    chunksRef.current = [];
  }, [isRecording, stopRecording]);
  
  // Toggle paused state
  const togglePause = useCallback(() => {
    if (isRecording && mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isRecording, isPaused]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  return {
    isRecording,
    isPaused,
    audioUrl,
    audioBlob,
    transcript,
    audioData,
    startRecording,
    stopRecording,
    resetRecording,
    togglePause
  };
}