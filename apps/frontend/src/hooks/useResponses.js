import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '@services/api';
import { useNotification } from '@components/common/Notification';

export function useResponses(formId, responseId) {
  const [responses, setResponses] = useState([]);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioTime, setAudioTime] = useState('0:00');
  const audioRef = useRef(null);
  const notification = useNotification();

  // Fetch responses for a specific form
  const fetchResponses = async (formId) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would fetch from the API
      // const response = await apiRequest('GET', `/api/forms/${formId}/responses`);
      // const data = await response.json();
      
      // For demo purposes, use mock data
      const mockResponses = [
        {
          id: 1,
          formId: 1,
          submittedAt: '2023-05-15T15:42:00Z',
          submittedBy: 'Anonymous User',
          completionTime: 105, // seconds
          device: 'iPhone 13 (iOS 16.2)',
          ipAddress: '192.168.1.xxx',
          sentimentScore: 75,
          keyTopics: ['Customer Service', 'Mobile App', 'Performance'],
          answers: [
            {
              id: 1,
              questionId: 1,
              questionText: 'What is your overall satisfaction with our service?',
              questionType: 'rating',
              value: '4',
              transcription: 'I would rate my satisfaction as a 4 out of 5. The service was excellent but there\'s still room for improvement.',
              audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3',
              duration: '0:12'
            },
            {
              id: 2,
              questionId: 2,
              questionText: 'Would you recommend our product to others?',
              questionType: 'yesno',
              value: 'Yes',
              transcription: 'Yes, I would definitely recommend your product to others.',
              audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-2.mp3',
              duration: '0:05'
            },
            {
              id: 3,
              questionId: 3,
              questionText: 'Do you have any additional comments?',
              questionType: 'text',
              value: 'I\'ve been using your service for about 3 months now and am generally very satisfied. The customer support team has been especially helpful. One area for improvement would be the mobile app - it can be a bit slow at times.',
              transcription: 'I\'ve been using your service for about 3 months now and am generally very satisfied. The customer support team has been especially helpful. One area for improvement would be the mobile app - it can be a bit slow at times.',
              audioUrl: 'https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-3.mp3',
              duration: '0:28'
            }
          ]
        }
      ];
      
      // Only return responses for the specified form
      const formResponses = mockResponses.filter(r => r.formId.toString() === formId.toString());
      setResponses(formResponses);
      
      // If we also have a specific responseId, set that response
      if (responseId) {
        const specificResponse = formResponses.find(r => r.id.toString() === responseId.toString());
        if (specificResponse) {
          specificResponse.formTitle = 'Customer Feedback Survey'; // Add form title for display
          setResponse(specificResponse);
        }
      }
    } catch (error) {
      console.error('Error fetching responses:', error);
      notification.error('Failed to load responses');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single response
  const fetchResponse = async (responseId) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would fetch from the API
      // const response = await apiRequest('GET', `/api/responses/${responseId}`);
      // const data = await response.json();
      
      // For demo purposes, this is handled in fetchResponses
    } catch (error) {
      console.error('Error fetching response:', error);
      notification.error('Failed to load response details');
    } finally {
      setIsLoading(false);
    }
  };

  // Play audio recording
  const playAudio = (answerId, audioUrl) => {
    // If already playing the same audio, pause it
    if (isPlaying && currentAudioId === answerId) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    
    // If switching to a new audio, reset progress and create new audio
    setCurrentAudioId(answerId);
    setAudioProgress(0);
    setAudioTime('0:00');
    
    // Create new audio element
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('timeupdate', () => {
      const progress = audio.currentTime / audio.duration;
      setAudioProgress(progress);
      
      // Format time display
      const minutes = Math.floor(audio.currentTime / 60);
      const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
      setAudioTime(`${minutes}:${seconds}`);
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioTime('0:00');
    });
    
    // Play the audio
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(error => {
      console.error('Error playing audio:', error);
      notification.error('Failed to play audio');
    });
  };

  // Send email with response
  const sendEmail = async (responseId) => {
    try {
      // In a real implementation, we would call the API
      // await apiRequest('POST', `/api/responses/${responseId}/email`);
      
      // For demo purposes
      notification.success('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      notification.error('Failed to send email');
    }
  };

  // Download response as CSV or PDF
  const downloadResponse = async (responseId) => {
    try {
      // In a real implementation, we would call the API and download the file
      // const response = await apiRequest('GET', `/api/responses/${responseId}/download`);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `response-${responseId}.pdf`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      
      // For demo purposes
      notification.success('Response downloaded successfully');
    } catch (error) {
      console.error('Error downloading response:', error);
      notification.error('Failed to download response');
    }
  };

  // Clean up any playing audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Load responses when formId changes
  useEffect(() => {
    if (formId) {
      fetchResponses(formId);
    }
  }, [formId, responseId]);

  return {
    responses,
    response,
    isLoading,
    isPlaying,
    currentAudioId,
    audioProgress,
    audioTime,
    fetchResponses,
    fetchResponse,
    playAudio,
    sendEmail,
    downloadResponse
  };
}
