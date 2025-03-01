import React, { useState } from 'react';
// @ts-ignore - Importing from JS file
import QuestionEditor from './QuestionEditor';
// @ts-ignore - Importing from JS file
import ResponseOptions from './ResponseOptions';
import { Button } from "@/components/ui/button";

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
  description?: string;
  validation?: {
    min: number;
    max: number;
  };
}

interface DragEndResult {
  destination?: {
    index: number;
  };
  source: {
    index: number;
  };
}

// src/components/form-builder/FormBuilder.tsx
const FormBuilder: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: 'What is your name?', type: 'text', required: true, order: 1 },
    { id: 'q2', text: 'How satisfied are you with our service?', type: 'rating', required: true, order: 2 },
    { id: 'q3', text: 'Any additional comments?', type: 'textarea', required: false, order: 3 }
  ]);
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  const handleDragEnd = (result: DragEndResult) => {
    if (!result.destination) return;
    
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setQuestions(updatedItems);
  };
  
  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      text: 'New Question',
      type: 'text',
      required: false,
      order: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion(newQuestion);
  };
  
  const editQuestion = (id: string) => {
    const question = questions.find(q => q.id === id);
    if (question) {
      setCurrentQuestion(question);
    }
  };
  
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    if (currentQuestion && currentQuestion.id === id) {
      setCurrentQuestion(null);
    }
  };
  
  const onQuestionChange = (updatedQuestion: Question) => {
    setQuestions(questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    ));
    setCurrentQuestion(updatedQuestion);
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 space-y-6">
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Form Questions</h2>
            <Button onClick={addQuestion} className="rounded-md">Add Question</Button>
          </div>
          
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="bg-muted/30 p-4 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{question.text}</p>
                  <p className="text-sm text-muted-foreground">{question.type}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => editQuestion(question.id)}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Form Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Form Title</label>
              <input type="text" className="w-full p-2 border rounded-md" placeholder="Enter form title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full p-2 border rounded-md h-20" placeholder="Enter form description"></textarea>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="collect-email" className="mr-2" />
              <label htmlFor="collect-email">Collect respondent email</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="allow-multiple" className="mr-2" />
              <label htmlFor="allow-multiple">Allow multiple submissions</label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:w-1/2">
        {currentQuestion ? (
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Edit Question</h2>
            {/* @ts-ignore - Using component with untyped props */}
            <QuestionEditor 
              question={currentQuestion} 
              index={questions.findIndex(q => q.id === currentQuestion.id)}
              onChange={onQuestionChange}
              onRemove={() => deleteQuestion(currentQuestion.id)}
            />
            {(currentQuestion.type === 'radio' || currentQuestion.type === 'checkbox' || currentQuestion.type === 'dropdown' || 
              currentQuestion.type === 'multiple_choice') && (
              <ResponseOptions />
            )}
          </div>
        ) : (
          <div className="bg-card p-6 rounded-lg shadow-sm h-64 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 11l.01-.011M17 7l.01-.011M12 7l.01-.011M7 11l.01-.011M11 17l.01-.011"/>
                <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/>
              </svg>
            </div>
            <h3 className="font-medium">No Question Selected</h3>
            <p className="text-sm text-muted-foreground mt-1">Select a question to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;