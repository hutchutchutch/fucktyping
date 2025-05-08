import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Separator } from "@ui/separator";
import { X, Plus, Trash, Shuffle, HelpCircle, ArrowUpDown, Grip } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@ui/tooltip";
import { Badge } from "@ui/badge";
// Assuming ExtendedFormBuilderQuestion will be the standard type for questions in the builder context
import type { ExtendedFormBuilderQuestion } from "@hooks/useForm";

interface QuestionEditorProps {
  question?: ExtendedFormBuilderQuestion; // Use the standardized type
  showContextField?: boolean; // This seems specific, ensure it's handled or removed if not used
  index?: number; // order is part of ExtendedFormBuilderQuestion
  onChange: (question: ExtendedFormBuilderQuestion) => void; // Expect standardized type
  onRemove?: () => void;
  onCancel?: () => void;
}

export default function QuestionEditor({
  question,
  index = 0, // Default index, but question.order should be the source of truth if question exists
  onChange,
  onRemove,
  onCancel,
  showContextField // Propagated, ensure its usage is intended
}: QuestionEditorProps) {
  
  const getDefaultQuestionState = (): ExtendedFormBuilderQuestion => ({
    id: Date.now(), // Temporary ID for new questions
    text: "",
    type: "text",
    required: false,
    order: index + 1, // Fallback if question.order is not available
    options: [], // Default to empty array for consistency with string[] | null
    description: "",
    helpText: "",
    validation: { min: 1, max: 5 }, // Default validation
    // context: showContextField ? "" : undefined, // Handle context if showContextField is true
  });

  // Initialize with default values or from question prop
  const [localQuestion, setLocalQuestion] = useState<ExtendedFormBuilderQuestion>(() => {
    if (question) {
      // Ensure all fields of ExtendedFormBuilderQuestion are present
      return {
        ...getDefaultQuestionState(), // Start with defaults
        ...question, // Override with passed question props
        options: question.options || [], // Ensure options is an array
        order: question.order || index + 1,
      };
    }
    return getDefaultQuestionState();
  });
  
  // Update local state when parent component passes new question
  useEffect(() => {
    if (question) {
      setLocalQuestion(prevLocal => ({
        ...getDefaultQuestionState(), // Start with defaults
        ...question, // Override with new question props
        id: question.id || prevLocal.id, // Retain existing local ID if new question has no ID (e.g. reset)
        options: question.options || [],
        order: question.order || index + 1,
      }));
    } else {
      // If question prop becomes undefined (e.g. modal closes and reopens for new), reset to default
      setLocalQuestion(getDefaultQuestionState());
    }
  }, [question, index, showContextField]); // Added showContextField to dependencies if context logic is tied to it
  
  const handleQuestionChange = (key: keyof ExtendedFormBuilderQuestion, value: any) => {
    const updatedQuestion = {
      ...localQuestion,
      [key]: value,
    };
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    // The `onChange` in FormBuilder.tsx (handleSaveQuestion) expects ExtendedFormBuilderQuestion
    // No need for showContextField check here if onChange always expects the full object
    onChange(updatedQuestion);
  };
  
  const handleOptionChange = (optionIndex: number, value: string) => {
    const updatedOptions = [...(localQuestion.options || [])];
    updatedOptions[index] = value;
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange && !showContextField) {
      onChange(updatedQuestion);
    }
  };
  
  const addOption = () => {
    const updatedOptions = [...(localQuestion.options || []), `Option ${(localQuestion.options || []).length + 1}`];
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };
  
  const removeOption = (optionIndex: number) => {
    const updatedOptions = [...(localQuestion.options || [])];
    updatedOptions.splice(optionIndex, 1);
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };
  
  const shuffleOptions = () => {
    const shuffled = [...(localQuestion.options || [])].sort(() => Math.random() - 0.5);
    
    const updatedQuestion = {
      ...localQuestion,
      options: shuffled,
    };
    
    setLocalQuestion(updatedQuestion);
    onChange(updatedQuestion);
  };

  // Get display name for question type
  const getQuestionTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      'text': 'Short Text',
      'multiple_choice': 'Multiple Choice',
      'dropdown': 'Dropdown',
      'yes_no': 'Yes/No',
      'rating': 'Rating',
      'date': 'Date'
    };
    return typeMap[type] || type;
  };
  
  return (
    <Card className="mt-4 border shadow-sm">
      <CardHeader className="py-4 px-5 bg-slate-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <Badge variant="outline" className="font-normal bg-white mr-2">
                {getQuestionTypeDisplay(localQuestion.type)}
              </Badge>
              {localQuestion.required && (
                <Badge variant="secondary" className="font-normal text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="question-title" className="text-sm font-medium">
              Question Text
            </Label>
            <Input
              id="question-title"
              value={localQuestion.text}
              onChange={(e) => handleQuestionChange("text", e.target.value)}
              placeholder="Enter your question"
              className="border-slate-300"
            />
          </div>
          {showContextField && (
            <div className="space-y-2">
              <Label htmlFor="question-context" className="text-sm font-medium">
                Context
              </Label>
              { /* Context field handling - ensure 'context' is part of ExtendedFormBuilderQuestion if used */ }
              {showContextField && "context" in localQuestion && (
                <Input
                  id="question-context"
                  value={(localQuestion as any).context || ""}
                  onChange={(e) => handleQuestionChange("context" as keyof ExtendedFormBuilderQuestion, e.target.value)}
                  placeholder="Provide additional context for the question"
                  className="border-slate-300"
                />
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="question-type" className="text-sm font-medium">
                Question Type
              </Label>
              <div className="flex items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Choose how respondents will answer this question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Select
              value={localQuestion.type}
              onValueChange={(value) => handleQuestionChange("type", value)}
            >
              <SelectTrigger id="question-type" className="border-slate-300">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Short Text</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="yes_no">Yes/No</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 pt-1">
            <Switch
              id="question-required"
              checked={localQuestion.required}
              onCheckedChange={(checked) => handleQuestionChange("required", checked)}
            />
            <Label htmlFor="question-required" className="text-sm">Mark as required</Label>
          </div>
        </div>
        
        {/* Question Type Specific Settings */}
        {(localQuestion.type === "multiple_choice" || localQuestion.type === "dropdown") && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Answer Options</Label>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shuffleOptions}
                  className="h-8 text-xs"
                >
                  <Shuffle size={12} className="mr-1" />
                  Shuffle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addOption}
                  className="h-8 text-xs"
                >
                  <Plus size={12} className="mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 mt-1">
              {(localQuestion.options || []).map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  {localQuestion.type === "multiple_choice" && (
                    <div className="h-5 w-5 rounded-full border border-slate-300 flex-shrink-0"></div>
                  )}
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="border-slate-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(optionIndex)}
                    disabled={(localQuestion.options || []).length <= 1}
                    className="h-9 w-9 shrink-0 text-slate-500 hover:text-red-500"
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {localQuestion.type === "rating" && (
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Rating Scale</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-rating" className="text-xs text-slate-500">Min Value</Label>
                <Select
                  value={localQuestion.validation?.min?.toString() || "1"}
                  onValueChange={(value) =>
                    handleQuestionChange("validation", {
                      min: parseInt(value),
                      max: localQuestion.validation?.max || 5, // Ensure max is preserved
                    })
                  }
                >
                  <SelectTrigger id="min-rating" className="border-slate-300">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-rating" className="text-xs text-slate-500">Max Value</Label>
                <Select
                  value={localQuestion.validation?.max?.toString() || "5"}
                  onValueChange={(value) =>
                    handleQuestionChange("validation", {
                      min: localQuestion.validation?.min || 1, // Ensure min is preserved
                      max: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="max-rating" className="border-slate-300">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: localQuestion.validation?.max || 5 }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-sm">
                    {(localQuestion.validation?.min || 1) + i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 flex justify-end space-x-2 bg-slate-50">
        {onCancel && <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>}
        {/* The onRemove for the whole question is handled in FormBuilder.tsx, not directly by this component's footer */}
        <Button size="sm" onClick={() => onChange(localQuestion)}>Apply Changes</Button>
      </CardFooter>
    </Card>
  );
}
