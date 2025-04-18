import React, { useState } from 'react';
import { Link } from 'wouter';
import { RetroWindow } from '@/components/RetroWindow';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Draggable wrapper for RetroWindow
interface DraggableWindowProps {
  id: string;
  children: React.ReactNode;
}

const DraggableWindow = ({ id, children }: DraggableWindowProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  
  const style: React.CSSProperties = transform ? {
    transform: CSS.Translate.toString(transform),
    // Using position: absolute to prevent the window from shifting the layout when dragged
    position: 'absolute',
    zIndex: 10
  } : {
    position: 'absolute',
    zIndex: 10
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};

const LandingPage = () => {
  const [windowPosition, setWindowPosition] = useState({ x: 100, y: 100 });
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setWindowPosition(prev => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y
    }));
  };
  return (
    <div className="win98-desktop h-screen overflow-hidden relative">
      {/* Main Form Window */}
      <DndContext onDragEnd={handleDragEnd}>
        <DraggableWindow id="form-window">
          <RetroWindow title="Voice Form Agent - Survey Builder" init={windowPosition}>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="font-retro-text block">Form Title</label>
            <input type="text" className="win98-input w-full" placeholder="Enter form title..." />
          </div>

          <div className="space-y-2">
            <label className="font-retro-text block">Description</label>
            <textarea className="win98-input w-full h-24" placeholder="Enter form description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-retro-text block">Category</label>
              <select className="win98-input w-full">
                <option>Customer Feedback</option>
                <option>Employee Survey</option>
                <option>Market Research</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-retro-text block">Response Type</label>
              <select className="win98-input w-full">
                <option>Text & Voice</option>
                <option>Text Only</option>
                <option>Voice Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-retro-text block">Settings</label>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Allow anonymous responses</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Enable voice commands</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Collect email addresses</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button className="win98-button">
              <span className="font-retro-text">Cancel</span>
            </button>
            <Link href="/signup">
              <button className="win98-button">
                <span className="font-retro-text">Create Form</span>
              </button>
            </Link>
          </div>
        </div>
          </RetroWindow>
        </DraggableWindow>
      </DndContext>
      <div className="win98-window max-w-2xl mx-auto mt-8" style={{ visibility: 'hidden' }}>
        <div className="win98-titlebar">
          <div className="flex items-center gap-2">
            <img src="/form-icon.png" alt="Form" className="w-4 h-4" />
            <span className="font-retro-text">Voice Form Agent - Survey Builder</span>
          </div>
          <div className="flex gap-1">
            <button className="win98-button px-2 py-0">_</button>
            <button className="win98-button px-2 py-0">□</button>
            <button className="win98-button px-2 py-0">×</button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="font-retro-text block">Form Title</label>
            <input type="text" className="win98-input w-full" placeholder="Enter form title..." />
          </div>

          <div className="space-y-2">
            <label className="font-retro-text block">Description</label>
            <textarea className="win98-input w-full h-24" placeholder="Enter form description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-retro-text block">Category</label>
              <select className="win98-input w-full">
                <option>Customer Feedback</option>
                <option>Employee Survey</option>
                <option>Market Research</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-retro-text block">Response Type</label>
              <select className="win98-input w-full">
                <option>Text & Voice</option>
                <option>Text Only</option>
                <option>Voice Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-retro-text block">Settings</label>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Allow anonymous responses</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Enable voice commands</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="win98-checkbox" />
                <span className="font-retro-text">Collect email addresses</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button className="win98-button">
              <span className="font-retro-text">Cancel</span>
            </button>
            <Link href="/signup">
              <button className="win98-button">
                <span className="font-retro-text">Create Form</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Taskbar - fixed to bottom with z-index to ensure it's above other elements */}
      <div className="win98-taskbar z-20">
        <button className="win98-start">
          <img src="/windows-logo.png" alt="Start" className="w-6 h-6" />
          <span className="font-retro-text">Start</span>
        </button>
        <div className="border-l-2 border-[var(--win98-grey-dark)] mx-2 h-8"></div>
        <div className="win98-button flex-1 flex items-center gap-2">
          <img src="/form-icon.png" alt="Form" className="w-4 h-4" />
          <span className="font-retro-text">Voice Form Agent - Survey Builder</span>
        </div>
        <div className="flex items-center gap-2 px-2">
          <span className="font-retro-text">4:20 PM</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
