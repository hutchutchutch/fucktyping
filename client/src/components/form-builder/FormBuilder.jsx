import { useState, useEffect } from "react";
import { useFormContext } from "../../context/FormContext";
import QuestionEditor from "./QuestionEditor";
import ResponseOptions from "./ResponseOptions";
import EmailTemplateEditor from "./EmailTemplateEditor";
import Button from "../common/Button";
import Card from "../common/Card";
import Modal from "../common/Modal";
import { useNotification } from "../common/Notification";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Save, SendHorizontal } from "lucide-react";

function FormBuilder() {
  const { 
    currentForm, 
    updateFormField, 
    addQuestion, 
    questions, 
    saveForm, 
    publishForm,
    isSaving 
  } = useFormContext();
  
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const notification = useNotification();

  const handleSaveForm = async (asDraft = true) => {
    try {
      if (asDraft) {
        await saveForm();
        notification.success("Form saved successfully");
      } else {
        await publishForm();
        notification.success("Form published successfully");
      }
    } catch (error) {
      notification.error("Failed to save form: " + error.message);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionEditor(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionEditor(true);
  };

  const handleQuestionSave = (question) => {
    addQuestion(question);
    setShowQuestionEditor(false);
    notification.success("Question saved");
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-sans">
          {currentForm.id ? "Edit Form" : "Create Form"}
        </h1>
        <p className="text-gray-600">
          Build a new voice-enabled form by adding questions and configuring options.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <Card.Content>
              <div className="mb-6">
                <Label htmlFor="formName" className="mb-1">Form Name</Label>
                <Input 
                  id="formName" 
                  placeholder="e.g. Customer Feedback Survey" 
                  value={currentForm.title || ''}
                  onChange={(e) => updateFormField('title', e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <Label htmlFor="formDescription" className="mb-1">Description</Label>
                <Textarea 
                  id="formDescription" 
                  rows="3" 
                  placeholder="Brief description of your form"
                  value={currentForm.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
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
                  {questions.length === 0 && (
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
                  
                  {questions.map((question, index) => (
                    <div key={question.id || index} className="border rounded-md p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm font-medium mr-3">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pen"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              /* Handle delete */
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pl-9">
                        <p className="text-sm text-gray-500 mb-2">
                          {question.type === 'rating' && 'Rating Scale (1-5)'}
                          {question.type === 'yesno' && 'Yes/No'}
                          {question.type === 'text' && 'Open-ended (Text)'}
                          {question.type === 'multiple' && 'Multiple Choice'}
                        </p>
                        
                        {(question.type === 'rating' || question.type === 'yesno' || question.type === 'multiple') && (
                          <div className="flex flex-wrap gap-2">
                            {question.options && question.options.map((option, i) => (
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
            </Card.Content>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Form Settings</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="requireAuth" 
                    checked={currentForm.requireAuth || false}
                    onCheckedChange={(checked) => updateFormField('requireAuth', checked)}
                  />
                  <Label htmlFor="requireAuth">Require authentication</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowVoice" 
                    checked={currentForm.allowVoice !== false}
                    onCheckedChange={(checked) => updateFormField('allowVoice', checked)}
                  />
                  <Label htmlFor="allowVoice">Allow voice responses</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="emailNotification" 
                    checked={currentForm.emailNotification || false}
                    onCheckedChange={(checked) => updateFormField('emailNotification', checked)}
                  />
                  <Label htmlFor="emailNotification">Send email notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="limitOneResponse" 
                    checked={currentForm.limitOneResponse || false}
                    onCheckedChange={(checked) => updateFormField('limitOneResponse', checked)}
                  />
                  <Label htmlFor="limitOneResponse">Limit one response per user</Label>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          {currentForm.emailNotification && (
            <EmailTemplateEditor 
              emailSubject={currentForm.emailSubject}
              emailRecipients={currentForm.emailRecipients}
              emailTemplate={currentForm.emailTemplate}
              onUpdate={(field, value) => updateFormField(field, value)}
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
      <Modal
        open={showQuestionEditor}
        onOpenChange={setShowQuestionEditor}
        title={editingQuestion ? "Edit Question" : "Add Question"}
      >
        <QuestionEditor 
          question={editingQuestion} 
          onSave={handleQuestionSave} 
          onCancel={() => setShowQuestionEditor(false)}
        />
      </Modal>
    </div>
  );
}

export default FormBuilder;
