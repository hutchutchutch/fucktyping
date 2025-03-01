import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TourStep {
  title: string;
  content: string;
}

interface SimpleTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function SimpleTour({ onComplete, onSkip }: SimpleTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  
  const tourSteps: TourStep[] = [
    {
      title: "Welcome to FormVoice!",
      content: "Let's take a quick tour of the platform to help you get started. FormVoice is an AI-powered form builder with voice capabilities."
    },
    {
      title: "Quick Actions",
      content: "At the top of the sidebar, you can find quick action buttons to review form results, create new forms, or test your existing voice forms."
    },
    {
      title: "Categories",
      content: "Keep your forms organized with categories. This makes it easier to analyze trends across similar forms and compare performance."
    },
    {
      title: "Voice Forms",
      content: "Our unique voice interface allows respondents to complete forms by speaking naturally. Voice forms have 78% higher completion rates!"
    },
    {
      title: "AI Assistant",
      content: "Click on the AI Assistant button at the bottom of the sidebar anytime you need help analyzing form results or creating new questions."
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    onComplete();
    toast({
      title: "Tour Completed!",
      description: "You can now explore FormVoice on your own. The AI Assistant is available to help anytime.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {tourSteps[currentStep].title}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onSkip}
              className="h-8 w-8 rounded-full -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground">
            {tourSteps[currentStep].content}
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-1">
            {tourSteps.map((_, index) => (
              <div 
                key={index}
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${currentStep === index ? 'bg-primary' : 'bg-muted'}
                `}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrevious}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>Next <ChevronRight className="h-4 w-4" /></>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}