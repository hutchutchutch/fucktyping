import React, { useState } from 'react';
import VoiceInterface from '../components/form-responder/VoiceInterface';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Mic, MessageSquare } from 'lucide-react';

// Sample questions for testing
const sampleQuestions = [
  {
    id: 1,
    text: "How would you rate your experience with voice interfaces?",
    type: "rating",
    required: true,
    options: null
  },
  {
    id: 2,
    text: "Which of the following voice assistant features do you use most often?",
    type: "multiple_choice",
    required: true,
    options: ["Setting timers/alarms", "Asking questions", "Playing music", "Smart home control", "None of the above"]
  },
  {
    id: 3,
    text: "What improvements would you like to see in voice-controlled interfaces?",
    type: "text",
    required: false,
    options: null
  }
];

export default function VoiceTest() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const currentQuestion = sampleQuestions[currentQuestionIndex];
  
  const handleAnswer = async (answer: any) => {
    try {
      setIsProcessing(true);
      
      // Simulate API processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store the answer
      setAnswers([...answers, answer]);
      
      // Move to the next question or complete
      if (currentQuestionIndex < sampleQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Error processing answer:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setIsComplete(false);
  };
  
  const renderCompletedView = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Test Completed!</CardTitle>
        <CardDescription className="text-center">
          Thank you for trying out the voice interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Your Responses:</h3>
        
        <div className="space-y-4">
          {answers.map((answer, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-md">
              <p className="font-medium">{sampleQuestions[index].text}</p>
              <p className="mt-2">{answer.value}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-2">
                <span className="mr-4">Confidence: {Math.round(answer.confidence * 100)}%</span>
                <span>Question type: {sampleQuestions[index].type}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={resetTest}>Start New Test</Button>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Voice Interface Test</h1>
        <p className="text-muted-foreground">
          Experiment with the voice-enabled question interface
        </p>
      </div>
      
      <Tabs defaultValue="voice" className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Voice Test
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            About Voice Interface
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="space-y-6">
          {isComplete ? (
            renderCompletedView()
          ) : (
            <VoiceInterface
              question={currentQuestion}
              onAnswer={handleAnswer}
              isProcessing={isProcessing}
              isLastQuestion={currentQuestionIndex === sampleQuestions.length - 1}
              standalone
            />
          )}
        </TabsContent>
        
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>About Voice Interface</CardTitle>
              <CardDescription>
                How the voice interface technology works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This demo demonstrates a voice-based form completion interface that combines several
                AI technologies:
              </p>
              
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Speech-to-Text:</strong> The system records your voice and converts it to
                  text using a transcription service.
                </li>
                <li>
                  <strong>Natural Language Understanding:</strong> The system analyzes the transcribed
                  text to extract relevant information based on the question context.
                </li>
                <li>
                  <strong>Response Processing:</strong> Your answers are processed with confidence
                  scoring to ensure accurate interpretation.
                </li>
                <li>
                  <strong>Speech Synthesis:</strong> The system can also respond with voice using
                  text-to-speech technology (not enabled in this demo).
                </li>
              </ol>
              
              <p className="mt-4">
                This technology enables more natural interactions with forms and surveys, making them
                accessible to more users and potentially increasing completion rates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}