import React from 'react';

interface TranscriptProps {
  text: string;
  isLoading?: boolean;
}

export default function Transcript({ text, isLoading = false }: TranscriptProps) {
  if (isLoading) {
    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-2 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-gray-300 rounded w-5/6"></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Transcribing audio...</p>
      </div>
    );
  }
  
  if (!text) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Transcript</h4>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-700 whitespace-pre-line">{text}</p>
      </div>
    </div>
  );
}