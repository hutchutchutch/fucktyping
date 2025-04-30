import React, { useState } from 'react';
import { RouteComponentProps } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { RetroDesktop } from '../RetroDesktop';
import { ModernDesktop } from '../ModernDesktop';
import { 
  verticalBarVariants, 
  verticalBarTransition, 
  clipPathVariants 
} from './transitions';

interface DesktopTransitionProps extends RouteComponentProps {
  initialDesktop?: 'retro' | 'modern';
}

export const DesktopTransition: React.FC<DesktopTransitionProps> = ({ 
  initialDesktop = 'retro',
  params
}) => {
  const [currentDesktop, setCurrentDesktop] = useState<'retro' | 'modern'>(initialDesktop);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Function to transition to Modern Desktop
  const transitionToModern = () => {
    if (isTransitioning || currentDesktop === 'modern') return;
    
    setIsTransitioning(true);
    
    // After animation completes, update the current desktop
    setTimeout(() => {
      setCurrentDesktop('modern');
      setIsTransitioning(false);
    }, 800); // Match with animation duration
  };
  
  // Function to transition to Retro Desktop
  const transitionToRetro = () => {
    if (isTransitioning || currentDesktop === 'retro') return;
    
    setIsTransitioning(true);
    
    // After animation completes, update the current desktop
    setTimeout(() => {
      setCurrentDesktop('retro');
      setIsTransitioning(false);
    }, 800); // Match with animation duration
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Container for both desktops */}
      <div className="relative w-full h-full">
        {/* Retro Desktop */}
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            visibility: currentDesktop === 'retro' || isTransitioning ? 'visible' : 'hidden'
          }}
        >
          <RetroDesktop params={{}} />
        </div>
        
        {/* Modern Desktop */}
        <div 
          className="absolute inset-0 z-10"
          style={{ 
            visibility: currentDesktop === 'modern' || isTransitioning ? 'visible' : 'hidden',
            clipPath: currentDesktop === 'retro' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 0)'
          }}
        >
          <ModernDesktop params={{}} />
        </div>
        
        {/* Vertical Bar Animation */}
        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 bg-blue-500 z-20"
              variants={verticalBarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={verticalBarTransition}
              onAnimationComplete={() => {
                // Animation completed
              }}
            />
          )}
        </AnimatePresence>
        
        {/* Transition Controls */}
        <div className="absolute top-4 right-4 z-30 flex space-x-4">
          {currentDesktop === 'modern' && (
            <button 
              onClick={transitionToRetro}
              className="px-4 py-2 bg-pink-600 text-white rounded-md shadow-md hover:bg-pink-700 transition-colors"
              disabled={isTransitioning}
            >
              Switch to Retro
            </button>
          )}
          
          {currentDesktop === 'retro' && (
            <button 
              onClick={transitionToModern}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
              disabled={isTransitioning}
            >
              Switch to Modern
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopTransition;
