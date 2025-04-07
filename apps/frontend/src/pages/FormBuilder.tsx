import React, { useState } from "react";
import { useParams } from "wouter";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { ChevronDown, ChevronUp, Upload, Mic, Edit, Plus, Save, TestTube, Wand2 } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { useForm } from '../hooks/useForm';
import FormBuilderComponent from '../components/form-builder/FormBuilder';
import QuestionEditor from '../components/form-builder/QuestionEditor';
import Modal from '../components/common/Modal';
import { Skeleton } from './components/ui/skeleton';

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("details");
  const [formName, setFormName] = useState(id ? "Edit Form" : "Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  type SectionType = 'details' | 'variables' | 'opening' | 'questions' | 'closing';
  
  type SectionState = {
    [key in SectionType]: boolean;
  };
  
  const [isCollapsed, setIsCollapsed] = useState<SectionState>({
    details: false,
    variables: true,
    opening: true,
    questions: true,
    closing: true
  });
  
  type QuestionType = {
    id: string;
    text: string;
    type: string;
    required: boolean;
    order: number;
    options: string[] | null;
  };
  
  // Integrate the form hooks - this should take precedence
  const {
    form,
    questions: formQuestions,
    isLoading,
    showQuestionModal,
    currentQuestion,
    setShowQuestionModal,
    updateFormField,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    handleSaveQuestion,
    handleSaveForm
  } = useForm();
  
  // Fallback to the simple implementation if the hooks are not available
  const [localQuestions, setLocalQuestions] = useState<QuestionType[]>([
    { id: 'q1', text: 'What is your name?', type: 'text', required: true, order: 1, options: null }
  ]);
  
  const questions = formQuestions || localQuestions;
  
  const toggleSection = (section: SectionType) => {
    setIsCollapsed({
      ...isCollapsed,
      [section]: !isCollapsed[section]
    });
  };
  
  const addQuestion = () => {
    const newQuestion: QuestionType = {
      id: `q${questions.length + 1}`,
      text: 'New Question',
      type: 'text',
      required: false,
      order: questions.length + 1,
      options: null
    };
    setQuestions([...questions, newQuestion]);
  };
  
  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <Skeleton className="h-64 w-full rounded-lg mb-6" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If form hooks are available and the FormBuilderComponent exists, use that
  if (form && typeof FormBuilderComponent !== 'undefined' && handleSaveQuestion) {
    return (
      <div>
        <FormBuilderComponent
          currentForm={form}
          questions={questions}
          updateFormField={updateFormField}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onSaveForm={handleSaveForm}
        />
        
        <Modal
          open={showQuestionModal}
          onOpenChange={setShowQuestionModal}
          title={currentQuestion ? "Edit Question" : "Add Question"}
        >
          <QuestionEditor
            question={currentQuestion}
            onSave={handleSaveQuestion}
            onCancel={() => setShowQuestionModal(false)}
          />
        </Modal>
      </div>
    );
  }

  // Fallback to the original implementation
  return (
    <AppLayout>
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {formName}
            </h1>
            <p className="text-muted-foreground">Create a new form with five simple steps</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <TestTube size={18} />
              Test Form
            </Button>
            <Button className="flex items-center gap-2">
              <Wand2 size={18} />
              Generate Form
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Form Details Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between" 
              onClick={() => toggleSection('details')}
            >
              <div>
                <CardTitle className="text-xl flex items-center">
                  1. Form Details
                </CardTitle>
                <CardDescription>Basic information about your form</CardDescription>
              </div>
              {isCollapsed.details ? <ChevronDown /> : <ChevronUp />}
            </CardHeader>
            
            {!isCollapsed.details && (
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formName">Form Name</Label>
                  <Input 
                    id="formName" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="Enter form name" 
                  />
                </div>
                <div>
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea 
                    id="formDescription" 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)} 
                    placeholder="Enter form description" 
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="collectEmail">Collect respondent email</Label>
                    <p className="text-sm text-muted-foreground">Ask for email address before form submission</p>
                  </div>
                  <Switch id="collectEmail" />
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Dynamic Variables Section */}
          <Card>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between" 
              onClick={() => toggleSection('variables')}
            >
              <div>
                <CardTitle className="text-xl flex items-center">
                  2. Dynamic Variables
                </CardTitle>
                <CardDescription>Define variables to be used in questions and prompts</CardDescription>
              </div>
              {isCollapsed.variables ? <ChevronDown /> : <ChevronUp />}
            </CardHeader>
            
            {!isCollapsed.variables && (
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Variables</h3>
                    <Button size="sm" variant="outline" className="h-8 flex items-center gap-1">
                      <Plus size={16} />
                      Add Variable
                    </Button>
                  </div>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No variables added yet</p>
                    <p className="text-sm">Variables can be used in questions and prompts with {'{variable_name}'}</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Opening Activity (Voice Agent) */}
          <Card>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between" 
              onClick={() => toggleSection('opening')}
            >
              <div>
                <CardTitle className="text-xl flex items-center">
                  3. Opening Activity
                </CardTitle>
                <CardDescription>Configure how the voice agent introduces itself</CardDescription>
              </div>
              {isCollapsed.opening ? <ChevronDown /> : <ChevronUp />}
            </CardHeader>
            
            {!isCollapsed.opening && (
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-4">
                    <div className="border rounded-full p-3 h-12 w-12 flex items-center justify-center bg-gray-50">
                      <Mic size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Voice Agent Introduction</h3>
                        <Button size="sm" variant="ghost" className="h-8 gap-1">
                          <Edit size={14} />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Hello, I'm your form assistant. I'll be guiding you through this form today. What's your name?
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="voice-type">Voice Type</Label>
                    </div>
                    <Tabs defaultValue="male" className="w-full">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="male">Male</TabsTrigger>
                        <TabsTrigger value="female">Female</TabsTrigger>
                        <TabsTrigger value="neutral">Neutral</TabsTrigger>
                        <TabsTrigger value="custom">Custom</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Questions */}
          <Card>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between" 
              onClick={() => toggleSection('questions')}
            >
              <div>
                <CardTitle className="text-xl flex items-center">
                  4. Questions
                </CardTitle>
                <CardDescription>Define the questions for your form</CardDescription>
              </div>
              {isCollapsed.questions ? <ChevronDown /> : <ChevronUp />}
            </CardHeader>
            
            {!isCollapsed.questions && (
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Questions</h3>
                    <Button size="sm" onClick={addQuestion} className="h-8 flex items-center gap-1">
                      <Plus size={16} />
                      Add Question
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-muted rounded-md p-4">
                        <h4 className="font-medium mb-2">Question {index + 1}</h4>
                        <div className="space-y-2">
                          <QuestionEditor 
                            question={question} 
                            index={index}
                            onChange={(updatedQuestion) => {
                              const newQuestions = [...questions];
                              newQuestions[index] = updatedQuestion;
                              setQuestions(newQuestions);
                            }}
                            onRemove={() => {
                              setQuestions(questions.filter(q => q.id !== question.id));
                            }}
                          />
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <h5 className="text-sm font-medium">Conversation Repair</h5>
                            <Button size="sm" variant="ghost" className="h-8 text-xs">Configure</Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Define how the voice agent should handle unclear or invalid responses
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Closing Activity */}
          <Card>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between" 
              onClick={() => toggleSection('closing')}
            >
              <div>
                <CardTitle className="text-xl flex items-center">
                  5. Closing Activity
                </CardTitle>
                <CardDescription>Configure how the voice agent ends the conversation</CardDescription>
              </div>
              {isCollapsed.closing ? <ChevronDown /> : <ChevronUp />}
            </CardHeader>
            
            {!isCollapsed.closing && (
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4">
                  <div className="flex items-start gap-4">
                    <div className="border rounded-full p-3 h-12 w-12 flex items-center justify-center bg-gray-50">
                      <Mic size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Closing Message</h3>
                        <Button size="sm" variant="ghost" className="h-8 gap-1">
                          <Edit size={14} />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Thank you for completing this form! Your responses have been recorded.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Knowledge Base</h3>
                      <Button size="sm" variant="outline" className="h-8 flex items-center gap-1">
                        <Upload size={16} />
                        Upload Document
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload documents to help the voice agent answer follow-up questions
                    </p>
                    
                    <div className="border border-dashed rounded-md p-6 mt-4 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <Upload size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Drag and drop your documents here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports PDF, Word, PowerPoint, and text files (up to 10MB each)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline">Cancel</Button>
            <Button className="flex items-center gap-2">
              <Save size={16} />
              Save Form
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
