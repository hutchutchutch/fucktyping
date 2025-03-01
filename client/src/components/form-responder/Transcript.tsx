import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TranscriptProps {
  text: string;
  isLoading?: boolean;
}

export default function Transcript({ text, isLoading = false }: TranscriptProps) {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-md bg-muted/50 relative overflow-hidden">
        <div className="animate-pulse space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="absolute top-1 right-2">
          <div className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Processing...
          </div>
        </div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="p-4 border rounded-md bg-muted/30 text-muted-foreground text-center italic">
        {isLoading ? "Transcribing..." : "No transcript yet. Speak or type your response."}
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-muted/20 relative">
      <p className="text-sm leading-relaxed">{text}</p>
      <div className="absolute top-1 right-2">
        <div className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Transcribed
        </div>
      </div>
    </div>
  );
}