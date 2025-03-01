import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioData?: number[];
}

export default function AudioVisualizer({ isRecording, audioData }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mock data for when real audio data isn't provided
  const mockVisualizationData = () => {
    return Array(30).fill(0).map(() => Math.random() * 0.5);
  };
  
  // Draw the visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Return early if not recording
    if (!isRecording) {
      // Draw a flat line in the middle
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }
    
    // Use provided data or generate mock data
    const data = audioData || mockVisualizationData();
    const barWidth = canvas.width / data.length;
    const baseLineY = canvas.height / 2;
    
    ctx.fillStyle = '#4f46e5'; // Indigo color
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    
    // Draw the visualization as bars
    for (let i = 0; i < data.length; i++) {
      const barHeight = data[i] * canvas.height;
      const x = i * barWidth;
      
      // Draw bar from center (representing audio waveform)
      ctx.fillRect(x, baseLineY - barHeight / 2, barWidth - 1, barHeight);
    }
    
    // Request animation frame for continuous updates if recording
    if (isRecording) {
      requestAnimationFrame(() => {
        const randomData = mockVisualizationData();
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = canvas.width / randomData.length;
        const baseLineY = canvas.height / 2;
        
        ctx.fillStyle = '#4f46e5';
        
        // Draw the visualization as bars
        for (let i = 0; i < randomData.length; i++) {
          const barHeight = randomData[i] * canvas.height;
          const x = i * barWidth;
          
          // Draw bar from center
          ctx.fillRect(x, baseLineY - barHeight / 2, barWidth - 1, barHeight);
        }
      });
    }
  }, [isRecording, audioData]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={100} 
        className="w-full h-full"
      />
    </div>
  );
}