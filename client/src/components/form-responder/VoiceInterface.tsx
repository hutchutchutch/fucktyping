import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "wouter";
import { useAudio } from "@/hooks/useAudio";
import AudioVisualizer from "./AudioVisualizer";
import Transcript from "./Transcript";
import { FormWithQuestions } from "@shared/schema";

interface VoiceInterfaceProps {
  question?: {
    id: string | number;
    text: string;
    type: string;
    required: boolean;
    options?: string[] | null;
  };
  onAnswer?: (answer: any) => Promise<void>;
  isLastQuestion?: boolean;
  isProcessing?: boolean;
  detectedAnswer?: any;
  standalone?: boolean;
}

export default function VoiceInterface({
  question,
  onAnswer,
  isLastQuestion = false,
  isProcessing = false,
  detectedAnswer = null,
  standalone = true
}: VoiceInterfaceProps) {
  // If used in standalone mode, we'll fetch the form and manage state ourselves
  const { id } = useParams<{ id: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get audio functionality from the hook
  const {
    isRecording,
    audioBlob,
    audioUrl,
    transcript,
    startRecording,
    stopRecording,
    resetRecording,
    togglePause,
    isPaused,
    audioData,
  } = useAudio();
  
  // Only query form data in standalone mode
  const { data: form, isLoading, error } = useQuery<FormWithQuestions>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id && standalone,
  });
  
  // Update answers array when form questions load
  useEffect(() => {
    if (standalone && form?.questions) {
      setAnswers(new Array(form.questions.length).fill(""));
    }
  }, [form, standalone]);
  
  // Reset recording when question changes
  useEffect(() => {
    resetRecording();
  }, [question?.id, currentQuestion]);
  
  // Handle start/stop recording
  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };
  
  // Navigation in standalone mode
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleNext = () => {
    if (form?.questions && currentQuestion < form.questions.length - 1) {
      // Save transcript as answer for current question
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = transcript;
      setAnswers(newAnswers);
      
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  // Submit answer when using in component mode
  const handleSubmitAnswer = async () => {
    if (!audioBlob || !transcript || !onAnswer) return;
    
    setIsSubmitting(true);
    try {
      await onAnswer({
        questionId: question?.id,
        value: detectedAnswer?.value || transcript,
        audioBlob,
        transcript
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading and error states (only for standalone mode)
  if (standalone) {
    if (isLoading) {
      return (
        <div className="p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6 mx-auto"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
        </div>
      );
    }
    
    if (error || !form) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">Error loading form: {error?.toString() || "Form not found"}</p>
        </div>
      );
    }
  }
  
  // Determine which question to show based on mode
  const activeQuestion = standalone 
    ? (form?.questions && form.questions[currentQuestion]) 
    : question;
  
  // Calculate progress (only for standalone mode)
  const progress = standalone && form?.questions 
    ? Math.round(((currentQuestion + 1) / form.questions.length) * 100) 
    : 0;
  
  // In component mode, render just the question and recording controls
  if (!standalone) {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">{activeQuestion?.text}</h3>
          {activeQuestion?.type === 'rating' && (
            <p className="text-gray-600 text-sm">
              Please rate from 1 (Very Dissatisfied) to 5 (Very Satisfied)
            </p>
          )}
        </div>
        
        {/* Audio Controls and Visualization */}
        <div className="mb-6">
          <div className="bg-gray-50 h-24 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            <AudioVisualizer 
              isRecording={isRecording} 
            />
            
            {/* Recording Status */}
            {isRecording && (
              <div className="absolute top-2 right-2 flex items-center">
                <span className="flex h-3 w-3 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm text-gray-700">Recording{isPaused ? " paused" : "..."}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              <Mic className="inline-block w-4 h-4 mr-1" /> 
              {isRecording 
                ? "Tap the microphone to stop recording" 
                : "Tap the microphone to speak"}
            </div>
            
            <div className="flex space-x-3">
              <Button
                size="icon"
                variant="outline"
                onClick={resetRecording}
                disabled={!audioBlob && !isRecording}
                className="rounded-full"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className="rounded-full"
                disabled={isProcessing || isSubmitting}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                onClick={togglePause}
                disabled={!isRecording || isProcessing}
                className="rounded-full"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Transcript */}
        {(transcript || isProcessing) && (
          <Transcript 
            text={transcript} 
          />
        )}
        
        {/* Audio Playback (if available) */}
        {audioUrl && !isRecording && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full h-10"></audio>
          </div>
        )}
        
        {/* Detected Answer Display */}
        {detectedAnswer && (
          <div className="p-6 bg-gray-50 mt-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Answer</h4>
            <div className="flex items-center space-x-2 mb-6">
              {activeQuestion?.type === 'rating' && (
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
                  {detectedAnswer.value}
                </div>
              )}
              {activeQuestion?.type === 'yes_no' && (
                <div className={`px-3 py-1 ${
                  detectedAnswer.value?.toLowerCase() === 'yes' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                } rounded-full text-sm font-medium`}>
                  {detectedAnswer.value}
                </div>
              )}
              {(activeQuestion?.type !== 'rating' && activeQuestion?.type !== 'yes_no') && (
                <div className="text-gray-700">{detectedAnswer.value}</div>
              )}
            </div>
          </div>
        )}
        
        {transcript && (
          <div className="flex justify-end mt-6">
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={isSubmitting || isProcessing}
            >
              {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Complete Form' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  // Standalone mode - render the full form UI
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-gray-900">{form?.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{form?.description || "Please respond to the questions using your voice"}</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">
            Question {currentQuestion + 1} of {form?.questions?.length}
          </h4>
          <p className="mt-1 text-gray-700">{activeQuestion?.text || "No question available"}</p>
        </div>
        
        <AudioVisualizer isRecording={isRecording} />
        
        <div className="mt-6 text-center">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white ${
              isRecording 
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500" 
                : "bg-secondary hover:bg-green-600 focus:ring-secondary"
            }`}
          >
            {isRecording ? (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Recording
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Recording
              </>
            )}
          </Button>
        </div>
        
        <Transcript text={transcript} />
        
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentQuestion === (form?.questions?.length || 0) - 1 || !transcript}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Form Progress</h5>
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Question {currentQuestion + 1}/{form?.questions?.length}</span>
          <span>{progress}% Complete</span>
        </div>
      </div>
    </div>
  );
}
