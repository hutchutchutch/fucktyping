import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Trash, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface QuestionEditorProps {
  question: {
    id: string | number;
    text: string;
    type: string;
    order: number;
    options: string[] | null;
    required: boolean;
  };
  index: number;
  onChange: (question: any) => void;
  onRemove: () => void;
}

export default function QuestionEditor({ 
  question, 
  index, 
  onChange, 
  onRemove 
}: QuestionEditorProps) {
  const [options, setOptions] = useState<string[]>(
    question.options && Array.isArray(question.options) ? question.options : [""]
  );

  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...question,
      text: e.target.value,
    });
  };

  const handleTypeChange = (value: string) => {
    let newOptions = options;
    
    // Initialize options array if switching to multiple choice
    if (value === "multiple_choice" && (!options || options.length === 0)) {
      newOptions = [""];
    }
    
    onChange({
      ...question,
      type: value,
      options: value === "multiple_choice" ? newOptions : null,
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions,
    });
  };

  const addOption = () => {
    const newOptions = [...options, ""];
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions,
    });
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onChange({
      ...question,
      options: newOptions,
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Question {index + 1}
            </label>
            <Input
              value={question.text}
              onChange={handleQuestionTextChange}
              className="mt-1 block w-full"
              placeholder="Enter question text"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Question Type
            </label>
            <Select
              value={question.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {question.type === "multiple_choice" && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <div className="mt-1 space-y-2">
                {options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                      className="block w-full"
                      placeholder={`Option ${optIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(optIndex)}
                      className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500"
          >
            <Trash className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
