import React from 'react';

interface TranscriptProps {
  text: string;
}

export default function Transcript({ text }: TranscriptProps) {
  return (
    <div className="text-sm italic text-gray-500 border-l-2 border-gray-300 pl-2">
      Transcript: {text}
    </div>
  );
}