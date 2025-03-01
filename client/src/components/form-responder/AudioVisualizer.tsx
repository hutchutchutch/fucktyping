import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioData?: number[];
}

export default function AudioVisualizer({ isRecording, audioData = [] }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If not recording or no data, draw a flat line
    if (!isRecording || audioData.length === 0) {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      return;
    }

    // Draw visualization
    const barWidth = canvas.width / audioData.length;
    const barHeightScale = canvas.height / 2;
    
    ctx.fillStyle = isRecording ? '#ef4444' : '#3b82f6'; // Red when recording, blue otherwise
    
    for (let i = 0; i < audioData.length; i++) {
      const barHeight = audioData[i] * barHeightScale;
      const x = i * barWidth;
      const y = canvas.height / 2 - barHeight / 2;
      
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [isRecording, audioData]);

  // Generate dummy audio data for visualization
  useEffect(() => {
    if (!isRecording || audioData.length > 0) return;
    
    const interval = setInterval(() => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      
      // Generate dummy data
      const dummyData = Array.from({ length: 20 }, () => Math.random() * 0.5 + 0.1);
      
      // Draw dummy data
      const canvas = canvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / dummyData.length;
      const barHeightScale = canvas.height / 2;
      
      ctx.fillStyle = '#ef4444'; // Red for recording
      
      for (let i = 0; i < dummyData.length; i++) {
        const barHeight = dummyData[i] * barHeightScale;
        const x = i * barWidth;
        const y = canvas.height / 2 - barHeight / 2;
        
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      }
    }, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, [isRecording, audioData]);

  return (
    <div className="flex items-center h-full w-full">
      {isRecording ? (
        <div className="flex-1 h-10">
          <canvas 
            ref={canvasRef}
            width={300}
            height={40}
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="text-muted-foreground">
          Ready to record...
        </div>
      )}
    </div>
  );
}