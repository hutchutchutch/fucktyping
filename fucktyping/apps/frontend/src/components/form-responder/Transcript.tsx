import React from 'react';
import { Loader2 } from 'lucide-react';

interface TranscriptProps {
  text: string;
  isLoading?: boolean;
}

export default function Transcript({ text, isLoading = false }: TranscriptProps) {
  return (
    <div className="min-h-[30px] flex items-center">
      {isLoading ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </div>
      ) : text ? (
        <div>{text}</div>
      ) : (
        <div className="text-muted-foreground">
          Speak or type your message...
        </div>
      )}
    </div>
  );
}