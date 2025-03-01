import { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "../common/Button";
import { PlusCircle, Trash2 } from "lucide-react";

function ResponseOptions({ options = [], onChange, questionType }) {
  const [newOption, setNewOption] = useState("");

  const handleAddOption = () => {
    if (newOption.trim() !== "") {
      onChange([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onChange(newOptions);
  };

  // For yes/no questions, don't allow removing options
  const isYesNo = questionType === 'yesno';
  
  // For rating questions, don't allow fewer than 2 options
  const isRating = questionType === 'rating';
  const canRemove = !isYesNo && (!isRating || options.length > 2);

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center">
          <Input 
            value={option} 
            onChange={(e) => handleUpdateOption(index, e.target.value)}
            className="flex-1"
            disabled={isYesNo} // Don't allow editing yes/no options
          />
          {canRemove && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleRemoveOption(index)}
              className="ml-2 text-gray-400 hover:text-gray-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      
      {questionType === 'multiple' && (
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
  );
}

export default ResponseOptions;
