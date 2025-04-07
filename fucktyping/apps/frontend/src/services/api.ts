import { apiRequest } from "./lib/queryClient";

export const api = {
  // Forms
  getForms: async () => {
    const response = await fetch("/api/forms", { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching forms: ${response.statusText}`);
    return response.json();
  },
  
  getForm: async (id: string) => {
    const response = await fetch(`/api/forms/${id}`, { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching form: ${response.statusText}`);
    return response.json();
  },
  
  createForm: async (data: any) => {
    const response = await apiRequest("POST", "/api/forms", data);
    return response.json();
  },
  
  updateForm: async (id: string, data: any) => {
    const response = await apiRequest("PUT", `/api/forms/${id}`, data);
    return response.json();
  },
  
  deleteForm: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/forms/${id}`, null);
    return response.json();
  },
  
  // Questions
  getQuestions: async (formId: string) => {
    const response = await fetch(`/api/forms/${formId}/questions`, { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching questions: ${response.statusText}`);
    return response.json();
  },
  
  createQuestion: async (data: any) => {
    const response = await apiRequest("POST", "/api/questions", data);
    return response.json();
  },
  
  updateQuestion: async (id: number, data: any) => {
    const response = await apiRequest("PUT", `/api/questions/${id}`, data);
    return response.json();
  },
  
  deleteQuestion: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/questions/${id}`, null);
    return response.json();
  },
  
  // Responses
  getResponses: async (formId: string) => {
    const response = await fetch(`/api/forms/${formId}/responses`, { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching responses: ${response.statusText}`);
    return response.json();
  },
  
  getResponse: async (id: number) => {
    const response = await fetch(`/api/responses/${id}`, { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching response: ${response.statusText}`);
    return response.json();
  },
  
  submitFormResponse: async (formId: string, data: any) => {
    const response = await apiRequest("POST", `/api/forms/${formId}/submit`, data);
    return response.json();
  },
  
  // Stats
  getStats: async () => {
    const response = await fetch("/api/stats", { credentials: "include" });
    if (!response.ok) throw new Error(`Error fetching stats: ${response.statusText}`);
    return response.json();
  }
};
