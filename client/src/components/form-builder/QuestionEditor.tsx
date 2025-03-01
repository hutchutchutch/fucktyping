import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Trash, Shuffle } from "lucide-react";

interface QuestionEditorProps {
  question?: {
    id: string | number;
    text: string;
    type: string;
    order: number;
    options: string[] | null;
    required: boolean;
    description?: string;
    validation?: {
      min: number;
      max: number;
    };
  };
  index?: number;
  onChange: (question: any) => void;
  onRemove?: () => void;
  onCancel?: () => void;
}

export default function QuestionEditor({ 
  question, 
  index = 0, 
  onChange, 
  onRemove,
  onCancel 
}: QuestionEditorProps) {
  // Initialize with default values or from question prop
  const [localQuestion, setLocalQuestion] = useState({
    id: question?.id || `q${Date.now()}`,
    text: question?.text || "",
    description: question?.description || "",
    type: question?.type || "text",
    required: question?.required !== undefined ? question?.required : false,
    options: question?.options || ["Option 1"],
    order: question?.order || index + 1,
    validation: question?.validation || {
      min: 1,
      max: 5,
    },
  });
  
  // Update local state when parent component passes new question
  useEffect(() => {
    if (question) {
      setLocalQuestion({
        id: question.id || localQuestion.id,
        text: question.text || "",
        description: question.description || "",
        type: question.type || "text",
        required: question.required !== undefined ? question.required : localQuestion.required,
        options: question.options || localQuestion.options,
        order: question.order || index + 1,
        validation: question.validation || localQuestion.validation,
      });
    }
  }, [question, index]);
  
  const handleQuestionChange = (key: string, value: any) => {
    const updatedQuestion = {
      ...localQuestion,
      [key]: value,
    };
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange) {
      onChange(updatedQuestion);
    }
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...localQuestion.options];
    updatedOptions[index] = value;
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange) {
      onChange(updatedQuestion);
    }
  };
  
  const addOption = () => {
    const updatedOptions = [...localQuestion.options, `Option ${localQuestion.options.length + 1}`];
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange) {
      onChange(updatedQuestion);
    }
  };
  
  const removeOption = (index: number) => {
    const updatedOptions = [...localQuestion.options];
    updatedOptions.splice(index, 1);
    
    const updatedQuestion = {
      ...localQuestion,
      options: updatedOptions,
    };
    
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange) {
      onChange(updatedQuestion);
    }
  };
  
  const shuffleOptions = () => {
    const shuffled = [...localQuestion.options].sort(() => Math.random() - 0.5);
    
    const updatedQuestion = {
      ...localQuestion,
      options: shuffled,
    };
    
    setLocalQuestion(updatedQuestion);
    
    // Notify parent component about the changes
    if (onChange) {
      onChange(updatedQuestion);
    }
  };
  
  return (
    <Card className="mt-6">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="question-title">Question</Label>
          <Input
            id="question-title"
            value={localQuestion.text}
            onChange={(e) => handleQuestionChange("text", e.target.value)}
            placeholder="Enter your question"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="question-description">Description (Optional)</Label>
          <Textarea
            id="question-description"
            value={localQuestion.description || ""}
            onChange={(e) => handleQuestionChange("description", e.target.value)}
            placeholder="Add a description or instructions"
            rows={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="question-type">Question Type</Label>
          <Select
            value={localQuestion.type}
            onValueChange={(value) => handleQuestionChange("type", value)}
          >
            <SelectTrigger id="question-type">
              <SelectValue placeholder="Select question type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="yes_no">Yes/No</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="date">Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="question-required"
            checked={localQuestion.required}
            onCheckedChange={(checked) => handleQuestionChange("required", checked)}
          />
          <Label htmlFor="question-required">Required question</Label>
        </div>
        
        {(localQuestion.type === "multiple_choice" || localQuestion.type === "dropdown") && (
          <div className="space-y-3">
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={shuffleOptions}
                  className="h-8"
                >
                  <Shuffle size={14} className="mr-1" />
                  Shuffle
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={addOption}
                  className="h-8"
                >
                  <Plus size={14} className="mr-1" />
                  Add Option
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {localQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={localQuestion.options.length <= 1}
                    className="h-10 w-10 shrink-0"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {localQuestion.type === "rating" && (
          <div className="space-y-4">
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-rating">Min Rating</Label>
                <Select
                  value={localQuestion.validation?.min?.toString() || "1"}
                  onValueChange={(value) => 
                    handleQuestionChange("validation", {
                      ...localQuestion.validation,
                      min: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="min-rating">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-rating">Max Rating</Label>
                <Select
                  value={localQuestion.validation?.max?.toString() || "5"}
                  onValueChange={(value) => 
                    handleQuestionChange("validation", {
                      ...localQuestion.validation,
                      max: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger id="max-rating">
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
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 flex justify-end space-x-2">
        {onRemove && <Button variant="outline" onClick={onRemove}>Delete Question</Button>}
        {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button onClick={() => onChange && onChange(localQuestion)}>Apply Changes</Button>
      </CardFooter>
    </Card>
  );
}
