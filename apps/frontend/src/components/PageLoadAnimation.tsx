import React, { useState, useEffect } from 'react';

interface PageLoadAnimationProps {
  onComplete: () => void;
}

export const PageLoadAnimation: React.FC<PageLoadAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);

  // Simulate progress bar loading
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const progressSteps = [25, 60, 95, 100];
    let delay = 500; // Initial delay

    progressSteps.forEach((step, index) => {
      timeouts.push(
        setTimeout(() => {
          setProgress(step);
        }, delay)
      );
      // Increase delay for subsequent steps for effect
      delay += 400 + Math.random() * 300; 
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Show text after progress bar completes
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setShowText(true);
      }, 500); // Show text 0.5s after 100%
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Trigger collapse after text is shown, then call onComplete
  useEffect(() => {
    if (showText) {
      const collapseTimer = setTimeout(() => {
        setIsCollapsing(true);
      }, 2000); // Show text for 2s before collapsing

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2000 + 600); // 2s text + 0.6s collapse animation

      return () => {
        clearTimeout(collapseTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [showText, onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black ${isCollapsing ? 'crt-collapse' : ''}`}>
      {!isCollapsing && (
        <>
          {/* Progress Bar */}
          <div className="w-64 h-6 bg-w95-0 border-2 border-t-w95-1 border-l-w95-1 border-b-white border-r-white p-0.5 mb-4">
            <div 
              className="h-full bg-w95-2 transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Loading Text */}
          <p className="font-w98 text-w95-0 text-sm mb-8">
            Loading... {progress}%
          </p>
          
          {/* Fade-in Text */}
          <p 
            className={`font-w98 text-lg text-green-400 transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}
          >
            Aren't you glad the past is the past?
          </p>
        </>
      )}
    </div>
  );
}; 