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
    
    // Set dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Default radius
    const barWidth = 4;
    const barGap = 2;
    const barCount = Math.min(audioData.length, Math.floor(width / (barWidth + barGap)));
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    // If not recording and no data, show flat line
    if (!isRecording && audioData.length === 0) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Draw bars for audio data
    const drawData = audioData.length > 0 ? audioData : generateDummyData(barCount);
    
    // Animation frame for drawing
    const draw = () => {
      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(62, 152, 199, 0.8)');
      gradient.addColorStop(0.5, 'rgba(94, 114, 235, 0.8)');
      gradient.addColorStop(1, 'rgba(87, 97, 207, 0.8)');
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw each bar
      for (let i = 0; i < barCount; i++) {
        const value = drawData[i] || 0;
        const barHeight = Math.max(2, value * height * 0.8);
        const x = i * (barWidth + barGap);
        const y = (height - barHeight) / 2;
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Add glowing effect for active recording
        if (isRecording) {
          ctx.shadowColor = 'rgba(94, 114, 235, 0.5)';
          ctx.shadowBlur = 5;
        } else {
          ctx.shadowBlur = 0;
        }
      }
      
      // Add recording indicator
      if (isRecording) {
        ctx.beginPath();
        ctx.arc(width - 15, 15, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fill();
      }
    };
    
    draw();
    
    // Cleanup
    return () => {
      ctx.clearRect(0, 0, width, height);
    };
  }, [isRecording, audioData]);
  
  return (
    <div className="relative w-full h-24 mb-2">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-md"
        width={500}
        height={100}
      />
      {isRecording && (
        <div className="absolute top-2 left-3 flex items-center">
          <span className="flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Recording...
          </span>
        </div>
      )}
    </div>
  );
}

// Helper to generate dummy visualization data for UI testing
function generateDummyData(count: number): number[] {
  const data = [];
  for (let i = 0; i < count; i++) {
    // Create a sine wave pattern
    const value = 0.2 + Math.sin(i * 0.2) * 0.2 + Math.random() * 0.1;
    data.push(Math.max(0.05, Math.min(0.9, value)));
  }
  return data;
}