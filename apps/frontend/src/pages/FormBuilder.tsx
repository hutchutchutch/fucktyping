import React, { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Switch } from "@ui/switch";
import { Label } from "@ui/label";
import { Separator } from "@ui/separator";
import { ChevronDown, ChevronUp, Upload, Mic, Edit, Plus, Save, TestTube, Wand2, Trash } from "lucide-react";
import AppLayout from "@components/layout/AppLayout";
import { useForm } from '@hooks/useForm';
import QuestionEditor from '@components/form-builder/QuestionEditor';
import Modal from '@/components/common/Modal';
import { Skeleton } from '@ui/skeleton';
import { FormBuilderForm as SchemaFormBuilderForm, FormBuilderQuestion as SchemaFormBuilderQuestion } from "@schemas/schema";
import type { ExtendedFormBuilderQuestion } from "@hooks/useForm";
import { Link } from "wouter";

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
  
  const {
    form, // This is SchemaForm & { questions: SchemaQuestion[] } | undefined
    questions: formQuestionsFromHook, // This is ExtendedFormBuilderQuestion[]
    isFormLoading,
    createForm,
    updateForm,
    addQuestion: addQuestionToHook,
    removeQuestion: removeQuestionFromHook,
    updateQuestion: updateQuestionInHook,
  } = useForm(id); // Pass id to useForm
  
  // Add local state for modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  // currentQuestion should align with the type used by the hook and QuestionEditor
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedFormBuilderQuestion | null>(null);

  // This function is likely for a modal, ensure `question` param matches what modal provides
  const handleSaveQuestion = (questionData: ExtendedFormBuilderQuestion) => {
    // questionData is already ExtendedFormBuilderQuestion, or should be
    // The ID handling needs to be robust: existing questions have persistent IDs, new ones get temporary.
    // The useForm hook's addQuestion and updateQuestionInList handle this.

    const questionExists = formQuestionsFromHook.find(q => q.id === questionData.id);

    if (questionExists) {
      const existingIndex = formQuestionsFromHook.findIndex(q => q.id === questionData.id);
      if (existingIndex !== -1) {
        updateQuestionInHook(existingIndex, questionData);
      }
    } else {
      // For truly new questions, addQuestionToHook will assign a temporary ID if needed
      addQuestionToHook(questionData);
    }
    setShowQuestionModal(false);
    setCurrentQuestion(null); // Reset current question
  };

  const handleSaveForm = async () => {
    const formData: SchemaFormBuilderForm = { // Use imported SchemaFormBuilderForm
      id: form?.id, // form.id is number
      title: formName,
      description: formDescription,
      status: form?.status || 'draft',
      requireAuth: form?.requireAuth || false,
      allowVoice: form?.allowVoice || false,
      emailNotification: form?.emailNotification || false,
      limitOneResponse: form?.limitOneResponse || false,
      emailSubject: form?.emailSubject || null,
      emailRecipients: form?.emailRecipients || null,
      emailTemplate: form?.emailTemplate || null
    };
    
    if (formData.id) {
      await updateForm.mutateAsync({ id: formData.id.toString(), formData });
    } else {
      await createForm.mutateAsync(formData);
    }
  };

  const updateFormField = (field: keyof SchemaFormBuilderForm, value: SchemaFormBuilderForm[keyof SchemaFormBuilderForm]) => {
    if (form) {
      // Create a new object that matches SchemaFormBuilderForm for the mutation
      const updatedFormData: Partial<SchemaFormBuilderForm> = {
        title: formName, // Assuming formName and formDescription are up-to-date
        description: formDescription,
        // Include other fields from form that are part of SchemaFormBuilderForm
        status: form.status,
        requireAuth: form.requireAuth,
        allowVoice: form.allowVoice,
        emailNotification: form.emailNotification,
        limitOneResponse: form.limitOneResponse,
        emailSubject: form.emailSubject,
        emailRecipients: form.emailRecipients,
        emailTemplate: form.emailTemplate,
        [field]: value, // Apply the specific change
      };
      // Remove id if it's undefined, as SchemaFormBuilderForm id is optional
      if (form.id === undefined) {
        delete updatedFormData.id;
      } else {
        updatedFormData.id = form.id;
      }

      updateForm.mutate({ id: form.id.toString(), formData: updatedFormData as SchemaFormBuilderForm });
    }
  };
  
  // Use formQuestions from the hook
  const questions: ExtendedFormBuilderQuestion[] = formQuestionsFromHook || [];
  
  const toggleSection = (section: SectionType) => {
    setIsCollapsed({
      ...isCollapsed,
      [section]: !isCollapsed[section]
    });
  };
  
  const openAddQuestionModal = () => {
    setCurrentQuestion(null); // No current question means "add new"
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (question: ExtendedFormBuilderQuestion) => {
    setCurrentQuestion(question);
    setShowQuestionModal(true);
  };
  
  // Show loading skeleton
  if (isFormLoading) {
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

  // The FormBuilderComponent was a placeholder, defaulting to the main implementation below.
  // If a separate FormBuilderComponent is to be used, it needs to be properly imported and defined.

  // Original implementation:
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
             {form?.id && (
              <Link href={`/forms/${form.id}/test`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <TestTube size={18} />
                  Test Form
                </Button>
              </Link>
            )}
            <Button className="flex items-center gap-2" disabled> {/* TODO: Implement AI form generation */}
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
                    checked={form?.requireAuth || false}
                    onCheckedChange={(checked) => updateFormField('requireAuth', checked)}
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
                    <Button size="sm" variant="outline" className="h-8 flex items-center gap-1" disabled> {/* TODO: Implement variables */}
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
                        <Button size="sm" variant="ghost" className="h-8 gap-1" disabled> {/* TODO: Implement voice agent intro editing */}
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
                        <TabsTrigger value="custom" disabled>Custom</TabsTrigger> {/* TODO: Implement custom voice */}
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
                    <Button size="sm" onClick={openAddQuestionModal} className="h-8 flex items-center gap-1">
                      <Plus size={16} />
                      Add Question
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-muted rounded-md p-4 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openEditQuestionModal(question)} className="mr-1">
                            <Edit size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeQuestionFromHook(index)} className="text-destructive hover:text-destructive-foreground">
                            <Trash size={14} />
                          </Button>
                        </div>
                        <h4 className="font-medium mb-2">Question {index + 1}: {question.text}</h4>
                        <p className="text-sm text-muted-foreground">Type: {question.type}</p>
                        {question.options && question.options.length > 0 && (
                          <p className="text-sm text-muted-foreground">Options: {question.options.join(', ')}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Required: {question.required ? 'Yes' : 'No'}</p>
                         {/* Displaying question details directly for now. QuestionEditor will be used in modal */}
                      </div>
                    ))}
                    {questions.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No questions added yet.</p>
                    )}
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
                        <Button size="sm" variant="ghost" className="h-8 gap-1" disabled> {/* TODO: Implement closing message editing */}
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
                      <Button size="sm" variant="outline" className="h-8 flex items-center gap-1" disabled> {/* TODO: Implement knowledge base upload */}
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
            <Link href="/forms">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button className="flex items-center gap-2" onClick={handleSaveForm}>
              <Save size={16} />
              Save Form
            </Button>
          </div>
        </div>
      </div>
      {showQuestionModal && (
        <Modal
            open={showQuestionModal}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setShowQuestionModal(false);
                setCurrentQuestion(null);
              }
            }}
            title={currentQuestion ? "Edit Question" : "Add New Question"}
        >
          <QuestionEditor
            question={currentQuestion || undefined} // Pass undefined if new, or currentQuestion if editing
            onChange={handleSaveQuestion} // handleSaveQuestion now expects ExtendedFormBuilderQuestion
            // The QuestionEditor's onCancel can be used to trigger the Modal's onOpenChange logic
            onCancel={() => {
                setShowQuestionModal(false);
                setCurrentQuestion(null);
            }}
            // onRemove is not directly used here as QuestionEditor's onRemove is for its internal state.
            // Deletion is handled by the Trash icon next to each question in the list.
          />
        </Modal>
      )}
    </AppLayout>
  );
}
