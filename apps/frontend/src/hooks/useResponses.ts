import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface Answer {
  id: string;
  questionText: string;
  questionType: 'rating' | 'yesno' | string;
  value: string;
  audioUrl?: string;
  duration?: string;
}

export interface Response {
  formTitle: string;
  submittedBy?: string;
  submittedAt: string;
  completionTime?: number;
  device?: string;
  ipAddress?: string;
  sentimentScore?: number;
  keyTopics?: string[];
  aiSummary?: string;
  answers?: Answer[];
  audioProgress?: number;
  audioTime?: string;
}

export function useResponses(formId: string, responseId?: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery<Response>({
    queryKey: ['response', formId, responseId],
    queryFn: () => api.getResponse(Number(responseId)),
    enabled: !!responseId
  });

  const sendEmail = async (responseId: string) => {
    // Implementation
  };

  const downloadResponse = async (responseId: string) => {
    // Implementation
  };

  const playAudio = (answerId: string, audioUrl: string) => {
    setCurrentAudioId(answerId);
    setIsPlaying(true);
  };

  return {
    response,
    isLoading,
    sendEmail,
    downloadResponse,
    playAudio,
    isPlaying,
    currentAudioId
  };
}
