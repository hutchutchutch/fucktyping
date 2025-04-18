import React from 'react';

interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose
}) => {
  return (
    <div className="flex items-center gap-1">
      {onMinimize && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="w-5 h-5 flex items-center justify-center bevel-up hover:bevel-down active:bevel-down"
          aria-label="Minimize"
          style={{ cursor: 'pointer' }}
        >
          _
        </button>
      )}
      {onMaximize && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMaximize();
          }}
          className="w-5 h-5 flex items-center justify-center bevel-up hover:bevel-down active:bevel-down"
          aria-label="Maximize"
          style={{ cursor: 'pointer' }}
        >
          □
        </button>
      )}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-5 h-5 flex items-center justify-center bevel-up hover:bevel-down active:bevel-down cursor-pointer"
          aria-label="Close"
          style={{ cursor: 'pointer' }}
        >
          ×
        </button>
      )}
    </div>
  );
};
