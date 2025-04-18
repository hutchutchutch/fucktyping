import React, { useState, useEffect } from 'react';
import { WindowControls } from './WindowControls';

interface ActiveDesktopProps {
  text?: string;
  speed?: number; // pixels per second
  respectReducedMotion?: boolean;
}

export const ActiveDesktop: React.FC<ActiveDesktopProps> = ({ 
  text = "Welcome to Windows 98! Voice Form Agent is loading... Click 'Start' to begin your journey to a better form experience!",
  speed = 30,
  respectReducedMotion = true
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  useEffect(() => {
    if (respectReducedMotion) {
      // Check if user prefers reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      // Listen for changes
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectReducedMotion]);
  
  return (
    <div className="bg-white border-2 border-[#808080] shadow-md overflow-hidden">
      <div className="bg-[#000080] text-white px-2 py-0.5 font-w98 text-xs flex items-center justify-between">
        <span>Active Desktop Item</span>
        <WindowControls 
          onClose={() => {}} 
        />
      </div>
      {prefersReducedMotion ? (
        // Static text for users who prefer reduced motion
        <div className="font-w98 text-sm p-2 bg-white">{text}</div>
      ) : (
        // Animated marquee for everyone else
        <div className="relative overflow-hidden h-6 bg-white">
          {/* @ts-ignore - marquee is a valid HTML element but not in TypeScript's JSX types */}
          <div 
            className="font-w98 text-sm whitespace-nowrap animate-marquee p-1"
            style={{
              animation: `marquee ${text.length / (speed / 10)}s linear infinite`,
              paddingLeft: '100%'
            }}
          >
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

// Animated GIF component
export const AnimatedGif: React.FC<{ src: string; alt?: string; className?: string }> = ({ 
  src, 
  alt = "Animated GIF", 
  className = "" 
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  if (prefersReducedMotion) {
    // Show first frame or alternative for users who prefer reduced motion
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-xs text-gray-500">[Animation disabled]</span>
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${className} image-rendering-pixelated`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};
