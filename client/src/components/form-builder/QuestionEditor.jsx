import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Button from "../common/Button";
import { PlusCircle, Trash2 } from "lucide-react";

function QuestionEditor({ question, onSave, onCancel }) {
  const defaultQuestion = {
    text: "",
    type: "text",
    options: [],
    required: true,
    order: 0,
  };

  const [formData, setFormData] = useState(question || defaultQuestion);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (question) {
      setFormData(question);
    } else {
      setFormData(defaultQuestion);
    }
  }, [question]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset options if type changes
    if (field === 'type' && value !== 'rating' && value !== 'yesno' && value !== 'multiple') {
      setFormData(prev => ({
        ...prev,
        options: []
      }));
    } else if (field === 'type' && value === 'rating') {
      setFormData(prev => ({
        ...prev,
        options: ["1 - Very Dissatisfied", "2", "3", "4", "5 - Very Satisfied"]
      }));
    } else if (field === 'type' && value === 'yesno') {
      setFormData(prev => ({
        ...prev,
        options: ["Yes", "No"]
      }));
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="questionText" className="mb-1">Question Text</Label>
        <Input 
          id="questionText" 
          value={formData.text} 
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="e.g. How would you rate our service?"
        />
      </div>
      
      <div>
        <Label htmlFor="questionType" className="mb-1">Question Type</Label>
        <Select 
          onValueChange={(value) => handleChange('type', value)}
          defaultValue={formData.type}
        >
          <SelectTrigger id="questionType">
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Rating Scale</SelectItem>
            <SelectItem value="yesno">Yes/No</SelectItem>
            <SelectItem value="text">Open-ended (Text)</SelectItem>
            <SelectItem value="multiple">Multiple Choice</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(formData.type === 'multiple' || formData.type === 'rating' || formData.type === 'yesno') && (
        <div>
          <Label className="mb-2">Options</Label>
          <div className="space-y-2">
            {(formData.options || []).map((option, index) => (
              <div key={index} className="flex items-center">
                <Input 
                  value={option} 
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    handleChange('options', newOptions);
                  }}
                  className="flex-1"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  className="ml-2 text-gray-400 hover:text-gray-500"
                  disabled={
                    (formData.type === 'rating' && formData.options.length <= 2) || 
                    (formData.type === 'yesno')
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {formData.type === 'multiple' && (
              <div className="flex items-center mt-2">
                <Input 
                  value={newOption} 
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Add a new option"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddOption}
                  className="ml-2"
                  disabled={!newOption.trim()}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="required" 
          checked={formData.required} 
          onCheckedChange={(checked) => handleChange('required', checked)}
        />
        <Label htmlFor="required">Required question</Label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.text.trim()}>
          Save Question
        </Button>
      </div>
    </div>
  );
}

export default QuestionEditor;
