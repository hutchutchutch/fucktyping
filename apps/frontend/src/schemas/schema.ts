// Frontend schema types
// Temporary schema file until shared schema is properly implemented

// Base form interface used in FormBuilder.tsx
export interface FormBuilderForm {
  id?: number;
  title: string;
  description: string;
  status?: 'draft' | 'active' | 'archived';
  requireAuth?: boolean;
  allowVoice?: boolean;
  emailNotification?: boolean;
  limitOneResponse?: boolean;
  emailSubject?: string | null;
  emailRecipients?: string | null;
  emailTemplate?: string | null;
}

// Base type for forms
export interface Form extends FormBuilderForm {
  id: number;
  status: 'draft' | 'active' | 'archived';
  createdAt: string | Date;
  updatedAt: string | Date;
  categoryId?: number;
  userId?: number;
  isActive?: boolean;
  emailNotificationEnabled?: boolean; // Alias for emailNotification used in mockData
}

// Question type for FormBuilder
export interface FormBuilderQuestion {
  id: number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
  description?: string;
  validation?: {
    min: number;
    max: number;
  };
}

// Question type
export interface Question {
  id: number;
  formId: number;
  text: string;
  type: 'text' | 'multipleChoice' | 'multiple_choice' | 'rating' | 'boolean' | 'date' | 'email' | 'phone' | 'textarea' | 'yes_no';
  required: boolean;
  order: number;
  options?: string[] | null;
  helpText?: string;
  settings?: Record<string, any>;
  createdAt?: string | Date;
}

// Response type
export interface Response {
  id: number;
  formId: number;
  questionId: number;
  text: string;
  createdAt: string | Date;
  userId?: number;
  clientId?: string;
  metadata?: Record<string, any>;
  completedAt?: string | Date | null;
  respondentName?: string;
  respondentEmail?: string;
}

// Category type
export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  userId?: number;
  createdAt?: string | Date;
}

// Extended types
export interface FormWithQuestions extends Form {
  questions?: Question[];
  responseCount?: number;
}

export interface FormWithStats extends Form {
  id: number;
  title: string;
  responseCount: number;
  completionRate: number;
  averageCompletionTime: number;
  stats?: {
    responses: number;
    views: number;
    completionRate: number;
    averageTime: number;
  };
}

export interface CategoryWithStats extends Category {
  forms?: number[] | FormWithQuestions[];
  formCount: number;
  responseRate?: number | null;
  completionRate?: number | null;
  averageSentiment?: number | null;
  stats?: Record<string, any>;
  createdAt?: string | Date;
}

export interface ResponseWithMetadata extends Response {
  question?: Question;
  metadata?: {
    sentiment?: number;
    keywords?: string[];
    processingTime?: number;
    audioLength?: number;
    transcriptionSource?: string;
  };
}

// Answer interface
export interface Answer {
  questionId: number;
  answerText: string;
  [key: string]: any;
}

export interface ResponseWithAnswers {
  id: number;
  formId: number;
  answers: Answer[];
  createdAt: string | Date;
  completedAt: string | Date;
  clientId?: string;
  metadata?: Record<string, any>;
  respondentName?: string;
  respondentEmail?: string;
}

// Graph/flow types
export interface FormFlow {
  id: number;
  formId: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FlowNode {
  id: string;
  type: 'question' | 'condition' | 'action' | 'start' | 'end';
  data: Record<string, any>;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'conditional';
  data?: Record<string, any>;
}