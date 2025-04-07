import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import AudioVisualizer from './AudioVisualizer';
import Transcript from './Transcript';
import voiceService from './services/voiceService';
import { Mic, MicOff, StopCircle, Play } from 'lucide-react';
import websocketService, { WebSocketService } from './services/websocketService';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcript: string) => void;
  isTranscribing: boolean;
  setIsTranscribing: (value: boolean) => void;
  formId?: number;
  questionId?: number;
}

export default function VoiceRecorder({ 
  onTranscriptionComplete,
  isTranscribing,
  setIsTranscribing,
  formId = 1,
  questionId = 1
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioData, setAudioData] = useState<number[]>([]);
  const [visualizerInterval, setVisualizerInterval] = useState<NodeJS.Timeout | null>(null);
  const [wsService] = useState(() => new WebSocketService());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptReceivedRef = useRef<boolean>(false);
  
  // Set up WebSocket handlers
  useEffect(() => {
    // Set up the WebSocket response handlers
    wsService.connect({
      onTranscription: (data: { text: string; confidence: number; processingTime: number; formId?: number; questionId?: number }) => {
        console.log('Received transcription from WebSocket:', data);
        transcriptReceivedRef.current = true;
        
        // Clear any fallback timeout
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        
        // Update transcript and notify parent
        setTranscript(data.text);
        onTranscriptionComplete(data.text);
        setIsTranscribing(false);
        
        // Log metrics
        console.log('Transcription metrics:', {
          confidence: data.confidence,
          processingTime: data.processingTime,
          formId: data.formId,
          questionId: data.questionId
        });
      },
      onError: (errorEvent: Event) => {
        console.error('WebSocket error during voice recording:', errorEvent);
        
        // Clear any fallback timeout to avoid duplication
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        
        // If we haven't received a transcript yet, fall back to REST API
        if (!transcriptReceivedRef.current && audioChunksRef.current.length > 0) {
          fallbackToRestApi();
        }
      },
      onClose: () => {
        console.log('WebSocket connection closed');
        
        // If we haven't received a transcript yet, fall back to REST API
        if (!transcriptReceivedRef.current && isTranscribing && audioChunksRef.current.length > 0) {
          fallbackToRestApi();
        }
      }
    });
    
    // Clean up on unmount
    return () => {
      wsService.disconnect();
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Clean up audio resources on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (visualizerInterval) {
        clearInterval(visualizerInterval);
      }
    };
  }, [visualizerInterval]);
  
  // Fallback to REST API if WebSocket fails
  const fallbackToRestApi = async () => {
    console.log('Falling back to REST API for transcription');
    try {
      // Get audio data
      const audioBlob = voiceService.createAudioBlob(audioChunksRef.current);
      const base64Audio = await blobToBase64(audioBlob);
      
      // Use the REST API for transcription
      const transcriptText = await voiceService.transcribeAudio(base64Audio);
      
      // Update transcript and notify parent
      setTranscript(transcriptText);
      onTranscriptionComplete(transcriptText);
      setIsTranscribing(false);
      transcriptReceivedRef.current = true;
    } catch (error) {
      console.error('REST API transcription also failed:', error);
      setIsTranscribing(false);
    }
  };
  
  const startRecording = async () => {
    try {
      // Reset transcript state
      setTranscript('');
      transcriptReceivedRef.current = false;
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // More widely supported format
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      
      // Start the audio visualizer
      const interval = setInterval(() => {
        // Generate dummy visualization data (in a real app, would use AnalyserNode)
        const dummyData = Array(30).fill(0).map(() => Math.random() * 0.7);
        setAudioData(dummyData);
      }, 100);
      
      setVisualizerInterval(interval);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !streamRef.current) return;
    
    // Stop recording
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    
    // Stop visualizer
    if (visualizerInterval) {
      clearInterval(visualizerInterval);
      setVisualizerInterval(null);
    }
    
    // Update UI state
    setIsRecording(false);
    setIsPaused(false);
    
    // Process the recorded audio
    setTimeout(async () => {
      if (audioChunksRef.current.length > 0) {
        try {
          setIsTranscribing(true);
          
          // Get base64 audio
          const audioBlob = voiceService.createAudioBlob(audioChunksRef.current);
          const base64Audio = await blobToBase64(audioBlob);
          
          // Send audio via WebSocket for transcription
          console.log('Sending audio for transcription via WebSocket');
          wsService.sendAudio(base64Audio, formId, questionId);
          
          // Set up fallback timeout in case WebSocket fails
          timeoutIdRef.current = setTimeout(() => {
            if (!transcriptReceivedRef.current) {
              console.log('WebSocket transcription taking too long, falling back to REST API');
              fallbackToRestApi();
            }
          }, 7000); // 7 second timeout
          
        } catch (error) {
          console.error('Error processing audio:', error);
          setIsTranscribing(false);
          fallbackToRestApi();
        }
      } else {
        console.warn('No audio data recorded');
        setIsTranscribing(false);
      }
    }, 200); // Give a bit more time for the final audio chunks to be added
  };
  
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    
    if (isPaused) {
      mediaRecorderRef.current.resume();
      
      // Resume the audio visualizer
      const interval = setInterval(() => {
        const dummyData = Array(30).fill(0).map(() => Math.random() * 0.7);
        setAudioData(dummyData);
      }, 100);
      
      setVisualizerInterval(interval);
    } else {
      mediaRecorderRef.current.pause();
      
      // Pause the audio visualizer
      if (visualizerInterval) {
        clearInterval(visualizerInterval);
        setVisualizerInterval(null);
      }
    }
    
    setIsPaused(!isPaused);
  };
  
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Extract the base64 data without the prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-center">
        <AudioVisualizer isRecording={isRecording} audioData={audioData} />
      </div>
      
      <div className="flex justify-center space-x-2">
        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            variant="default"
            className="w-12 h-12 rounded-full"
            disabled={isTranscribing}
          >
            <Mic className="h-6 w-6" />
          </Button>
        ) : (
          <>
            <Button 
              onClick={togglePause} 
              variant="outline"
              className="w-12 h-12 rounded-full"
            >
              {isPaused ? <Play className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            
            <Button 
              onClick={stopRecording} 
              variant="destructive"
              className="w-12 h-12 rounded-full"
            >
              <StopCircle className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      
      <div className="p-4 bg-muted/40 rounded-lg">
        <Transcript text={transcript} isLoading={isTranscribing} />
      </div>
    </div>
  );
}