import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@lib/queryClient";
import { useToast } from "@hooks/use-toast";
import type {
  Question as SchemaQuestion,
  Form as SchemaForm,
  FormBuilderForm as SchemaFormBuilderForm,
  FormBuilderQuestion as SchemaFormBuilderQuestion
} from "@schemas/schema";

// Interface for the form data returned by the API, including questions
interface FormWithQuestions extends SchemaForm {
  questions: SchemaQuestion[];
}

// Extended question type used within this hook and FormBuilder page
export interface ExtendedFormBuilderQuestion extends SchemaFormBuilderQuestion {
  helpText?: string; // Specific to UI interactions or additional hints
}

export function useForm(formId?: string) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ExtendedFormBuilderQuestion[]>([]);
  
  // Fetch form if editing an existing form
  const { data: form, isLoading: isFormLoading } = useQuery({
    queryKey: formId ? [`/api/forms/${formId}`] : [],
    enabled: !!formId,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/forms/${formId}`);
      const formData = await response.json() as FormWithQuestions; // API returns Form with Question[]
      if (formData.questions) {
        // Convert SchemaQuestion[] to ExtendedFormBuilderQuestion[]
        setQuestions(formData.questions.map((q: SchemaQuestion) => ({
          id: q.id, // number
          text: q.text, // string
          type: q.type, // string (specific values like 'text', 'multiple_choice')
          required: q.required, // boolean
          order: q.order, // number
          options: q.options || null, // string[] | null
          description: q.settings?.description || undefined, // Optional: map from q.settings or leave undefined
          helpText: q.helpText || undefined, // Map from SchemaQuestion.helpText
          validation: q.settings?.validation || undefined, // Optional: map from q.settings
        })));
      }
      return formData; // This is SchemaForm & { questions: SchemaQuestion[] }
    }
  });
  
  // Create new form
  const createForm = useMutation({
    mutationFn: async (formData: SchemaFormBuilderForm) => { // Use imported SchemaFormBuilderForm
      const response = await apiRequest("POST", "/api/forms", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Form created successfully",
      });
      
      // Create questions for the new form
      if (questions.length > 0) {
        questions.forEach(async (question, index) => {
          await createQuestion.mutateAsync({
            text: question.text, // from ExtendedFormBuilderQuestion
            type: question.type, // from ExtendedFormBuilderQuestion
            required: question.required, // from ExtendedFormBuilderQuestion
            order: index + 1, // number
            options: question.options, // from ExtendedFormBuilderQuestion (string[] | null)
            formId: data.id, // number, from created form
            description: question.description, // from ExtendedFormBuilderQuestion
            // helpText is part of ExtendedFormBuilderQuestion, but API for creating question might expect it in 'settings' or similar
            // For now, pass description. API might need adjustment or a mapping here.
            // settings: { description: question.description, helpText: question.helpText } // Example
          } as Omit<SchemaFormBuilderQuestion, 'id'> & { formId: number; description?: string; helpText?: string } );
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create form: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Update existing form
  const updateForm = useMutation({
    mutationFn: async ({ id, formData }: { id: string, formData: SchemaFormBuilderForm }) => { // Use imported SchemaFormBuilderForm
      const response = await apiRequest("PUT", `/api/forms/${id}`, formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Form updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update form: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Create a question
  const createQuestion = useMutation({
    // questionData should align with what the API expects for creating a question.
    // This typically comes from SchemaFormBuilderQuestion or a subset.
    mutationFn: async (questionData: Omit<SchemaFormBuilderQuestion, 'id'> & { formId: number; description?: string; helpText?: string }) => {
      const response = await apiRequest("POST", "/api/questions", questionData);
      return response.json();
    },
    onSuccess: () => {
      if (formId) {
        queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      }
    }
  });
  
  // Update a question
  const updateQuestion = useMutation({
    mutationFn: async ({ id, questionData }: { id: number, questionData: Partial<SchemaFormBuilderQuestion> }) => {
      const response = await apiRequest("PUT", `/api/questions/${id}`, questionData);
      return response.json();
    },
    onSuccess: () => {
      if (formId) {
        queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      }
    }
  });
  
  // Delete a question
  const deleteQuestion = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/questions/${id}`, null);
      return response.json();
    },
    onSuccess: () => {
      if (formId) {
        queryClient.invalidateQueries({ queryKey: [`/api/forms/${formId}`] });
      }
    }
  });
  
  // Add a question to the current form (local state)
  const addQuestion = (question: Partial<ExtendedFormBuilderQuestion>) => {
    const newQuestion: ExtendedFormBuilderQuestion = {
      // Ensure all fields of ExtendedFormBuilderQuestion are covered
      id: questions.length + Date.now(), // Temporary unique ID for new questions before saving
      text: question.text || "New Question",
      type: question.type || "text",
      required: question.required ?? false,
      order: questions.length + 1,
      options: question.options || null,
      description: question.description || "",
      helpText: question.helpText || "",
      validation: question.validation || undefined, // from SchemaFormBuilderQuestion
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  // Remove a question from the current form
  const removeQuestion = (index: number) => {
    const questionToRemove = questions[index];
    
    // ID from ExtendedFormBuilderQuestion is number
    if (questionToRemove.id && formId) {
      // If it's an existing question (has a persisted ID), delete it from the server
      // New questions might have temporary IDs not meant for server deletion yet.
      // This logic might need refinement based on how new vs. existing question IDs are handled.
      // For now, assuming any question with an ID that came from the server should be deleted.
      // The `createQuestion` mutation adds questions to the server after form creation.
      deleteQuestion.mutate(questionToRemove.id as number);
    }
    
    // Remove from local state
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  // Update a question in the current form
  const updateQuestionInList = (index: number, updatedQuestion: Partial<ExtendedFormBuilderQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion } as ExtendedFormBuilderQuestion;
    setQuestions(newQuestions);
    
    // If it's an existing question and we're editing a form, update on server
    if (formId && newQuestions[index].id && typeof newQuestions[index].id === 'number') {
      updateQuestion.mutate({
        id: newQuestions[index].id as number,
        questionData: updatedQuestion
      });
    }
  };
  
  return {
    form,
    questions,
    isFormLoading,
    createForm,
    updateForm,
    addQuestion,
    removeQuestion,
    updateQuestion: updateQuestionInList
  };
}
