import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FormWithQuestions, Question } from "@shared/schema";

export function useForm(formId?: string) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Fetch form if editing an existing form
  const { data: form, isLoading: isFormLoading } = useQuery<FormWithQuestions>({
    queryKey: formId ? [`/api/forms/${formId}`] : null,
    enabled: !!formId,
    onSuccess: (formData) => {
      if (formData.questions) {
        setQuestions(formData.questions);
      }
    }
  });
  
  // Create new form
  const createForm = useMutation({
    mutationFn: async (formData: any) => {
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
        const questionsWithFormId = questions.map(q => ({
          ...q,
          formId: data.id
        }));
        
        questions.forEach(async (question, index) => {
          await createQuestion.mutateAsync({
            ...question,
            formId: data.id,
            order: index + 1
          });
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create form: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Update existing form
  const updateForm = useMutation({
    mutationFn: async ({ id, formData }: { id: string, formData: any }) => {
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
        description: `Failed to update form: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Create a question
  const createQuestion = useMutation({
    mutationFn: async (questionData: any) => {
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
    mutationFn: async ({ id, questionData }: { id: number, questionData: any }) => {
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
  
  // Add a question to the current form
  const addQuestion = (question: Partial<Question>) => {
    const newQuestion = {
      id: questions.length + 1,
      formId: formId ? parseInt(formId) : 0,
      text: question.text || "",
      type: question.type || "text",
      order: questions.length + 1,
      options: question.options || null,
      required: question.required ?? true,
      createdAt: new Date()
    };
    
    setQuestions([...questions, newQuestion]);
  };
  
  // Remove a question from the current form
  const removeQuestion = (index: number) => {
    const questionToRemove = questions[index];
    
    if (questionToRemove.id && typeof questionToRemove.id === 'number' && formId) {
      // If it's an existing question (has a numeric ID), delete it from the server
      deleteQuestion.mutate(questionToRemove.id);
    }
    
    // Remove from local state
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  // Update a question in the current form
  const updateQuestionInList = (index: number, updatedQuestion: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updatedQuestion };
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
