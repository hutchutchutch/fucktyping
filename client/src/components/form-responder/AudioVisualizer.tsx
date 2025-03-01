import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioData?: number[];
}

export default function AudioVisualizer({ isRecording, audioData = [] }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw audio visualizer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If not recording, draw a single centered line
    if (!isRecording || audioData.length === 0) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Set up styles for the waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6';
    
    // Start the path
    ctx.beginPath();
    
    // Calculate width between points
    const sliceWidth = canvas.width / (audioData.length - 1);
    
    // Start from the left
    let x = 0;
    
    // Draw the waveform
    audioData.forEach((amplitude, i) => {
      // Scale amplitude to fit canvas height (0.5 = center)
      const y = (1 - amplitude) * canvas.height / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Move to the next point
      x += sliceWidth;
    });
    
    // Apply the stroke
    ctx.stroke();
    
    // Optional: Add gradient background under the line
    if (isRecording) {
      // Create a gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      
      // Fill the path
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [isRecording, audioData]);
  
  return (
    <div className="h-24 w-full relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-md bg-muted/20"
        width={300} 
        height={100} 
      />
      {isRecording && (
        <div className="absolute top-3 right-3 flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse" />
          <span className="text-xs text-muted-foreground">Recording</span>
        </div>
      )}
    </div>
  );
}