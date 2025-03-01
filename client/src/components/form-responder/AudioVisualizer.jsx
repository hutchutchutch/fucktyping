import { useRef, useEffect } from "react";

function AudioVisualizer({ audioData = [], isRecording = false }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Use placeholder data when there's no real audio data
  const placeholderData = [
    0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 
    0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.85, 0.8, 0.75, 
    0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25
  ];

  // Generate animated placeholder data
  const getAnimatedPlaceholderData = () => {
    return placeholderData.map(value => {
      // Add some random noise for animation
      return value + (Math.random() * 0.2 - 0.1);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const drawWaveform = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      const data = audioData.length > 0
        ? audioData
        : isRecording
          ? getAnimatedPlaceholderData()
          : placeholderData;

      const barWidth = canvasWidth / data.length;

      // Calculate centerY and scaling for the waveform
      const centerY = canvasHeight / 2;
      const scale = canvasHeight / 2;

      // Draw the waveform
      ctx.beginPath();
      
      // Set color and style for the waveform
      ctx.strokeStyle = isRecording ? "#4F46E5" : "#9CA3AF"; // Primary color or gray
      ctx.lineWidth = 2;

      // Draw the waveform line
      data.forEach((value, index) => {
        const x = index * barWidth;
        const y = centerY + value * scale * (isRecording ? 0.8 : 0.5);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      // Mirror the waveform for the bottom half
      for (let i = data.length - 1; i >= 0; i--) {
        const x = i * barWidth;
        const y = centerY - data[i] * scale * (isRecording ? 0.8 : 0.5);
        ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      
      // Fill with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      if (isRecording) {
        gradient.addColorStop(0, "rgba(79, 70, 229, 0.6)");   // Primary color with opacity
        gradient.addColorStop(0.5, "rgba(79, 70, 229, 0.3)"); // Primary color with less opacity
        gradient.addColorStop(1, "rgba(79, 70, 229, 0.6)");   // Primary color with opacity
      } else {
        gradient.addColorStop(0, "rgba(156, 163, 175, 0.3)"); // Gray with opacity
        gradient.addColorStop(0.5, "rgba(156, 163, 175, 0.1)"); // Gray with less opacity
        gradient.addColorStop(1, "rgba(156, 163, 175, 0.3)"); // Gray with opacity
      }
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.stroke();

      if (isRecording) {
        animationRef.current = requestAnimationFrame(drawWaveform);
      }
    };

    // Draw initial waveform
    drawWaveform();

    // Clean up animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioData]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        width={500}
        height={100}
      />
    </div>
  );
}

export default AudioVisualizer;
