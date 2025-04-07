// API Routes
export const API_ROUTES = {
  FORMS: '/api/forms',
  QUESTIONS: '/api/questions',
  RESPONSES: '/api/responses',
  ANSWERS: '/api/answers',
  USERS: '/api/users',
  AUTH: '/api/auth',
  VOICE: '/api/voice',
  LANGGRAPH: '/api/langgraph'
};

// WebRTC Constants
export const WEBRTC_CONFIG = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ],
  iceCandidatePoolSize: 10
};

// Question Types
export const QUESTION_TYPES = {
  TEXT: 'text',
  MULTIPLE_CHOICE: 'multipleChoice',
  RATING: 'rating',
  YES_NO: 'yesNo',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date'
};

// Validation Rules
export const VALIDATION_RULES = {
  TEXT: {
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern'
  },
  NUMBER: {
    MIN: 'min',
    MAX: 'max'
  },
  EMAIL: {
    FORMAT: 'emailFormat'
  },
  PHONE: {
    FORMAT: 'phoneFormat'
  }
};

// Audio Processing
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,
  CHUNK_SIZE: 4096,
  ENCODING: 'LINEAR16',
  LANGUAGE_CODE: 'en-US'
};

// LangGraph Nodes
export const LANGGRAPH_NODES = {
  WELCOME: 'welcome',
  ASK_QUESTION: 'ask_question',
  VALIDATE_ANSWER: 'validate_answer',
  FOLLOW_UP: 'follow_up',
  COMPLETE: 'complete'
};

// Form Builder Defaults
export const FORM_DEFAULTS = {
  MAX_QUESTIONS: 20,
  MAX_OPTIONS: 10,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_QUESTION_TEXT_LENGTH: 300
};

// Sentiment Analysis Thresholds
export const SENTIMENT_THRESHOLDS = {
  POSITIVE: 0.4,
  NEGATIVE: -0.4
};