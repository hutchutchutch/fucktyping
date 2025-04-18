import React, { useState, useEffect } from 'react';
import { StartMenu } from './StartMenu';

interface TaskbarProps {
  activeWindows: { id: string; title: string; icon?: string; minimized: boolean }[];
  activeWindowId: string | null;
  onOpenWindow?: (id: string, title: string, icon: string, width?: number, height?: number) => void;
  onWindowButtonClick: (id: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({ 
  activeWindows, 
  activeWindowId,
  onOpenWindow, 
  onWindowButtonClick 
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  
  // Update the clock every minute
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
    };
    
    updateClock(); // Initial call
    
    const intervalId = setInterval(updateClock, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full z-50 bg-w95-0 h-10 flex items-center px-1 bevel-up shadow-inner">
      {/* Start Button */}
      <button 
        className="w98-button w98-start-button relative"
        onClick={(e) => {
          e.stopPropagation();
          setStartMenuOpen(!startMenuOpen);
        }}
      >
        <img src="/start-icon.png" alt="Start" className="w-4 h-4" />
        <span className="font-w98 text-sm">Start</span>
        
        {/* Start Menu */}
        <StartMenu 
          visible={startMenuOpen} 
          onClose={() => setStartMenuOpen(false)}
          items={[
            { 
              label: 'Get Started', 
              icon: '/start-icon.png', 
              onClick: () => {
                if (onOpenWindow) {
                  onOpenWindow('get-started', 'Get Started', '/start-icon.png');
                  setStartMenuOpen(false);
                }
              } 
            },
            { 
              label: 'Form Builder', 
              icon: '/form-icon.png', 
              onClick: () => {
                if (onOpenWindow) {
                  onOpenWindow('form-builder', 'Voice Form Agent - Survey Builder', '/form-icon.png');
                  setStartMenuOpen(false);
                }
              } 
            },
            { divider: true },
            { 
              label: 'Settings', 
              icon: '/settings-icon.png', 
              onClick: () => {
                if (onOpenWindow) {
                  onOpenWindow('settings', 'Settings', '/settings-icon.png');
                  setStartMenuOpen(false);
                }
              } 
            },
            { 
              label: 'Help', 
              icon: '/start-icon.png', 
              onClick: () => {
                if (onOpenWindow) {
                  onOpenWindow('help', 'Help', '/start-icon.png');
                  setStartMenuOpen(false);
                }
              } 
            },
            { divider: true },
            { 
              label: 'Shut Down...', 
              onClick: () => {
                console.log('Shut Down clicked');
                setStartMenuOpen(false);
              } 
            },
          ]}
        />
      </button>
      
      {/* Taskbar divider */}
      <div className="w98-taskbar-divider"></div>
      
      {/* Active windows */}
      <div className="flex-1 flex items-center gap-1 overflow-x-auto h-full py-1">
        {activeWindows.map((window) => (
          <button 
            key={window.id} 
            className={`flex items-center gap-1 px-2 h-full min-w-[120px] max-w-[160px] text-sm text-left truncate 
                        ${window.id === activeWindowId && !window.minimized ? 'bevel-down font-bold' : 'bevel-up'}`}
            onClick={() => onWindowButtonClick(window.id)}
          >
            {window.icon && <img src={window.icon} alt="" className="w-4 h-4" />}
            <span className="font-w98 truncate">{window.title}</span>
          </button>
        ))}
      </div>
      
      {/* Clock */}
      <div className="w98-taskbar-time font-w98 text-sm">
        {currentTime}
      </div>
      
      {/* Tagline tooltip */}
      <div className="absolute bottom-full right-0 mb-2 mr-2 bg-yellow-100 border border-gray-400 p-2 text-xs font-w98 hidden group-hover:block">
        Remember this pain? Click 'Start' to kill it with voice.
      </div>
    </div>
  );
};
