import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useParams } from "wouter";
import { useAudio } from "@/hooks/useAudio";
import AudioVisualizer from "./AudioVisualizer";
import Transcript from "./Transcript";
import { FormWithQuestions } from "@shared/schema";

export default function VoiceInterface() {
  const { id } = useParams<{ id: string }>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const { isRecording, transcript, startRecording, stopRecording } = useAudio();
  
  const { data: form, isLoading, error } = useQuery<FormWithQuestions>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });
  
  // Update answers array when form questions load
  useEffect(() => {
    if (form?.questions) {
      setAnswers(new Array(form.questions.length).fill(""));
    }
  }, [form]);
  
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
  
  const question = form.questions && form.questions[currentQuestion];
  const progress = form.questions ? Math.round(((currentQuestion + 1) / form.questions.length) * 100) : 0;
  
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium text-gray-900">{form.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{form.description || "Please respond to the questions using your voice"}</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">
            Question {currentQuestion + 1} of {form.questions.length}
          </h4>
          <p className="mt-1 text-gray-700">{question?.text || "No question available"}</p>
        </div>
        
        <AudioVisualizer isRecording={isRecording} />
        
        <div className="mt-6 text-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
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
            disabled={currentQuestion === form.questions.length - 1 || !transcript}
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
          <span>Question {currentQuestion + 1}/{form.questions.length}</span>
          <span>{progress}% Complete</span>
        </div>
      </div>
    </div>
  );
}
