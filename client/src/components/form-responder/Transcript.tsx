import { useEffect, useRef } from "react";

interface TranscriptProps {
  text: string;
}

export default function Transcript({ text }: TranscriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when transcript changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);
  
  if (!text) {
    return (
      <div className="mt-6 bg-white p-4 rounded-md border border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Transcript</h5>
        <p className="text-gray-600 text-sm italic">Recording not started yet.</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="mt-6 bg-white p-4 rounded-md border border-gray-200 max-h-36 overflow-y-auto"
    >
      <h5 className="text-sm font-medium text-gray-700 mb-2">Transcript</h5>
      <p className="text-gray-600 text-sm italic">{text}</p>
    </div>
  );
}
