import React, { useState } from 'react';
import { useFormContext } from "@context/FormContext";
import QuestionEditor from '@components/form-builder/QuestionEditor';
import EmailTemplateEditor from '@components/form-builder/EmailTemplateEditor';
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Checkbox } from "@ui/checkbox";
import { Label } from "@ui/label";
import { PlusCircle, Save, SendHorizontal, Pencil, Trash } from "lucide-react";
import Modal from "@ui/dialog";
import { FormBuilderForm, FormBuilderQuestion } from "@schemas/schema";

interface FormBuilderProps {
  currentForm?: FormBuilderForm;
  questions?: FormBuilderQuestion[];
  updateFormField?: (field: string, value: any) => void;
  addQuestion?: (question: FormBuilderQuestion) => void;
  saveForm?: () => Promise<void>;
  publishForm?: () => Promise<void>;
  isSaving?: boolean;
  standalone?: boolean;
}

const FormBuilder: React.FC<FormBuilderProps> = ({ 
  currentForm: propCurrentForm,
  questions: propQuestions,
  updateFormField: propUpdateFormField,
  addQuestion: propAddQuestion,
  saveForm: propSaveForm,
  publishForm: propPublishForm,
  isSaving: propIsSaving,
  standalone = false
}) => {
  // Use props if provided, otherwise use context
  const contextValues = useFormContext();
  
  // Define values either from props or from context
  const currentForm = propCurrentForm || (contextValues?.currentForm as FormBuilderForm) || {
    title: "",
    description: "",
    requireAuth: false,
    allowVoice: true,
    emailNotification: false,
    limitOneResponse: false,
    emailSubject: "",
    emailRecipients: "",
    emailTemplate: ""
  };
  
  const questions = propQuestions || contextValues?.questions || [];
  const updateFormField = propUpdateFormField || contextValues?.setCurrentForm || (() => {});
  const addQuestionFn = propAddQuestion || (() => {});
  const saveFormFn = propSaveForm || (() => Promise.resolve());
  const publishFormFn = propPublishForm || (() => Promise.resolve());
  const isSaving = propIsSaving || false;
  
  // For standalone mode - define necessary state
  const [localQuestions, setLocalQuestions] = useState<FormBuilderQuestion[]>([
    { id: 'q1', text: 'What is your name?', type: 'text', required: true, order: 1, options: null },
    { id: 'q2', text: 'How satisfied are you with our service?', type: 'rating', required: true, order: 2, options: null },
    { id: 'q3', text: 'Any additional comments?', type: 'textarea', required: false, order: 3, options: null }
  ]);
  
  // State for modal
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormBuilderQuestion | null>(null);
  
  // Use local state for standalone mode, otherwise use provided questions
  const displayQuestions = standalone ? localQuestions : questions;
  
  // Helper to handle form field updates in standalone mode
  const handleUpdateFormField = (field: string, value: any) => {
    if (propUpdateFormField) {
      propUpdateFormField(field, value);
    } else if (contextValues?.setCurrentForm) {
      const updatedForm = { ...currentForm, [field]: value };
      contextValues.setCurrentForm(updatedForm);
    }
  };
  
  // Handlers
  const handleSaveForm = async (asDraft = true) => {
    try {
      if (asDraft) {
        await saveFormFn();
      } else {
        await publishFormFn();
      }
    } catch (error) {
      console.error("Failed to save form:", error);
    }
  };
  
  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionEditor(true);
  };
  
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionEditor(true);
  };
  
  const handleQuestionSave = (question: Question) => {
    if (standalone) {
      if (editingQuestion) {
        // Update existing question
        setLocalQuestions(localQuestions.map(q => 
          q.id === question.id ? question : q
        ));
      } else {
        // Add new question
        const newQuestion = {
          ...question,
          id: `q${localQuestions.length + 1}`,
          order: localQuestions.length + 1
        };
        setLocalQuestions([...localQuestions, newQuestion]);
      }
    } else {
      // Use provided function or context
      addQuestionFn(question);
    }
    setShowQuestionEditor(false);
  };
  
  const handleDeleteQuestion = (id: string | number) => {
    if (standalone) {
      setLocalQuestions(localQuestions.filter(q => q.id !== id));
    } else {
      // This would need a deleteQuestion function from props or context
      // For now we just filter the local display
      console.log("Delete question:", id);
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-sans">
          {currentForm?.id ? "Edit Form" : "Create Form"}
        </h1>
        <p className="text-gray-600">
          Build a new voice-enabled form by adding questions and configuring options.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="mb-6">
                <Label htmlFor="formName" className="mb-1">Form Name</Label>
                <Input 
                  id="formName" 
                  placeholder="e.g. Customer Feedback Survey" 
                  value={currentForm?.title || ''}
                  onChange={(e) => handleUpdateFormField('title', e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="formDescription" className="mb-1">Description</Label>
                <Textarea 
                  id="formDescription" 
                  rows={3} 
                  placeholder="Brief description of your form"
                  value={currentForm?.description || ''}
                  onChange={(e) => handleUpdateFormField('description', e.target.value)}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <Button onClick={handleAddQuestion}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </div>
                
                {/* Questions List */}
                <div className="space-y-4">
                  {displayQuestions.length === 0 && (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-gray-500">No questions added yet</p>
                      <Button 
                        variant="link" 
                        onClick={handleAddQuestion}
                        className="mt-2"
                      >
                        Click here to add your first question
                      </Button>
                    </div>
                  )}
                  
                  {displayQuestions.map((question, index) => (
                    <div key={question.id || index} className="border rounded-md p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <h4 className="font-medium">{question.text}</h4>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditQuestion(question)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pl-9">
                        <p className="text-sm text-gray-500 mb-2">
                          {question.type === 'rating' && 'Rating Scale (1-5)'}
                          {question.type === 'yes_no' && 'Yes/No'}
                          {question.type === 'text' && 'Open-ended (Text)'}
                          {question.type === 'multiple_choice' && 'Multiple Choice'}
                          {question.type === 'date' && 'Date'}
                          {question.type === 'textarea' && 'Long Text (Paragraph)'}
                          {!['rating', 'yes_no', 'text', 'multiple_choice', 'date', 'textarea'].includes(question.type) && question.type}
                        </p>
                        
                        {(question.type === 'rating' || question.type === 'yes_no' || question.type === 'multiple_choice') && question.options && (
                          <div className="flex flex-wrap gap-2">
                            {question.options.map((option, i) => (
                              <span key={i} className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {option}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Form Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requireAuth" 
                    checked={currentForm?.requireAuth || false}
                    onCheckedChange={(checked) => handleUpdateFormField('requireAuth', checked)}
                  />
                  <Label htmlFor="requireAuth">Require authentication</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowVoice" 
                    checked={currentForm?.allowVoice !== false}
                    onCheckedChange={(checked) => handleUpdateFormField('allowVoice', checked)}
                  />
                  <Label htmlFor="allowVoice">Allow voice responses</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emailNotification" 
                    checked={currentForm?.emailNotification || false}
                    onCheckedChange={(checked) => handleUpdateFormField('emailNotification', checked)}
                  />
                  <Label htmlFor="emailNotification">Send email notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="limitOneResponse" 
                    checked={currentForm?.limitOneResponse || false}
                    onCheckedChange={(checked) => handleUpdateFormField('limitOneResponse', checked)}
                  />
                  <Label htmlFor="limitOneResponse">Limit one response per user</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {currentForm?.emailNotification && (
            <EmailTemplateEditor 
              emailSubject={currentForm.emailSubject}
              emailRecipients={currentForm.emailRecipients}
              emailTemplate={currentForm.emailTemplate}
              onUpdate={(field, value) => handleUpdateFormField(field, value)}
            />
          )}
          
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="w-1/2" 
              onClick={() => handleSaveForm(true)}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button 
              className="w-1/2" 
              onClick={() => handleSaveForm(false)}
              disabled={isSaving}
            >
              <SendHorizontal className="mr-2 h-4 w-4" /> Publish Form
            </Button>
          </div>
        </div>
      </div>
      
      {/* Question Editor Modal */}
      {showQuestionEditor && (
        <Modal
          open={showQuestionEditor}
          onOpenChange={setShowQuestionEditor}
        >
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>{editingQuestion ? "Edit Question" : "Add Question"}</Modal.Title>
            </Modal.Header>
            <Modal.Description>
              <QuestionEditor 
                question={editingQuestion || undefined} 
                onChange={handleQuestionSave} 
                onCancel={() => setShowQuestionEditor(false)}
              />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      )}
    </div>
  );
};

export default FormBuilder;