import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { ChevronDown, ChevronUp, Upload, Mic, Edit, Plus, Save, TestTube, Wand2 } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import QuestionEditor from "../components/form-builder/QuestionEditor";
import { Form, Question } from "shared/schema";
import { useToast } from "../hooks/use-toast";

// This simulates fetching the form data
// In a real app, this would be a call to an API endpoint
const fetchForm = async (id: string): Promise<Form & { questions: Question[] }> => {
  // Placeholder for API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: parseInt(id),
        userId: 1,
        categoryId: null,
        title: "Customer Feedback Survey",
        description: "Get feedback from customers about our service",
        status: "draft",
        isActive: true,
        emailNotificationEnabled: true,
        emailRecipients: null,
        emailSubject: null,
        emailTemplate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [
          {
            id: 1,
            formId: parseInt(id),
            text: "What is your overall satisfaction with our service?",
            type: "rating",
            order: 1,
            options: ["1 - Very Dissatisfied", "2", "3", "4", "5 - Very Satisfied"],
            required: true,
            createdAt: new Date()
          },
          {
            id: 2,
            formId: parseInt(id),
            text: "Would you recommend our product to others?",
            type: "multiple_choice",
            order: 2,
            options: ["Yes", "No"],
            required: true,
            createdAt: new Date()
          },
          {
            id: 3,
            formId: parseInt(id),
            text: "Do you have any additional comments?",
            type: "text",
            order: 3,
            options: null,
            required: true,
            createdAt: new Date()
          }
        ]
      });
    }, 500);
  });
};

export default function EditForm() {
  const { toast } = useToast();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const [formName, setFormName] = useState<string>("");
  const [formDescription, setFormDescription] = useState<string>("");
  const [collectEmail, setCollectEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
    id: string | number;
    text: string;
    type: string;
    required: boolean;
    order: number;
    options: string[] | null;
  };
  
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [voiceType, setVoiceType] = useState<string>("male");
  
  // Fetch form data when component mounts
  useEffect(() => {
    const loadFormData = async () => {
      if (params.id) {
        try {
          setIsLoading(true);
          const formData = await fetchForm(params.id);
          
          setFormName(formData.title);
          setFormDescription(formData.description || "");
          setCollectEmail(formData.emailNotificationEnabled || false);
          
          // Convert API questions to the format expected by the component
          const formattedQuestions = formData.questions.map((q: Question) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required === null ? false : q.required,
            order: q.order,
            options: Array.isArray(q.options) ? q.options : null
          } as QuestionType));
          
          setQuestions(formattedQuestions as QuestionType[]);
        } catch (error) {
          console.error("Error loading form data:", error);
          toast({
            title: "Error",
            description: "Failed to load form data. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadFormData();
  }, [params.id, toast]);
  
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
  
  const handleSave = () => {
    // TODO: Save form logic
    toast({
      title: "Form Updated",
      description: "Your form has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setLocation("/forms");
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 max-w-5xl">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading form data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Edit Form
          </h1>
          <p className="text-muted-foreground">Update your voice-enabled form by editing questions and configuring options</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setLocation(`/forms/draft/test/${params.id}`)}
          >
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
                <Switch 
                  id="collectEmail" 
                  checked={collectEmail} 
                  onCheckedChange={setCollectEmail}
                />
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
                  <Tabs value={voiceType} onValueChange={setVoiceType} className="w-full">
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
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button className="flex items-center gap-2" onClick={handleSave}>
            <Save size={16} />
            Save Form
          </Button>
        </div>
      </div>
    </div>
  );
}