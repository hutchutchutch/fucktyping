import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AudioVisualizer from './AudioVisualizer';
import Transcript from './Transcript';
import voiceService from '@/services/voiceService';
import { Mic, MicOff, StopCircle, Play } from 'lucide-react';

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
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioData, setAudioData] = useState<number[]>([]);
  const [visualizerInterval, setVisualizerInterval] = useState<NodeJS.Timeout | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Clean up on component unmount
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
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      
      // Start the audio visualizer
      const interval = setInterval(() => {
        // Generate dummy visualization data (in a real app, this would use actual audio analysis)
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
    
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    
    if (visualizerInterval) {
      clearInterval(visualizerInterval);
      setVisualizerInterval(null);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    
    // Process the recorded audio using WebSockets for streaming transcription
    setTimeout(async () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = voiceService.createAudioBlob(audioChunksRef.current);
        
        try {
          setIsTranscribing(true);
          
          // Get base64 audio
          const base64Audio = await blobToBase64(audioBlob);
          
          // Check if WebSocket is available to stream the transcription
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          
          // Attempt real-time streaming first, if WebSocket is supported
          const ws = new WebSocket(wsUrl);
          
          ws.onopen = () => {
            console.log('WebSocket connection opened for audio streaming');
            
            // Send audio data for streaming transcription
            ws.send(JSON.stringify({
              type: 'audio',
              audioData: base64Audio,
              formId: 1, // Replace with actual form ID from props
              questionId: 1 // Replace with actual question ID from props
            }));
          };
          
          // Handle streaming transcription updates
          let finalTranscript = '';
          const timeoutId = setTimeout(async () => {
            // Fallback to REST API if WebSocket takes too long
            console.log('WebSocket taking too long, falling back to REST API');
            ws.close();
            
            // Use standard REST API as fallback
            const transcriptText = await voiceService.transcribeAudio(base64Audio);
            finalTranscript = transcriptText;
            setTranscript(transcriptText);
            onTranscriptionComplete(transcriptText);
            setIsTranscribing(false);
          }, 5000); // 5 second timeout
          
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              if (data.type === 'transcription') {
                clearTimeout(timeoutId);
                
                finalTranscript = data.text;
                setTranscript(data.text);
                onTranscriptionComplete(data.text);
                
                // Store transcription details (confidence, etc.) if available
                console.log('Transcription confidence:', data.confidence);
                console.log('Processing time:', data.processingTime);
                
                // Close WebSocket after receiving final transcription
                ws.close();
                setIsTranscribing(false);
              }
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
            }
          };
          
          ws.onerror = async (error) => {
            console.error('WebSocket error during transcription:', error);
            clearTimeout(timeoutId);
            
            // Fallback to REST API
            const transcriptText = await voiceService.transcribeAudio(base64Audio);
            finalTranscript = transcriptText;
            setTranscript(transcriptText);
            onTranscriptionComplete(transcriptText);
            setIsTranscribing(false);
          };
          
          ws.onclose = () => {
            console.log('WebSocket connection closed after transcription');
            clearTimeout(timeoutId);
            
            // Only set if we didn't get a transcript yet
            if (!finalTranscript && isTranscribing) {
              setIsTranscribing(false);
            }
          };
          
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setIsTranscribing(false);
          
          // Fallback to REST API in case of error
          try {
            const transcriptText = await voiceService.transcribeAudio(base64Audio);
            setTranscript(transcriptText);
            onTranscriptionComplete(transcriptText);
          } catch (fallbackError) {
            console.error('Fallback transcription also failed:', fallbackError);
          }
        }
      }
    }, 100);
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