import { useState, useEffect, useRef } from 'react';

// AudioContext is not available during SSR
const AudioContext = typeof window !== 'undefined' ? window.AudioContext || window.webkitAudioContext : null;

export function useAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [audioData, setAudioData] = useState([]);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    if (AudioContext && !audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported in this browser');
      }

      setError(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        
        // Start visualizing audio
        visualizeAudio();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // In a real implementation, we would send the audio to the server for transcription
        // For demo purposes, we'll simulate a transcript
        simulateTranscription();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getAudioTracks().forEach(track => track.stop());
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setAudioBlob(null);
    setAudioUrl('');
    setTranscript('');
    setAudioData([]);
    audioChunksRef.current = [];
  };

  const togglePause = () => {
    if (!isRecording || !mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      visualizeAudio();
    } else {
      mediaRecorderRef.current.pause();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    setIsPaused(!isPaused);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!isRecording || isPaused) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Convert to normalized values for visualization
      const normalizedData = Array.from(dataArray)
        .slice(0, 30) // Only use a portion of the frequencies
        .map(value => value / 255); // Normalize to 0-1
      
      setAudioData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();
  };

  // Simulate transcription for demo purposes
  const simulateTranscription = () => {
    setTimeout(() => {
      const demoTranscripts = [
        "I would rate my satisfaction as a 4 out of 5. The service was excellent but there's still room for improvement.",
        "Yes, I would definitely recommend your product to others. I've had a great experience.",
        "The mobile app is great but could be faster. Otherwise, the customer service has been excellent.",
        "I really like the new features you've added recently. They've made my experience much better.",
        "No, I haven't experienced any issues with the service over the past month."
      ];
      
      setTranscript(demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)]);
    }, 1500);
  };

  return {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    transcript,
    audioData,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    togglePause
  };
}
