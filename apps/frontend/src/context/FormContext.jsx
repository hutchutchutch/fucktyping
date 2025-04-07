import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@services/api";
import { useNotification } from "@components/common/Notification";
import { useAuthContext } from "@context/AuthContext";

const FormContext = createContext(null);

export function FormProvider({ children }) {
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState({
    title: "",
    description: "",
    status: "draft",
    requireAuth: false,
    allowVoice: true,
    emailNotification: false,
    limitOneResponse: false,
  });
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  const notification = useNotification();

  // Demo data for development
  const demoForms = [
    {
      id: 1,
      title: "Customer Feedback Survey",
      description: "Get feedback from customers about our service",
      status: "active",
      createdAt: "2023-05-12T12:00:00Z",
      responseCount: 42,
    },
    {
      id: 2,
      title: "Job Application",
      description: "Application form for frontend developer position",
      status: "active",
      createdAt: "2023-04-28T12:00:00Z",
      responseCount: 16,
    },
    {
      id: 3,
      title: "Product Survey",
      description: "Survey about our new product features",
      status: "draft",
      createdAt: "2023-04-15T12:00:00Z",
      responseCount: 38,
    },
  ];

  const demoQuestions = [
    {
      id: 1,
      formId: 1,
      text: "What is your overall satisfaction with our service?",
      type: "rating",
      options: ["1 - Very Dissatisfied", "2", "3", "4", "5 - Very Satisfied"],
      required: true,
      order: 1,
    },
    {
      id: 2,
      formId: 1,
      text: "Would you recommend our product to others?",
      type: "yesno",
      options: ["Yes", "No"],
      required: true,
      order: 2,
    },
    {
      id: 3,
      formId: 1,
      text: "Do you have any additional comments?",
      type: "text",
      required: false,
      order: 3,
    },
  ];

  useEffect(() => {
    // Use demo data for development
    setForms(demoForms);
  }, []);

  const loadForm = async (formId) => {
    try {
      setIsLoading(true);
      // In real implementation, we would fetch from API:
      // const response = await apiRequest("GET", `/api/forms/${formId}`);
      // const data = await response.json();
      
      // Demo data for development
      const form = demoForms.find(f => f.id.toString() === formId.toString());
      const formQuestions = demoQuestions.filter(q => q.formId.toString() === formId.toString());
      
      if (form) {
        setCurrentForm(form);
        setQuestions(formQuestions);
      } else {
        notification.error("Form not found");
        navigate("/dashboard");
      }
    } catch (error) {
      notification.error("Failed to load form");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormField = (field, value) => {
    setCurrentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addQuestion = (question) => {
    // If question has an id, update it
    if (question.id) {
      setQuestions(prev => 
        prev.map(q => q.id === question.id ? question : q)
      );
    } else {
      // Otherwise add a new question
      const newId = Math.max(0, ...questions.map(q => q.id || 0)) + 1;
      const newQuestion = {
        ...question,
        id: newId,
        formId: currentForm.id,
        order: questions.length + 1,
      };
      setQuestions(prev => [...prev, newQuestion]);
    }
  };

  const removeQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const saveForm = async (asDraft = true) => {
    try {
      setIsSaving(true);
      
      const formData = {
        ...currentForm,
        userId: user?.id,
        status: asDraft ? 'draft' : 'active',
      };
      
      // In real implementation, we would save to API:
      // let response;
      // if (formData.id) {
      //   response = await apiRequest("PUT", `/api/forms/${formData.id}`, formData);
      // } else {
      //   response = await apiRequest("POST", "/api/forms", formData);
      // }
      // const savedForm = await response.json();
      
      // For demo purposes, simulate saving
      const savedForm = {
        ...formData,
        id: formData.id || Math.max(0, ...forms.map(f => f.id)) + 1,
        createdAt: formData.createdAt || new Date().toISOString(),
      };
      
      // Update forms list
      setForms(prev => {
        if (formData.id) {
          return prev.map(f => f.id === formData.id ? savedForm : f);
        } else {
          return [...prev, savedForm];
        }
      });
      
      // Update current form with saved form data
      setCurrentForm(savedForm);
      
      // Save questions
      // In real implementation, we would save questions to API
      
      return savedForm;
    } catch (error) {
      notification.error("Failed to save form");
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const publishForm = async () => {
    if (!currentForm.title) {
      notification.error("Please add a title before publishing");
      return;
    }
    
    if (questions.length === 0) {
      notification.error("Please add at least one question before publishing");
      return;
    }
    
    return saveForm(false);
  };

  const deleteForm = async (formId) => {
    try {
      setIsLoading(true);
      
      // In real implementation, we would delete from API:
      // await apiRequest("DELETE", `/api/forms/${formId}`);
      
      // Update forms list
      setForms(prev => prev.filter(f => f.id !== formId));
      
      notification.success("Form deleted successfully");
    } catch (error) {
      notification.error("Failed to delete form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContext.Provider
      value={{
        forms,
        currentForm,
        questions,
        isLoading,
        isSaving,
        loadForm,
        updateFormField,
        addQuestion,
        removeQuestion,
        saveForm,
        publishForm,
        deleteForm,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
