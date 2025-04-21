import React, { useState, useEffect, useRef, ComponentProps } from 'react';
import { RouteComponentProps } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { RetroDesktop } from '../RetroDesktop';
import { ModernDesktop } from '../ModernDesktop';
import { 
  verticalBarVariants, 
  verticalBarTransition, 
  clipPathVariants 
} from './transitions';

interface DesktopSwitcherProps extends RouteComponentProps {
  initialDesktop?: 'retro' | 'modern';
}

export const DesktopSwitcher: React.FC<DesktopSwitcherProps> = ({ 
  initialDesktop = 'retro',
  params
}) => {
  const [currentDesktop, setCurrentDesktop] = useState<'retro' | 'modern'>(initialDesktop);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'toModern' | 'toRetro'>('toModern');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [barColor, setBarColor] = useState('bg-blue-500');
  const loopCountRef = useRef(0);
  const maxLoops = 5;
  
  // Array of colors to cycle through for the transition bar
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  // Start the animation loop after initial render
  useEffect(() => {
    // Start with RetroDesktop visible without animation
    setCurrentDesktop('retro');
    
    // Start the animation loop after a short delay
    const timer = setTimeout(() => {
      startTransitionLoop();
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Animation duration constants
  const ANIMATION_DURATION = 2000; // ms (2 seconds)
  const PAUSE_DURATION = 3000; // ms (3 seconds)
  
  // Function to handle the transition loop
  const startTransitionLoop = () => {
    if (loopCountRef.current >= maxLoops) {
      // If we've completed all loops, finish on modern desktop
      setDirection('toModern');
      setBarColor('bg-blue-500');
      setIsTransitioning(true);
      
      // Final transition to modern desktop
      setTimeout(() => {
        setCurrentDesktop('modern');
        setIsTransitioning(false);
        setAnimationComplete(true);
      }, ANIMATION_DURATION);
      
      return;
    }
    
    // Set color for this iteration
    const colorIndex = loopCountRef.current % colors.length;
    setBarColor(colors[colorIndex]);
    
    // Start transition to modern
    setDirection('toModern');
    setIsTransitioning(true);
    
    // After first transition completes, update desktop and start next transition
    setTimeout(() => {
      // Update current desktop
      setCurrentDesktop('modern');
      
      // Short pause before next transition
      setTimeout(() => {
        // Set color for return transition
        setBarColor(colors[(colorIndex + 1) % colors.length]);
        
        // Start transition to retro
        setDirection('toRetro');
        setIsTransitioning(true);
        
        // After second transition completes, update desktop and continue loop
        setTimeout(() => {
          // Update current desktop
          setCurrentDesktop('retro');
          
          // Increment loop count
          loopCountRef.current += 1;
          
          // Short pause before next loop
          setTimeout(() => {
            startTransitionLoop();
          }, PAUSE_DURATION);
        }, ANIMATION_DURATION);
      }, PAUSE_DURATION);
    }, ANIMATION_DURATION);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Container for both desktops */}
      <div className="relative w-full h-full">
        {/* Both desktops are always rendered */}
        {/* Retro Desktop - always rendered */}
        <div className="absolute inset-0" style={{ zIndex: currentDesktop === 'retro' ? 10 : 5 }}>
          <RetroDesktop params={{}} />
        </div>
        
        {/* Modern Desktop - always rendered with clip path */}
        <div 
          className="absolute inset-0" 
          style={{ 
            zIndex: currentDesktop === 'modern' ? 10 : 5,
            clipPath: isTransitioning && direction === 'toModern'
              ? `inset(0 var(--clip-position, 100%) 0 0)`
              : currentDesktop === 'modern'
                ? 'inset(0 0 0 0)'
                : 'inset(0 100% 0 0)'
          }}
        >
          <ModernDesktop params={{}} />
        </div>
        
        {/* Vertical Bar Animation */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="absolute top-0 bottom-0 bg-black z-20"
              style={{ width: '2px', height: '100vh' }}
              variants={verticalBarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={verticalBarTransition}
              onAnimationStart={() => {
                // Initialize clip position at the start of animation
                document.documentElement.style.setProperty('--clip-position', '100%');
                
                // Add a CSS transition to the clip-path for smoother animation
                document.documentElement.style.setProperty(
                  '--clip-transition', 
                  'clip-path 2s linear'
                );
              }}
              onUpdate={(latest) => {
                // Get the x position as a number
                let xPos = 0;
                if (typeof latest.x === 'string') {
                  // Parse values like "100vw"
                  if (latest.x.includes('vw')) {
                    xPos = parseFloat(latest.x) * window.innerWidth / 100;
                  } else {
                    xPos = parseFloat(latest.x);
                  }
                } else {
                  xPos = latest.x as number;
                }
                
                // Calculate normalized progress (0 to 1)
                const screenWidth = window.innerWidth;
                const startX = -0.05 * screenWidth; // -5% of screen width
                const endX = screenWidth;           // 100% of screen width
                const range = endX - startX;
                
                // Normalize progress to 0-1 range
                let progress = Math.max(0, Math.min(1, (xPos - startX) / range));
                
                // Calculate clip position (100% to 0%)
                const clipPosition = 100 * (1 - progress);
                
                // Update CSS variable
                document.documentElement.style.setProperty('--clip-position', `${clipPosition}%`);
              }}
              onAnimationComplete={() => {
                // At the end of animation, fully reveal the new desktop
                document.documentElement.style.setProperty('--clip-position', '0%');
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Loop counter display */}
        {!animationComplete && (
          <div className="absolute top-4 left-4 z-30 bg-black/50 text-white px-3 py-1 rounded-md font-bold shadow-lg backdrop-blur-sm">
            <span className="animate-pulse">
              Transitioning: {loopCountRef.current + 1}/{maxLoops}
            </span>
          </div>
        )}
        
        {/* Final message */}
        <AnimatePresence>
          {animationComplete && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-green-500/80 text-white px-6 py-2 rounded-md font-bold shadow-lg backdrop-blur-sm"
            >
              Transition Complete!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DesktopSwitcher;
