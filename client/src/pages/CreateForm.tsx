import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { ChevronDown, ChevronUp, Upload, Mic, Edit, Plus, Save, TestTube, Wand2, X } from "lucide-react";
import QuestionEditor from "../components/form-builder/QuestionEditor";
import { Badge } from "../components/ui/badge";
import {downloadGraphFile} from '../services/generateGraphFileContent'
import { api } from "../services/api.ts";

export default function CreateForm() {
  const [, setLocation] = useLocation();
  
  const [formName, setFormName] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  
  // Dynamic variables state
  const [variables, setVariables] = useState<string[]>([]);
  const [newVariable, setNewVariable] = useState("");
  
  type SectionType = 'opening' | 'questions' | 'closing';
  
  type SectionState = {
    [key in SectionType]: boolean;
  };
  
  const [isCollapsed, setIsCollapsed] = useState<SectionState>({
    opening: false,
    questions: false,
    closing: false
  });
  
  type QuestionType = {
    id: string;
    text: string;
    type: string;
    required: boolean;
    order: number;
    options: string[] | null;
  };
  
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  
  // Track which questions are being edited
  const [editingQuestions, setEditingQuestions] = useState<Record<string, boolean>>({});
  const [voiceType, setVoiceType] = useState<string>('male');
  
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
    return newQuestion; // Return the new question for reference
  };
  
  const handleSave = async () => {
    try {
      let obj = {
        title: formName,
        description: formDescription,
        dynamicVariables: variables,
        questions: questions.map((question) => ({
          ...question,
          options: question.options ? question.options : [],
        })),
        openingActivity: {
          text: "Hello, I'm your form assistant. I'll be guiding you through this form today. What's your name?",
          type: "voice",
        },
        status: 'active',
        categoryId: 1,
        credentials: "include",
        userId: 1,
        voiceType: voiceType,
      }
      const res = await api.createForm(obj)
      downloadGraphFile(formName, formDescription, variables, questions, voiceType);
      setLocation("/forms/draft/test");
    } catch (e) {
      console.error("Error saving form:", e);
    }
  };

  const handleCancel = () => {
    setLocation("/forms");
  };
  
  const addVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable)) {
      setVariables([...variables, newVariable]);
      setNewVariable("");
    }
  };
  
  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable));
  };
  
  // Modern, harmonious color palette
  const sectionColors = {
    opening: "bg-green-50/50 border-b",
    questions: "bg-purple-50/50 border-b",
    closing: "bg-red-50/50 border-b"
  };
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-1">
          <Input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="text-3xl font-bold border-none bg-transparent p-0 h-auto max-w-lg focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900"
            placeholder="Untitled Form"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1.5"
              onClick={() => setLocation("/forms/draft/test")}
            >
              <TestTube size={16} />
              Test Form
            </Button>
            <Button className="flex items-center gap-1.5">
              <Wand2 size={16} />
              Generate Form
            </Button>
          </div>
        </div>
        <div className="max-w-2xl">
          <Textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Add a description for your form"
            className="resize-none border-none focus-visible:ring-0 text-muted-foreground p-0 min-h-[40px]"
            rows={2}
          />
        </div>
      </div>
      
      <div className="space-y-6">
        
        {/* Dynamic Variables Section */}
        <Card className="overflow-hidden">
          <div className="bg-gray-50 border-b p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Dynamic Variables</div>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Enter variable name"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                  className="h-9 w-64"
                />
                <Button 
                  onClick={addVariable} 
                  size="sm" 
                  className="h-9 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {variables.length > 0 ? (
                variables.map((variable) => (
                  <Badge key={variable} variant="outline" className="px-3 py-1.5 flex items-center gap-1.5">
                    <span className="text-sm font-medium">{'{'}{variable}{'}'}</span>
                    <button 
                      onClick={() => removeVariable(variable)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No variables defined. Variables can be used in questions and prompts with {'{variable_name}'}.
                </p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Opening Activity (Voice Agent) */}
        <Card>
          <CardHeader 
            className={`cursor-pointer flex flex-row items-center justify-between ${sectionColors.opening}`}
          >
            <div onClick={() => toggleSection('opening')}>
              <CardTitle className="text-xl flex items-center">
                Opening Activity
              </CardTitle>
              <CardDescription>Configure how the voice agent introduces itself</CardDescription>
            </div>
            <div onClick={() => toggleSection('opening')} className="cursor-pointer">
              {isCollapsed.opening ? <ChevronDown /> : <ChevronUp />}
            </div>
          </CardHeader>
          
          {!isCollapsed.opening && (
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-4">
                  <div className="border rounded-full p-3 h-12 w-12 flex items-center justify-center bg-green-50">
                    <Mic size={20} className="text-green-600" />
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
                  <Tabs defaultValue="male"
                   onValueChange={(value)=> setVoiceType(value)} 
                   value={voiceType}
                   className="w-full">
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
            className={`cursor-pointer flex flex-row items-center justify-between ${sectionColors.questions}`}
          >
            <div onClick={() => toggleSection('questions')}>
              <CardTitle className="text-xl flex items-center">
                Questions
              </CardTitle>
              <CardDescription>Define the questions for your form</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isCollapsed.questions && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const newQuestion = addQuestion();
                    setEditingQuestions({
                      ...editingQuestions,
                      [newQuestion.id]: true
                    });
                    if (isCollapsed.questions) {
                      toggleSection('questions');
                    }
                  }} 
                  className="h-8 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Question
                </Button>
              )}
              <div onClick={() => toggleSection('questions')} className="cursor-pointer">
                {isCollapsed.questions ? <ChevronDown /> : <ChevronUp />}
              </div>
            </div>
          </CardHeader>
          
          {!isCollapsed.questions && (
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Questions</h3>
                </div>
                
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const isEditing = editingQuestions[question.id] || false;
                    
                    const toggleEditing = (e?: React.MouseEvent) => {
                      if (e) e.stopPropagation();
                      setEditingQuestions({
                        ...editingQuestions,
                        [question.id]: !isEditing
                      });
                    };
                    
                    return (
                      <div key={question.id} className="border border-muted rounded-md overflow-hidden">
                        {/* Question Header - Collapsed View */}
                        <div 
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/40"
                          onClick={toggleEditing}
                        >
                          <div>
                            <h4 className="font-medium">Question {index + 1}</h4>
                            <p className={`mt-1 ${isEditing ? "text-muted-foreground" : "font-medium"}`}>
                              {question.text || "New Question"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0" 
                              onClick={toggleEditing}
                            >
                              {isEditing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Remove from editing state and filter questions
                                const newEditingQuestions = {...editingQuestions};
                                delete newEditingQuestions[question.id];
                                setEditingQuestions(newEditingQuestions);
                                setQuestions(questions.filter(q => q.id !== question.id));
                              }}
                            >
                              <X size={18} />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Question Editor - Expanded View */}
                        {isEditing && (
                          <div className="p-4 pt-0 border-t">
                            <div className="space-y-4">
                              <QuestionEditor 
                                question={question} 
                                index={index}
                                onChange={(updatedQuestion) => {
                                  const newQuestions = [...questions];
                                  newQuestions[index] = updatedQuestion;
                                  setQuestions(newQuestions);
                                }}
                                onRemove={() => {
                                  // Remove from editing state and filter questions
                                  const newEditingQuestions = {...editingQuestions};
                                  delete newEditingQuestions[question.id];
                                  setEditingQuestions(newEditingQuestions);
                                  setQuestions(questions.filter(q => q.id !== question.id));
                                }}
                                onCancel={() => {
                                  // Just close the editor
                                  toggleEditing();
                                }}
                              />
                              
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Empty question state message */}
                  {questions.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No questions added yet. Click "Add Question" to get started.</p>
                    </div>
                  )}
                  
                  {/* Add Question button that appears below the last question */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 py-4 border-dashed border-purple-200 flex items-center justify-center gap-2 hover:bg-purple-50/50"
                    onClick={() => {
                      const newQuestion = addQuestion();
                      // Automatically open the editor for the new question
                      setEditingQuestions({
                        ...editingQuestions,
                        [newQuestion.id]: true
                      });
                    }}
                  >
                    <Plus size={18} />
                    <span>Add Question</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Closing Activity */}
        <Card>
          <CardHeader 
            className={`cursor-pointer flex flex-row items-center justify-between ${sectionColors.closing}`}
          >
            <div onClick={() => toggleSection('closing')}>
              <CardTitle className="text-xl flex items-center">
                Closing Activity
              </CardTitle>
              <CardDescription>Configure how the voice agent ends the conversation</CardDescription>
            </div>
            <div onClick={() => toggleSection('closing')} className="cursor-pointer">
              {isCollapsed.closing ? <ChevronDown /> : <ChevronUp />}
            </div>
          </CardHeader>
          
          {!isCollapsed.closing && (
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <div className="flex items-start gap-4">
                  <div className="border rounded-full p-3 h-12 w-12 flex items-center justify-center bg-red-50">
                    <Mic size={20} className="text-red-500" />
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