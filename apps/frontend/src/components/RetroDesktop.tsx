import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { RetroWindow, Props as RetroWindowProps } from '@/components/RetroWindow';
import { RetroButton } from '@/components/RetroButton';
import { RetroInput, RetroTextarea, RetroSelect, RetroCheckbox } from '@/components/RetroInput';
import { Taskbar } from '@/components/Taskbar';
import { DesktopIcon } from '@/components/DesktopIcon';
import { BSOD } from '@/components/BSOD';
import { Clippy } from '@/components/Clippy';
// import { useSounds } from '@/hooks/useSound';
import { DndContext, useDraggable, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Draggable wrapper for RetroWindow
interface DraggableWindowProps {
  id: string;
  children: React.ReactNode;
  zIndex: number;
}

const DraggableWindow = ({ id, children, zIndex }: DraggableWindowProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });
  
  const style: React.CSSProperties = transform ? {
    transform: CSS.Translate.toString(transform),
    position: 'absolute',
    zIndex
  } : {
    position: 'absolute',
    zIndex
  };

  // Create a new React element with the listeners and attributes applied only to the title bar
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement<RetroWindowProps>(child)) {
      return React.cloneElement(child, {
        // Pass the drag handle ref to the title bar of RetroWindow
        dragHandleRef: setNodeRef,
        // Pass the listeners and attributes to be applied to the title bar
        dragHandleListeners: listeners,
        dragHandleAttributes: attributes
      });
    }
    return child;
  });

  return (
    <div style={style}>
      {childrenWithProps}
    </div>
  );
};

