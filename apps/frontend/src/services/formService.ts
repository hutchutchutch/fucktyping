import { api } from "@services/api";
import {  Form, FormWithQuestions, Question, Response  } from "@schemas/schema";

export const formService = {
  // Form operations
  getForms: async (): Promise<Form[]> => {
    return api.getForms();
  },
  
  getForm: async (id: string): Promise<FormWithQuestions> => {
    return api.getForm(id);
  },
  
  createForm: async (formData: Partial<Form>, questions: Partial<Question>[] = []): Promise<Form> => {
    // Create the form first
    const form = await api.createForm({
      ...formData,
      userId: 1, // Mock user ID - in a real app, this would come from auth
    });
    
    // Then create all questions
    if (questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        await api.createQuestion({
          ...questions[i],
          formId: form.id,
          order: i + 1
        });
      }
    }
    
    return form;
  },
  
  updateForm: async (id: string, formData: Partial<Form>): Promise<Form> => {
    return api.updateForm(id, formData);
  },
  
  deleteForm: async (id: string): Promise<void> => {
    await api.deleteForm(id);
  },
  
  // Question operations
  getQuestions: async (formId: string): Promise<Question[]> => {
    return api.getQuestions(formId);
  },
  
  createQuestion: async (questionData: Partial<Question>): Promise<Question> => {
    return api.createQuestion(questionData);
  },
  
  updateQuestion: async (id: number, questionData: Partial<Question>): Promise<Question> => {
    return api.updateQuestion(id, questionData);
  },
  
  deleteQuestion: async (id: number): Promise<void> => {
    await api.deleteQuestion(id);
  },
  
  // Response operations
  getResponses: async (formId: string): Promise<Response[]> => {
    return api.getResponses(formId);
  },
  
  getResponse: async (id: number): Promise<Response> => {
    return api.getResponse(id);
  },
  
  submitFormResponse: async (
    formId: string, 
    respondentName: string, 
    respondentEmail: string, 
    answers: { questionId: number, answerText: string }[]
  ): Promise<{ responseId: number }> => {
    return api.submitFormResponse(formId, {
      respondentName,
      respondentEmail,
      answers
    });
  }
};
