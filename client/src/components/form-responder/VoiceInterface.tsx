import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import VoiceRecorder from './VoiceRecorder';
import { Check, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  detectedAnswer,
  standalone = false,
}: VoiceInterfaceProps) {
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [parsedAnswer, setParsedAnswer] = useState<any>(null);
  
  // Reset state when the question changes
  useEffect(() => {
    setTranscript('');
    setHasAnswered(false);
    setParsedAnswer(null);
  }, [question?.id]);
  
  // Handle new detected answer from parent
  useEffect(() => {
    if (detectedAnswer) {
      setParsedAnswer(detectedAnswer);
    }
  }, [detectedAnswer]);
  
  const handleTranscriptionComplete = (text: string) => {
    setTranscript(text);
    
    // In a real app, we would use AI to extract the answer based on
    // the question type. For this example, just use the transcript directly
    setParsedAnswer({
      questionId: question?.id,
      value: text,
      confidence: 0.9,
      rawTranscript: text
    });
  };
  
  const handleSubmitAnswer = async () => {
    if (!onAnswer || !parsedAnswer) return;
    
    try {
      setHasAnswered(true);
      await onAnswer(parsedAnswer);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setHasAnswered(false);
    }
  };
  
  const renderQuestionInfo = () => {
    if (!question) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">{question.text}</h3>
        
        {question.type === 'multiple_choice' && question.options && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.options.map((option, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className={parsedAnswer?.value === option ? 'bg-primary/20' : ''}
              >
                {option}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Badge variant="outline" className="mr-2">
            {question.type.replace('_', ' ')}
          </Badge>
          {question.required && <span>Required</span>}
        </div>
      </div>
    );
  };
  
  const renderAnswerPreview = () => {
    if (!parsedAnswer) return null;
    
    return (
      <div className="mt-4 p-3 bg-secondary/10 rounded-md">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Detected Answer:</h4>
          <Badge variant="outline" className="text-xs">
            {Math.round(parsedAnswer.confidence * 100)}% confidence
          </Badge>
        </div>
        <p className="mt-2">{parsedAnswer.value}</p>
      </div>
    );
  };
  
  return (
    <Card className={standalone ? 'w-full max-w-2xl mx-auto' : 'w-full'}>
      <CardContent className="pt-6">
        {renderQuestionInfo()}
        
        <VoiceRecorder 
          onTranscriptionComplete={handleTranscriptionComplete} 
          isTranscribing={isTranscribing}
          setIsTranscribing={setIsTranscribing}
        />
        
        {renderAnswerPreview()}
        
        {parsedAnswer && !hasAnswered && (
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSubmitAnswer}
              disabled={isProcessing || isTranscribing}
              className="flex items-center"
            >
              {isLastQuestion ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isLastQuestion ? 'Complete' : 'Submit'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}