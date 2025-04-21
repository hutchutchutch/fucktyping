import React, { useState, useEffect } from 'react';
import { Link, RouteComponentProps } from 'wouter';
import { Card } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Checkbox } from '@ui/checkbox';
import { DndContext, useDraggable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from "framer-motion";
import { slideVariants, bounceTransition } from "./animation/transitions.ts";
import { Link as RouterLink } from "react-router-dom";

// Modern Draggable Window
interface DraggableWindowProps {
  id: string;
  children: React.ReactNode;
  zIndex: number;
  position: { x: number; y: number };
  onDragEnd: (id: string, delta: { x: number; y: number }) => void;
}

const DraggableWindow = ({ id, children, zIndex, position, onDragEnd }: DraggableWindowProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex,
    left: position.x,
    top: position.y,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    minWidth: 340,
    minHeight: 180,
    borderRadius: 16,
    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
    background: 'white',
    overflow: 'hidden',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-move select-none bg-slate-100 px-4 py-2 border-b border-slate-200 font-semibold text-slate-700 flex items-center justify-between">
        {id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// Modern Desktop Icon
const DesktopIcon = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center m-4 focus:outline-none">
    <span className="text-4xl mb-1">{icon}</span>
    <span className="text-xs text-slate-700 font-medium">{label}</span>
  </button>
);

// Modern Taskbar
const Taskbar = ({ windows, activeWindowId, onWindowClick }: { windows: { id: string; title: string; minimized: boolean }[]; activeWindowId: string | null; onWindowClick: (id: string) => void }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur border-t border-slate-200 flex px-2 py-1 z-50">
    {windows.map(w => (
      <Button
        key={w.id}
        variant={w.id === activeWindowId ? 'default' : 'outline'}
        className="mx-1"
        onClick={() => onWindowClick(w.id)}
      >
        {w.title}
      </Button>
    ))}
  </div>
);

export const ModernDesktop: React.FC<RouteComponentProps> = ({ params }) => {
  const [windows, setWindows] = useState<
    Array<{
      id: string;
      title: string;
      position: { x: number; y: number };
      visible: boolean;
      minimized: boolean;
      zIndex: number;
      width?: number;
      height?: number;
    }>
  >(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return [
      {
        id: 'form-stats',
        title: 'Form Fatigue Facts',
        position: { x: Math.max(40, w / 8), y: 120 },
        visible: true,
        minimized: false,
        zIndex: 11,
        width: 380,
        height: 300
      },
      {
        id: 'form-builder',
        title: 'Voice Form Agent - Survey Builder',
        position: { x: Math.max(40, w * 5 / 8), y: 120 },
        visible: true,
        minimized: false,
        zIndex: 12,
        width: 400,
        height: 600
      }
    ];
  });

  const activeWindowId = windows.filter(w => w.visible && !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id || null;

  const bringToFront = (id: string) => {
    setWindows(prev => {
      const highestZIndex = Math.max(...prev.map(w => w.zIndex), 10);
      return prev.map(window => window.id === id ? { ...window, zIndex: highestZIndex + 1 } : window);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
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
  };

  const openWindow = (id: string, title: string, width?: number, height?: number) => {
    const existingWindow = windows.find(w => w.id === id);
    if (existingWindow) {
      if (existingWindow.minimized) {
        setWindows(prev => prev.map(window => window.id === id ? { ...window, minimized: false } : window));
      }
      bringToFront(id);
    } else {
      const highestZIndex = Math.max(...windows.map(w => w.zIndex), 10);
      setWindows(prev => [
        ...prev,
        {
          id,
          title,
          position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
          visible: true,
          minimized: false,
          zIndex: highestZIndex + 1,
          width,
          height
        }
      ]);
    }
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(window => window.id === id ? { ...window, minimized: true } : window));
  };

  const toggleMinimize = (id: string) => {
    const window = windows.find(w => w.id === id);
    if (window) {
      if (window.minimized) {
        const highestZIndex = Math.max(...windows.map(w => w.zIndex), 10);
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: false, zIndex: highestZIndex + 1 } : w));
      } else {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: true } : w));
      }
    }
  };

  return (
    <motion.div
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={bounceTransition}
      className="relative min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 overflow-hidden"
    >
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('transitionToRetro'))}
        className="absolute top-4 right-8 z-50 text-pink-600 underline text-lg"
      >
        Go to Retro
      </button>
      {/* Top Centered H1 */}
      <h1 className="absolute left-1/2 top-8 -translate-x-1/2 text-4xl font-bold text-slate-800 drop-shadow-sm z-50 pointer-events-none select-none">
        It's time to move forward
      </h1>
      {/* Desktop Icons */}
      <div className="flex flex-wrap p-4">
        <DesktopIcon icon={<span role="img" aria-label="facts">📊</span>} label="Form Facts" onClick={() => openWindow('form-stats', 'Form Fatigue Facts', 380, 300)} />
        <DesktopIcon icon={<span role="img" aria-label="builder">📝</span>} label="Form Builder" onClick={() => openWindow('form-builder', 'Voice Form Agent - Survey Builder', 400, 480)} />
        <DesktopIcon icon={<span role="img" aria-label="settings">⚙️</span>} label="Settings" onClick={() => openWindow('settings', 'Settings', 350, 300)} />
        <DesktopIcon icon={<span role="img" aria-label="help">❓</span>} label="Help" onClick={() => openWindow('help', 'Help', 350, 300)} />
        <DesktopIcon icon={<span role="img" aria-label="paint">🎨</span>} label="Paint" onClick={() => openWindow('paint', 'Paint', 400, 400)} />
      </div>
      {/* Windows */}
      <DndContext onDragEnd={handleDragEnd}>
        {windows.map(window => (
          window.visible && !window.minimized && (
            <DraggableWindow
              key={window.id}
              id={window.id}
              zIndex={window.zIndex}
              position={window.position}
              onDragEnd={(id, delta) => {}}
            >
              {/* Window Content based on ID */}
              {window.id === 'form-stats' && (
                <div className="space-y-3 text-base text-slate-700">
                  <p>
                    <strong className="text-blue-700">Did you know?</strong> The average online form completion rate hovers around <strong className="text-red-600">only 20-30%</strong>.
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
                    <Link href="/forms">
                      <Button variant="default">
                        Let's Fix This!
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              {window.id === 'form-builder' && (
                <form className="space-y-4 h-[600px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <Input id="firstName" placeholder="Enter first name..." name="firstName" required />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <Input id="lastName" placeholder="Enter last name..." name="lastName" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <Input id="email" placeholder="Enter email..." name="email" type="email" required />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                      <Input id="phone" placeholder="Enter phone number..." name="phone" type="tel" />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                      <Input id="address" placeholder="Enter address..." name="address" />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <Textarea id="description" placeholder="Enter description..." name="description" rows={4} />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => closeWindow('form-builder')}>Cancel</Button>
                    <Button variant="default" type="submit">Submit</Button>
                  </div>
                </form>
              )}
              {window.id === 'settings' && (
                <div className="space-y-4">
                  <div className="text-base font-bold mb-2">System Settings</div>
                  <label className="flex items-center gap-2">
                    <Checkbox id="sounds" defaultChecked />
                    <span className="text-sm">Enable system sounds</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox id="animations" defaultChecked />
                    <span className="text-sm">Enable animations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox id="assistant" defaultChecked />
                    <span className="text-sm">Show assistant</span>
                  </label>
                  <div className="pt-4 flex justify-end">
                    <Button variant="default" onClick={() => closeWindow('settings')}>OK</Button>
                  </div>
                </div>
              )}
              {window.id === 'help' && (
                <div className="space-y-4 p-2">
                  <h2 className="text-lg font-bold">Voice Form Agent Help</h2>
                  <p className="text-base">
                    Welcome to Voice Form Agent! This application allows you to create interactive voice-enabled forms.
                  </p>
                  <h3 className="text-base font-bold mt-3">Getting Started</h3>
                  <ul className="list-disc pl-5 text-base">
                    <li className="mb-1">Click on the "Form Builder" icon to create a new form</li>
                    <li className="mb-1">Configure your form settings</li>
                    <li className="mb-1">Enable voice commands for hands-free operation</li>
                  </ul>
                  <div className="pt-4 flex justify-end">
                    <Button variant="default" onClick={() => closeWindow('help')}>Close</Button>
                  </div>
                </div>
              )}
              {window.id === 'paint' && (
                <div className="flex items-center justify-center h-40 text-slate-400">Paint app coming soon...</div>
              )}
            </DraggableWindow>
          )
        ))}
      </DndContext>
      {/* Taskbar */}
      <Taskbar
        windows={windows.filter(w => w.visible).map(w => ({
          id: w.id,
          title: w.title,
          minimized: w.minimized
        }))}
        activeWindowId={activeWindowId}
        onWindowClick={toggleMinimize}
      />
    </motion.div>
  );
};
