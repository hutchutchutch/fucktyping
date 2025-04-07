import React, { useEffect, useRef } from 'react';

const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface DigitalRainProps {
  color?: string;
  speed?: number;
  density?: number;
  opacity?: number;
  fontSize?: number;
  className?: string;
}

export default function DigitalRain({ 
  color = '#4338ca', // default: indigo-700 color
  speed = 0.2,  // significantly reduced for slow motion effect
  density = 0.03, // reduced density for slower feel
  opacity = 0.35, // slightly increased opacity for better visibility at slow speed
  fontSize = 16,
  className = ''
}: DigitalRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Calculate columns based on fontSize
    const columns = Math.floor(canvas.width / fontSize);
    
    // Drops contains the y position of the current drops
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      // Randomize starting positions for a more natural look
      drops[i] = Math.random() * -canvas.height;
    }
    
    // Main animation loop
    const draw = () => {
      // Semi-transparent background to create trail effect
      ctx.fillStyle = `rgba(255, 255, 255, ${1 - opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set font and basic color
      ctx.font = `bold ${fontSize}px monospace`;
      
      // Loop over drops
      for (let i = 0; i < drops.length; i++) {
        // Random character to print
        const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        
        // Calculate position
        const x = i * fontSize;
        const y = drops[i];
        
        // Add gradient effect for depth - longer trails for slow motion effect
        const gradientLength = 10; // Extended trail length for slow motion effect
        
        if (y > 0) { // Only draw if visible
          // Draw leading character (brightest)
          ctx.fillStyle = color;
          ctx.fillText(char, x, y);
          
          // Draw trailing characters with fading effect
          for (let j = 1; j <= gradientLength; j++) {
            const trailY = y - j * fontSize;
            if (trailY > 0) {
              const alpha = 1 - (j / gradientLength);
              ctx.fillStyle = `${color}${Math.floor(alpha * 99).toString(16)}`;
              const trailChar = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
              ctx.fillText(trailChar, x, trailY);
            }
          }
        }
        
        // Randomly reset some drops to top with a density factor
        if (drops[i] > canvas.height && Math.random() > (1 - density)) {
          drops[i] = 0;
        }
        
        // Increment y coordinate with reduced variability for smoother slow motion
        drops[i] += fontSize * speed * (Math.random() * 0.3 + 0.7);
      }
      
      requestAnimationFrame(draw);
    };
    
    const animationId = requestAnimationFrame(draw);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [color, speed, density, opacity, fontSize]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full -z-10 ${className}`}
      style={{ mixBlendMode: 'soft-light' }}
    />
  );
}