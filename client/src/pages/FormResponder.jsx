import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import VoiceInterface from '../components/form-responder/VoiceInterface';
import { apiRequest } from '../services/api';
import { useNotification } from '../components/common/Notification';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import Card from '../components/common/Card';
import { CheckCircle } from 'lucide-react';

export default function FormResponder() {
  const { id } = useParams();
  const notification = useNotification();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  
  // Fetch form data
  const { data: form, isLoading, error } = useQuery({
    queryKey: [`/api/forms/${id}`],
    queryFn: async () => {
      // In real implementation, this would call the API
      // For demo purposes, return mock data
      return {
        id: parseInt(id),
        title: "Customer Feedback Survey",
        description: "Please answer the following questions using your voice",
        allowVoice: true,
        questions: [
          {
            id: 1,
            text: "What is your overall satisfaction with our service?",
            type: "rating",
            options: ["1 - Very Dissatisfied", "2", "3", "4", "5 - Very Satisfied"],
            required: true
          },
          {
            id: 2,
            text: "Would you recommend our product to others?",
            type: "yesno",
            options: ["Yes", "No"],
            required: true
          },
          {
            id: 3,
            text: "Do you have any additional comments?",
            type: "text",
            required: false
          }
        ]
      };
    }
  });

  // Set start time when form loads
  useEffect(() => {
    if (form && !startTime) {
      setStartTime(Date.now());
    }
  }, [form]);

  // Handle simulated AI answer detection
  const [detectedAnswer, setDetectedAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processVoiceInput = async (answer) => {
    setIsProcessing(true);
    
    // Simulate API call to process voice input
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentQuestion = form.questions[currentQuestionIndex];
        let processed;
        
        if (currentQuestion.type === 'rating') {
          // Extract numbers from transcript
          const numbers = answer.transcript.match(/\d+/g);
          const rating = numbers ? numbers[0] : "4";
          processed = {
            value: rating > 5 ? "5" : rating < 1 ? "1" : rating
          };
        } else if (currentQuestion.type === 'yesno') {
          // Check for yes/no in transcript
          const isYes = /\byes\b|\byeah\b|\bsure\b|\bdefinitely\b/i.test(answer.transcript);
          const isNo = /\bno\b|\bnope\b|\bnot\b/i.test(answer.transcript);
          processed = {
            value: isYes ? "Yes" : isNo ? "No" : "Yes" // Default to Yes if unclear
          };
        } else {
          processed = {
            value: answer.transcript
          };
        }
        
        setDetectedAnswer(processed);
        setIsProcessing(false);
        resolve(processed);
      }, 1500);
    });
  };

  // Handle form submission
  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      
      // Calculate completion time
      const completionTime = Math.round((Date.now() - startTime) / 1000);
      
      // Prepare submission data
      const submission = {
        formId: form.id,
        answers: responses,
        completionTime,
        device: navigator.userAgent,
        ipAddress: "192.168.1.1" // For demo; in production would be collected server-side
      };
      
      // In real implementation, this would be an API call
      // await apiRequest('POST', '/api/responses', submission);
      
      // Simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notification.success("Form submitted successfully!");
      setIsCompleted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      notification.error("Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle answer submission and move to next question
  const handleAnswer = async (answer) => {
    try {
      // Process the voice input to detect the answer
      const processed = await processVoiceInput(answer);
      
      // Add the answer to responses
      const updatedResponses = [...responses];
      updatedResponses[currentQuestionIndex] = {
        questionId: answer.questionId,
        value: processed.value,
        audioBlob: answer.audioBlob,
        transcript: answer.transcript
      };
      setResponses(updatedResponses);
      
      // Check if this is the last question
      if (currentQuestionIndex === form.questions.length - 1) {
        await submitForm();
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setDetectedAnswer(null);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      notification.error("Failed to process your answer. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        
        <Card className="mb-8">
          <Card.Content className="p-6 border-b">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-80 mb-6" />
            
            <Skeleton className="h-24 w-full rounded-lg mb-4" />
            
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-48" />
              <div className="flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Form</h1>
          <p className="text-gray-600 mb-6">
            We couldn't load the form you requested. It might have been deleted or is temporarily unavailable.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your response to "{form.title}" has been successfully submitted.
          </p>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = form.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / form.questions.length) * 100;
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold font-sans">{form.title}</h1>
        <p className="text-gray-600">{form.description}</p>
      </div>
      
      <Card className="mb-8">
        {/* Voice Interface */}
        <Card.Content className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Question {currentQuestionIndex + 1} of {form.questions.length}</h2>
            {form.allowVoice && (
              <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm">Voice Enabled</span>
            )}
          </div>
          
          <VoiceInterface 
            question={currentQuestion}
            onAnswer={handleAnswer}
            isLastQuestion={currentQuestionIndex === form.questions.length - 1}
            isProcessing={isProcessing}
            detectedAnswer={detectedAnswer}
          />
        </Card.Content>
      </Card>
      
      {/* Form Progress */}
      <Card>
        <Card.Content className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Form Progress</h3>
            <span className="text-xs text-gray-500">{currentQuestionIndex} of {form.questions.length} completed</span>
          </div>
          
          <Progress value={progressPercentage} className="h-2.5 mb-4" />
          
          <div className="grid grid-cols-3 gap-2">
            {form.questions.map((question, index) => (
              <div key={question.id} className="text-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm mx-auto
                  ${index < currentQuestionIndex 
                    ? 'bg-primary-500 text-white' 
                    : index === currentQuestionIndex 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1 block">
                  {question.type === 'rating' && 'Rating'}
                  {question.type === 'yesno' && 'Yes/No'}
                  {question.type === 'text' && 'Comment'}
                </span>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
