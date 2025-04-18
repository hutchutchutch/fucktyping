import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { RetroWindow } from '@/components/RetroWindow';
import { RetroButton } from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroSelect, RetroCheckbox } from '@/components/RetroInput';
import { Taskbar } from '@/components/Taskbar';
import { DesktopIcon } from '@/components/DesktopIcon';
import { ActiveDesktop, AnimatedGif } from '@/components/ActiveDesktop';
import { BSOD } from '@/components/BSOD';
import { Clippy } from '@/components/Clippy';
// import { useSounds } from '@/hooks/useSound';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
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
  // Window management
  const [windows, setWindows] = useState<Array<{
    id: string;
    title: string;
    icon: string;
    position: { x: number; y: number };
    visible: boolean;
    width?: number;
    height?: number;
  }>>([
    {
      id: 'form-builder',
      title: 'Voice Form Agent - Survey Builder',
      icon: '/form-icon.png',
      position: { x: Math.random() * 100 + 50, y: Math.random() * 50 + 50 },
      visible: true,
      width: 400,
      height: 480
    }
  ]);
  
  // Easter eggs
  const [showBSOD, setShowBSOD] = useState(false);
  const [showClippy, setShowClippy] = useState(false);
  
  // Sound effects - disabled for now
  // const sounds = useSounds();
  
  // Handle window drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    setWindows(prev => prev.map(window => {
      if (window.id === active.id) {
        return {
          ...window,
          position: {
            x: window.position.x + delta.x,
            y: window.position.y + delta.y
          }
        };
      }
      return window;
    }));
    
    // Play click sound when window is dropped - disabled for now
    // sounds.click.play();
  };
  
  // Open a new window
  const openWindow = (id: string, title: string, icon: string, width?: number, height?: number) => {
    // Check if window already exists
    const existingWindow = windows.find(w => w.id === id);
    
    if (existingWindow) {
      // Bring to front by moving to end of array
      setWindows(prev => [
        ...prev.filter(w => w.id !== id),
        { ...existingWindow, visible: true }
      ]);
    } else {
      // Create new window with random position
      setWindows(prev => [
        ...prev,
        {
          id,
          title,
          icon,
          position: { 
            x: Math.random() * 200 + 50, 
            y: Math.random() * 100 + 50 
          },
          visible: true,
          width,
          height
        }
      ]);
      
      // Play startup sound - disabled for now
      // sounds.startup.play();
    }
  };
  
  // Close a window
  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, visible: false } : window
    ));
    
    // Play shutdown sound - disabled for now
    // sounds.shutdown.play();
  };
  
  // Trigger BSOD when typing "crash" in form title
  const handleFormTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.toLowerCase() === 'crash') {
      // sounds.error.play(); // disabled for now
      setShowBSOD(true);
    }
  };
  
  // Show Clippy randomly or when clicking help
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Math.random() > 0.7) {
        setShowClippy(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Play startup sound on initial load - disabled for now
  // useEffect(() => {
  //   sounds.startup.play();
  // }, []);
  
  return (
    <div className="w98-desktop h-screen overflow-hidden relative bg-[#008080] cursor-w98-arrow">
      {/* Desktop Icons */}
      <div className="flex flex-wrap p-4">
        <DesktopIcon 
          icon="/form-icon.png" 
          label="Form Builder"
          onClick={() => openWindow('form-builder', 'Voice Form Agent - Survey Builder', '/form-icon.png', 400, 480)}
        />
        <DesktopIcon 
          icon="/settings-icon.png" 
          label="Settings"
          onClick={() => openWindow('settings', 'Settings', '/settings-icon.png', 350, 300)}
        />
        <DesktopIcon 
          icon="/start-icon.png" 
          label="Help"
          onClick={() => setShowClippy(true)}
        />
      </div>
      
      {/* Active Desktop Element */}
      <div className="absolute top-4 right-4 w-72 z-10">
        <ActiveDesktop text="Welcome to Voice Form Agent! Click 'Start' to begin your journey to a better form experience!" />
      </div>
      
      {/* Windows */}
      <DndContext onDragEnd={handleDragEnd}>
        {windows.map(window => window.visible && (
          <DraggableWindow key={window.id} id={window.id}>
            <RetroWindow 
              title={window.title}
              icon={window.icon}
              init={window.position}
              width={window.width}
              height={window.height}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => closeWindow(window.id)}
              onMaximize={() => {}}
            >
              {window.id === 'form-builder' && (
                <div className="space-y-4">
                  <RetroInput 
                    label="Form Title" 
                    placeholder="Enter form title..." 
                    onChange={handleFormTitleChange}
                  />
                  
                  <RetroTextarea 
                    label="Description" 
                    placeholder="Enter form description..." 
                    rows={4}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <RetroSelect label="Category">
                      <option>Customer Feedback</option>
                      <option>Employee Survey</option>
                      <option>Market Research</option>
                    </RetroSelect>
                    
                    <RetroSelect label="Response Type">
                      <option>Text & Voice</option>
                      <option>Text Only</option>
                      <option>Voice Only</option>
                    </RetroSelect>
                  </div>
                  
                  <div>
                    <div className="mb-1 font-w98 text-sm">Settings</div>
                    <RetroCheckbox 
                      id="anonymous" 
                      label="Allow anonymous responses" 
                    />
                    <RetroCheckbox 
                      id="voice-commands" 
                      label="Enable voice commands" 
                    />
                    <RetroCheckbox 
                      id="collect-email" 
                      label="Collect email addresses" 
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <RetroButton onClick={() => closeWindow('form-builder')}>
                      Cancel
                    </RetroButton>
                    <Link href="/signup">
                      <RetroButton variant="primary">
                        Create Form
                      </RetroButton>
                    </Link>
                  </div>
                </div>
              )}
              
              {window.id === 'settings' && (
                <div className="space-y-4">
                  <div className="font-w98 text-sm font-bold mb-2">System Settings</div>
                  
                  <RetroCheckbox 
                    id="sounds" 
                    label="Enable system sounds" 
                    defaultChecked
                  />
                  
                  <RetroCheckbox 
                    id="animations" 
                    label="Enable animations" 
                    defaultChecked
                  />
                  
                  <RetroCheckbox 
                    id="clippy" 
                    label="Show assistant" 
                    defaultChecked
                  />
                  
                  <div className="pt-4 flex justify-end">
                    <RetroButton onClick={() => closeWindow('settings')}>
                      OK
                    </RetroButton>
                  </div>
                </div>
              )}
            </RetroWindow>
          </DraggableWindow>
        ))}
      </DndContext>
      
      {/* Taskbar */}
      <Taskbar 
        activeWindows={windows.filter(w => w.visible).map(w => ({ 
          id: w.id, 
          title: w.title,
          icon: w.icon
        }))} 
        onOpenWindow={(id: string, title: string, icon: string, width?: number, height?: number) => {
          openWindow(id, title, icon, width, height);
        }}
      />
      
      {/* Easter Eggs */}
      <BSOD 
        visible={showBSOD} 
        onClose={() => setShowBSOD(false)}
        errorMessage="A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36. The current application will be terminated."
      />
      
      <Clippy 
        visible={showClippy} 
        onClose={() => setShowClippy(false)}
        message="It looks like you're trying to create a form. Would you like help with voice commands?"
      />
    </div>
  );
};

export default LandingPage;
