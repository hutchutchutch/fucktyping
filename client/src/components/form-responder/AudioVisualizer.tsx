import { useEffect, useRef, useState } from "react";
import "./AudioVisualizer.css";

interface AudioVisualizerProps {
  isRecording: boolean;
}

export default function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const waveRef = useRef<HTMLDivElement>(null);
  const [bars] = useState(8); // Number of bars in the visualizer
  
  useEffect(() => {
    if (!waveRef.current) return;
    
    const waveContainer = waveRef.current;
    const waveBars = Array.from(waveContainer.children) as HTMLElement[];
    
    if (isRecording) {
      // Ensure animation is running
      waveBars.forEach(bar => {
        bar.style.animationPlayState = 'running';
      });
    } else {
      // Pause animation
      waveBars.forEach(bar => {
        bar.style.animationPlayState = 'paused';
      });
    }
  }, [isRecording]);
  
  return (
    <div className="mt-6 text-center">
      <div className="wave mb-4 mx-auto" ref={waveRef}>
        {Array.from({ length: bars }).map((_, index) => (
          <div key={index} className="wave-bar" style={{ 
            animationDelay: `${index * 0.1}s`, 
            animationPlayState: isRecording ? 'running' : 'paused' 
          }}></div>
        ))}
      </div>
    </div>
  );
}
