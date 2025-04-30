import React, { useState, useEffect } from 'react';
import { Button } from '@ui/button';

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
      className={`fixed bottom-12 right-4 w-64 bg-white rounded-lg border border-slate-200 shadow-md p-3 z-50 ${animation}`}
    >
      <div className="flex items-start">
        <div className="mr-3">
          <div 
            className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-2xl"
          >
            💡
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm mb-3">{message}</div>
          <div className="flex justify-end gap-1">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              size="sm"
              variant="ghost"
            >
              Yes
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              size="sm"
              variant="ghost"
            >
              No
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              size="sm"
              variant="secondary"
            >
              × Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
