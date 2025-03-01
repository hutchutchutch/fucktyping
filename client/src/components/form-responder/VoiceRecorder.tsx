import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      // Reset audio chunks
      audioChunksRef.current = [];
      
      // Get microphone access
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
        // Get all recorded audio
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Simulate transcription process
        setIsTranscribing(true);
        
        // In a real app, you would send the audio to a transcription service
        // For this demo, we'll simulate it with a timeout
        setTimeout(() => {
          // Fake transcription result
          const fakePhrases = [
            "Yes, I'm interested in this product.",
            "No, this doesn't meet my needs right now.",
            "I would like more information before deciding.",
            "That sounds good to me.",
            "I prefer the first option you mentioned.",
            "Can you tell me more about the pricing?"
          ];
          
          const randomPhrase = fakePhrases[Math.floor(Math.random() * fakePhrases.length)];
          
          // Return the transcription
          onTranscriptionComplete(randomPhrase);
          setIsTranscribing(false);
        }, 1500);
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setIsRecording(false);
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="sm"
        onClick={toggleRecording}
        disabled={isTranscribing}
        className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
      >
        {isTranscribing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Record
          </>
        )}
      </Button>
    </div>
  );
}