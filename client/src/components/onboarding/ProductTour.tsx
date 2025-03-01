import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TourStep {
  title: string;
  content: string;
  target: string;
  placement?: 'top' | 'right' | 'bottom' | 'left';
}

interface ProductTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function ProductTour({ onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();
  
  const tourSteps: TourStep[] = [
    {
      title: "Welcome to FormVoice!",
      content: "Hi there! I'm your AI assistant. Let me show you around our powerful form creation and analysis platform.",
      target: "body",
      placement: "top"
    },
    {
      title: "Create New Forms",
      content: "Click 'Generate New Form' to create a form in seconds. I'll help you craft the perfect questions using AI to maximize engagement and response quality.",
      target: ".cta-generate-form",
      placement: "right"
    },
    {
      title: "Organize with Categories",
      content: "Keep your forms organized by creating categories. This makes it easier to analyze trends across similar forms and compare performance.",
      target: ".category-section",
      placement: "right"
    },
    {
      title: "Review Your Results",
      content: "Click 'Review Form Results' to see detailed analytics about your form responses, including completion rates, average response times, and sentiment analysis.",
      target: ".cta-review-results",
      placement: "right"
    },
    {
      title: "Test Your Forms",
      content: "Before sending your form to respondents, test it by clicking 'Test Prior Forms'. You can experience exactly what your users will see.",
      target: ".cta-test-forms",
      placement: "right"
    },
    {
      title: "Voice-Powered Forms",
      content: "Our unique voice interface allows respondents to complete forms by speaking naturally. Voice forms have 78% higher completion rates!",
      target: ".voice-agent-section",
      placement: "bottom"
    },
    {
      title: "I'm Always Here to Help!",
      content: "Click on me anytime you need assistance analyzing form results, creating new questions, or optimizing your forms for better responses.",
      target: ".ai-assistant-trigger",
      placement: "left"
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      highlightTarget(tourSteps[currentStep + 1].target);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      highlightTarget(tourSteps[currentStep - 1].target);
    }
  };

  const highlightTarget = (selector: string) => {
    // Remove any existing highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight', 'pulse-animation');
    });

    // Add highlight to the new target (except for body)
    if (selector !== 'body') {
      const targetElement = document.querySelector(selector);
      if (targetElement) {
        targetElement.classList.add('tour-highlight', 'pulse-animation');
        
        // Scroll target into view if needed
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const completeTour = () => {
    // Remove any highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight', 'pulse-animation');
    });
    
    setIsVisible(false);
    onComplete();
    
    toast({
      title: "Tour Completed!",
      description: "I'm always here in the bottom corner if you need any help.",
    });
  };

  const skipTour = () => {
    // Remove any highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight', 'pulse-animation');
    });
    
    setIsVisible(false);
    onSkip();
  };

  // Initialize the tour by highlighting the first target
  useEffect(() => {
    if (isVisible) {
      highlightTarget(tourSteps[currentStep].target);
      
      // Add CSS for highlights
      const style = document.createElement('style');
      style.innerHTML = `
        .tour-highlight {
          position: relative;
          z-index: 100;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5) !important;
          border-radius: 4px;
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
          }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-none">
      <Card className={`
        pointer-events-auto
        max-w-md 
        shadow-xl 
        border-primary/20
        absolute
        z-[1000]
        ${getPlacementClasses(tourSteps[currentStep].placement || 'bottom', tourSteps[currentStep].target)}
      `}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {tourSteps[currentStep].title}
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={skipTour}
              className="h-8 w-8 rounded-full -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="mb-4 text-muted-foreground">
            {tourSteps[currentStep].content}
          </p>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: tourSteps.length }).map((_, index) => (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getPlacementClasses(placement: string, targetSelector: string): string {
  // Default positioning for body or other general selectors
  if (targetSelector === 'body') {
    return 'top-1/4 left-1/2 -translate-x-1/2';
  }
  
  // For specific elements, position the card relative to them
  switch (placement) {
    case 'top':
      return 'bottom-full mb-4 left-1/2 -translate-x-1/2';
    case 'right':
      return 'left-full ml-4 top-1/2 -translate-y-1/2';
    case 'bottom':
      return 'top-full mt-4 left-1/2 -translate-x-1/2';
    case 'left':
      return 'right-full mr-4 top-1/2 -translate-y-1/2';
    default:
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
}