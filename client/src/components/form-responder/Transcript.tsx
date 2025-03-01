import React from 'react';
import { Loader2 } from 'lucide-react';

interface TranscriptProps {
  text: string;
  isLoading?: boolean;
}

export default function Transcript({ text, isLoading = false }: TranscriptProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
        <span className="text-sm text-muted-foreground">Transcribing audio...</span>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Speak into the microphone and your words will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h3 className="text-sm font-semibold mb-2">Transcript:</h3>
      <p className="text-md">{text}</p>
    </div>
  );
}