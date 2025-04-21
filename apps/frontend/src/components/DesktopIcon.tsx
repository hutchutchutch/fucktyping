import React from 'react';
import { RetroButton } from "./RetroButton";

interface DesktopIconProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <div 
      className="flex flex-col items-center w-16 m-2 cursor-w98-arrow"
      onClick={onClick}
    >
      <img 
        src={icon} 
        alt={label} 
        className="w-16 h-16"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="text-white text-center text-xs mt-1 px-1 py-0.5 bg-[#008080] shadow-sm" style={{ 
        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.7)',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </div>
    </div>
  );
};
