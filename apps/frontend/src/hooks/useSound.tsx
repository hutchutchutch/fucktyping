import { useState, useEffect, useCallback } from 'react';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

export function useSound(url: string, options: SoundOptions = {}) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { volume = 1, loop = false, preload = true } = options;
  
  // Initialize audio
  useEffect(() => {
    const audioElement = new Audio(url);
    audioElement.volume = volume;
    audioElement.loop = loop;
    
    const handleCanPlayThrough = () => {
      setIsLoaded(true);
    };
    
    const handleError = (e: ErrorEvent) => {
      setError(new Error(`Failed to load sound: ${e.message}`));
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    audioElement.addEventListener('canplaythrough', handleCanPlayThrough);
    audioElement.addEventListener('error', handleError as EventListener);
    audioElement.addEventListener('ended', handleEnded);
    
    if (preload) {
      audioElement.load();
    }
    
    setAudio(audioElement);
    
    return () => {
      audioElement.pause();
      audioElement.removeEventListener('canplaythrough', handleCanPlayThrough);
      audioElement.removeEventListener('error', handleError as EventListener);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [url, volume, loop, preload]);
  
  // Play function
  const play = useCallback(() => {
    if (!audio) return;
    
    // Reset audio to beginning if it's already played
    if (audio.currentTime > 0) {
      audio.currentTime = 0;
    }
    
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          // Auto-play was prevented
          setError(error);
        });
    }
  }, [audio]);
  
  // Stop function
  const stop = useCallback(() => {
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, [audio]);
  
  // Pause function
  const pause = useCallback(() => {
    if (!audio) return;
    
    audio.pause();
    setIsPlaying(false);
  }, [audio]);
  
  return {
    play,
    stop,
    pause,
    isPlaying,
    isLoaded,
    error
  };
}

// Predefined Windows 98 sounds
export const useSounds = () => {
  const ding = useSound('/sounds/ding.wav');
  const error = useSound('/sounds/error.wav');
  const startup = useSound('/sounds/startup.wav');
  const shutdown = useSound('/sounds/shutdown.wav');
  const click = useSound('/sounds/click.wav');
  
  return {
    ding,
    error,
    startup,
    shutdown,
    click
  };
};
