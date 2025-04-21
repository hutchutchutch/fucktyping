import { Form, Question, Response, Answer, User } from './schemas';

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Form-related types
// export type FormWithQuestions = Form & {
//   questions: Question[];
// };

export type FormWithStats = Form & {
  responseCount: number;
  completionRate: number;
  averageCompletionTime: number;
};

// Response-related types
// export type ResponseWithAnswers = Response & {
//   answers: Answer[];
//   form: Form;
// };

export type ResponseSummary = {
  completionRate: number;
  averageCompletionTime: number;
  sentimentScores: {
    positive: number;
    negative: number;
    neutral: number;
  };
  questionCompletion: Record<string, number>;
};

// WebRTC types
export interface RTCSignalData {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  sender: string;
  target?: string;
}

// Voice processing types
export interface AudioChunk {
  buffer: ArrayBuffer;
  sampleRate: number;
  timestamp: number;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

// LangGraph types
export interface NodeConfig {
  id: string;
  type: string;
  parameters: Record<string, any>;
}

export interface Edge {
  source: string;
  target: string;
  condition?: string;
}

export interface GraphConfig {
  nodes: NodeConfig[];
  edges: Edge[];
}

export interface ConversationInput {
  userInput: string;
  state: any;
}

export interface ConversationOutput {
  response: string;
  state: any;
  complete: boolean;
}

// Form builder types
export interface QuestionInput {
  text: string;
  type: string;
  options?: string[];
  isRequired?: boolean;
  validationRules?: Record<string, any>;
}

export interface FormInput {
  title: string;
  description?: string;
  questions: QuestionInput[];
  requiresAuth?: boolean;
  enableVoice?: boolean;
}