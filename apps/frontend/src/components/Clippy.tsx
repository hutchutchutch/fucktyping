import React, { useState, useEffect } from 'react';
import { RetroButton } from './RetroButton';

interface ClippyProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export const Clippy: React.FC<ClippyProps> = ({ 
  visible, 
  onClose, 
  message = "It looks like you're trying to create a form. Would you like help?" 
}) => {
  const [animation, setAnimation] = useState<string>('');
  
  useEffect(() => {
    if (visible) {
      // Animate Clippy entrance
      setAnimation('animate-bounce');
      
      // Stop bouncing after 1 second
      const timer = setTimeout(() => {
        setAnimation('');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={`fixed bottom-12 right-4 w-64 bg-[#FFFFCC] border border-[#808080] shadow-md p-3 z-50 ${animation}`}
      style={{ boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)' }}
    >
      <div className="flex items-start">
        <div className="mr-3">
          <div 
            className="w-10 h-10 bg-yellow-300 border border-black flex items-center justify-center text-2xl"
            style={{ fontFamily: 'sans-serif' }}
          >
            📎
          </div>
        </div>
        <div className="flex-1">
          <div className="font-w98 text-sm mb-3">{message}</div>
          <div className="flex justify-end gap-1">
            <RetroButton 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              className="mt-0 py-0 px-2 text-xs"
            >
              Yes
            </RetroButton>
            <RetroButton 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              className="mt-0 py-0 px-2 text-xs"
            >
              No
            </RetroButton>
            <RetroButton 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              className="mt-0 py-0 px-2 text-xs"
            >
              × Close
            </RetroButton>
          </div>
        </div>
      </div>
    </div>
  );
};
