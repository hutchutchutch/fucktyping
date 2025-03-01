import React, { useEffect, useState, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export default function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(15).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      // Start animated visualization for recording state
      intervalRef.current = setInterval(() => {
        setBars(prevBars => 
          prevBars.map(() => Math.random() * 0.8 + 0.2) // Values between 0.2 and 1
        );
      }, 100);
    } else {
      // Stop animation when not recording
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Set low values when not recording
      setBars(Array(15).fill(0.05));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  return (
    <div className="flex items-end h-6 space-x-[1px]">
      {bars.map((height, index) => (
        <div
          key={index}
          className={`w-[2px] rounded-t ${
            isRecording ? 'bg-purple-500' : 'bg-gray-300'
          }`}
          style={{ height: `${height * 24}px` }}
        />
      ))}
    </div>
  );
}