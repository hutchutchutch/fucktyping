import { createContext, useContext, useState, ReactNode } from "react";
import { Form, Question, Response } from "@shared/schema";
import { useAuthContext } from "./AuthContext";

interface FormContextType {
  currentForm: Form | null;
  setCurrentForm: (form: Form | null) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  responses: Response[];
  setResponses: (responses: Response[]) => void;
  userId: number | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  return (
    <FormContext.Provider
      value={{
        currentForm,
        setCurrentForm,
        questions,
        setQuestions,
        responses,
        setResponses,
        userId: user?.id || null
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
}
