import { useState, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Request microphone permissions when component mounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      // Reset transcript when starting a new recording
      setTranscript("");
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
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
      mediaRecorder.onstop = async () => {
        // Create audio blob from collected chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // In a real app, upload this blob to the speech-to-text API
        try {
          // Simulate sending to API
          // In a real app, you would send the actual audioBlob
          const response = await apiRequest("POST", "/api/voice/transcribe", {
            audio: "base64encodedaudiodatawouldgohere",
            // For demo, include mock text so we get a response
            text: getMockTranscript()
          });
          
          const data = await response.json();
          if (data.transcript) {
            setTranscript(data.transcript);
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
          // Fallback to mock transcript if API fails
          setTranscript(getMockTranscript());
        }
        
        // Close the media stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      // If there's an error with the microphone, simulate with mock data
      setIsRecording(true);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      // If we're in a simulated recording mode, generate mock transcript
      setTranscript(getMockTranscript());
    }
    setIsRecording(false);
  };
  
  // Function to generate random mock transcripts for demo purposes
  const getMockTranscript = () => {
    const mockTranscripts = [
      "I would rate my experience as excellent. The customer service representative was very helpful and resolved my issue quickly.",
      "My experience was good overall. The product works as expected, but the setup was a bit confusing.",
      "I think your website could be improved by making the navigation simpler and adding more product details.",
      "The shipping was incredibly fast, and the packaging was excellent. Very satisfied with my purchase.",
      "I'd like to see more color options available for this product."
    ];
    
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  };
  
  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording
  };
}
