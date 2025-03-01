import React, { useRef, useEffect } from 'react';

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

    // Set colors based on recording state
    const barColor = isRecording 
      ? 'rgba(239, 68, 68, 0.9)' // Red when recording
      : 'rgba(99, 102, 241, 0.8)'; // Blue when not recording

    const bgColor = isRecording
      ? 'rgba(254, 202, 202, 0.1)' // Light red background
      : 'rgba(224, 231, 255, 0.1)'; // Light blue background

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (audioData.length === 0) {
      // Draw a flat line when no data
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.strokeStyle = barColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    // Draw bars
    const barWidth = canvas.width / audioData.length - 2;
    const barMaxHeight = canvas.height - 10;

    ctx.fillStyle = barColor;
    
    audioData.forEach((value, index) => {
      // Calculate bar height based on audio data value (0-1)
      const barHeight = Math.max(4, value * barMaxHeight);
      
      // Center the bars vertically
      const x = index * (barWidth + 2);
      const y = (canvas.height - barHeight) / 2;
      
      // Draw rounded bars
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 2);
      ctx.fill();
    });

    // Add a pulsing effect when recording
    if (isRecording) {
      const pulseSize = 6 + (Math.sin(Date.now() / 200) + 1) * 3;
      
      ctx.beginPath();
      ctx.arc(20, 20, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.fill();
    }
  }, [isRecording, audioData]);

  return (
    <div className="w-full h-16 rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={300}
        height={64}
      />
    </div>
  );
}