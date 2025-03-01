import React, { useEffect, useRef } from 'react';

interface DigitalRainProps {
  color?: string;
  speed?: number;
  density?: number;
  opacity?: number;
  className?: string;
}

export default function DigitalRain({ 
  color = '#2a4365', // default: matte blue color
  speed = 1.5,
  density = 0.05,
  opacity = 0.8,
  className = ''
}: DigitalRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,./<>?';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Drops contains the y position of the current drops
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height);
    }
    
    // Main animation loop
    let frameId: number;
    const draw = () => {
      // Slightly translucent black background to create trail effect
      context.fillStyle = `rgba(255, 255, 255, ${1 - opacity})`;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set the text color
      context.fillStyle = color;
      context.font = `${fontSize}px monospace`;
      
      // Loop over drops
      for (let i = 0; i < drops.length; i++) {
        // Random character to print
        const text = characters[Math.floor(Math.random() * characters.length)];
        
        // x = i * fontSize, y = value of drops[i]
        context.fillText(text, i * fontSize, drops[i]);
        
        // Randomly reset some drops to top with a density factor
        if (drops[i] > canvas.height && Math.random() > (1 - density)) {
          drops[i] = 0;
        }
        
        // Increment y coordinate
        drops[i] += fontSize * speed * (Math.random() * 0.5 + 0.5);
      }
      
      frameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [color, speed, density, opacity]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full -z-10 ${className}`}
    />
  );
}