export const RetroDesktop = () => { // Export the desktop component
  // Window management
  const [windows, setWindows] = useState<
    Array<{
      id: string;
      title: string;
      icon: string;
      position: { x: number; y: number };
      visible: boolean;
      minimized: boolean;
      zIndex: number;
      width?: number;
      height?: number;
    }>
  >([
    {
      id: 'form-stats',
      title: 'Form Fatigue Facts',
      icon: '/chart-icon.png',
      position: { x: 100, y: 50 },
      visible: true,
      minimized: false,
      zIndex: 10,
      width: 380,
      height: 300
    }
  ]);

  // Taskbar and Start Menu
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  
  // Easter eggs
  const [showBSOD, setShowBSOD] = useState(false);
  const [showClippy, setShowClippy] = useState(false);
  
  // Sound effects - disabled for now
  // const sounds = useSounds();

  // Determine the active window ID (highest zIndex, not minimized)
  const activeWindowId = windows
    .filter(w => w.visible && !w.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null;

  // Handle bringing a window to front when clicked or its taskbar button is clicked
  const bringToFront = (id: string) => {
    setWindows(prev => {
      // Find the highest zIndex currently in use
      const highestZIndex = Math.max(...prev.map(w => w.zIndex), 10);
      
      return prev.map(window => 
        window.id === id 
          ? { ...window, zIndex: highestZIndex + 1 } 
          : window
      );
    });
  };
  
  // Handle window drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    // Bring the dragged window to front
    bringToFront(active.id as string);
    
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
      // If minimized, restore it
      if (existingWindow.minimized) {
        setWindows(prev => prev.map(window => 
          window.id === id 
            ? { ...window, minimized: false } 
            : window
        ));
      }
      
      // Bring to front
      bringToFront(id);
    } else {
      // Create new window with random position
      const highestZIndex = Math.max(...windows.map(w => w.zIndex), 10);
      
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
          minimized: false,
          zIndex: highestZIndex + 1,
          width,
          height
        }
      ]);
      
      // Play startup sound - disabled for now
      // sounds.startup.play();
    }
    
    // Close start menu if it's open
    setStartMenuOpen(false);
  };
  
  // Close a window
  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id));
    
    // Play shutdown sound - disabled for now
    // sounds.shutdown.play();
  };
  
  // Minimize a window
  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, minimized: true } : window
    ));
    
    // Play minimize sound - disabled for now
    // sounds.minimize.play();
  };
  
  // Toggle window minimized state (from taskbar)
  const toggleMinimize = (id: string) => {
    const window = windows.find(w => w.id === id);
    
    if (window) {
      if (window.minimized) {
        // Restore window and bring to front
        setWindows(prev => {
          const highestZIndex = Math.max(...prev.map(w => w.zIndex), 10);
          
          return prev.map(w => 
            w.id === id 
              ? { ...w, minimized: false, zIndex: highestZIndex + 1 } 
              : w
          );
        });
      } else {
        // Minimize window
        setWindows(prev => prev.map(w => 
          w.id === id ? { ...w, minimized: true } : w
        ));
      }
    }
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
  
  // Handle document clicks to close start menu
  useEffect(() => {
    const handleDocumentClick = () => {
      if (startMenuOpen) {
        setStartMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [startMenuOpen]);
  
  // Play startup sound on initial load - disabled for now
  // useEffect(() => {
  //   sounds.startup.play();
  // }, []);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Tab - cycle through windows
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        
        const visibleWindows = windows.filter(w => w.visible && !w.minimized);
        if (visibleWindows.length > 1) {
          // Find the window with the highest zIndex
          const highestZIndex = Math.max(...visibleWindows.map(w => w.zIndex));
          const topWindowIndex = visibleWindows.findIndex(w => w.zIndex === highestZIndex);
          
          // Bring the next window to front (cycle to the start if at the end)
          const nextWindowIndex = (topWindowIndex + 1) % visibleWindows.length;
          bringToFront(visibleWindows[nextWindowIndex].id);
        }
      }
      
      // Windows key - toggle start menu
      if (e.key === 'Meta') {
        e.preventDefault();
        setStartMenuOpen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windows]);
  
  return (
    <div className="w98-desktop h-screen overflow-hidden relative bg-[#008080] cursor-w98-arrow">
      {/* Desktop Icons */}
      <div className="flex flex-wrap p-4">
        <DesktopIcon 
          icon="/chart-icon.png"
          label="Form Facts"
          onClick={() => openWindow('form-stats', 'Form Fatigue Facts', '/chart-icon.png', 380, 300)}
        />
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
      
      {/* Windows */}
      <DndContext onDragEnd={handleDragEnd}>
        {windows.map(window => (
          window.visible && !window.minimized && (
            <DraggableWindow key={window.id} id={window.id} zIndex={window.zIndex}>
              <RetroWindow 
                title={window.title}
                icon={window.icon}
                init={window.position}
                width={window.width}
                height={window.height}
                onClose={() => closeWindow(window.id)}
                onMinimize={() => minimizeWindow(window.id)}
                onMaximize={() => {}} // Maximize function not implemented yet
              >
                {/* Window Content based on ID */}
                {window.id === 'form-stats' && (
                  <div className="space-y-3 text-sm text-black">
                    <p>
                      <strong className="text-w95-4">Did you know?</strong> The average online form completion rate hovers around <strong className="text-red-600">only 20-30%</strong>.
                    </p>
                    <p>
                      Lengthy or confusing forms are a major cause of abandonment. Users lose patience quickly!
                    </p>
                    <p>
                      Mobile users struggle even more, often abandoning forms due to poor responsive design.
                    </p>
                    <p className="pt-2">
                      Voice interaction can dramatically improve completion rates by making forms faster and more accessible.
                    </p>
                    <div className="pt-4 flex justify-center">
                      <Link href="/dashboard"> 
                        <RetroButton variant="primary">
                          Let's Fix This!
                        </RetroButton>
                      </Link>
                    </div>
                  </div>
                )}
                
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
                
                {window.id === 'notepad' && (
                  <div className="space-y-4">
                    <RetroTextarea
                      placeholder="Type your notes here..."
                      rows={12}
                    />
                    <div className="pt-2 flex justify-end gap-2">
                      <RetroButton onClick={() => closeWindow('notepad')}>
                        Close
                      </RetroButton>
                      <RetroButton variant="primary">
                        Save
                      </RetroButton>
                    </div>
                  </div>
                )}
                
                {window.id === 'help' && (
                  <div className="space-y-4 p-2">
                    <h2 className="font-w98 text-md font-bold">Voice Form Agent Help</h2>
                    <p className="font-w98 text-sm">
                      Welcome to Voice Form Agent! This application allows you to create interactive voice-enabled forms.
                    </p>
                    <h3 className="font-w98 text-sm font-bold mt-3">Getting Started</h3>
                    <ul className="list-disc pl-5 font-w98 text-sm">
                      <li className="mb-1">Click on the "Form Builder" icon to create a new form</li>
                      <li className="mb-1">Configure your form settings</li>
                      <li className="mb-1">Enable voice commands for hands-free operation</li>
                    </ul>
                    <div className="pt-4 flex justify-end">
                      <RetroButton onClick={() => closeWindow('help')}>
                        Close
                      </RetroButton>
                    </div>
                  </div>
                )}
              </RetroWindow>
            </DraggableWindow>
          )
        ))}
      </DndContext>
      
      {/* Taskbar with Start Menu and Window buttons */}
      <Taskbar 
        activeWindows={windows.filter(w => w.visible).map(w => ({ // Map to include minimized state
          id: w.id,
          title: w.title,
          icon: w.icon,
          minimized: w.minimized
        }))}
        activeWindowId={activeWindowId} // Pass the active window ID
        onOpenWindow={openWindow} 
        onWindowButtonClick={toggleMinimize} // Pass the toggleMinimize function
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