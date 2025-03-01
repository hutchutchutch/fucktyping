// state.js
import { ConversationStateSchema } from './schemas.js';

// Define the state schema for LangGraph
export const StateSchema = {
  schema: ConversationStateSchema
};

// Initialize a new conversation state
export function initializeState(formConfig) {
  return {
    formId: formConfig.id,
    conversationId: generateConversationId(),
    currentNodeId: "opening_activity",
    currentQuestionIndex: 0,
    responses: {},
    dynamicReferences: {},
    messages: [],
    currentAttempts: 0,
    isComplete: false,
    requiresFollowUp: false
  };
}

// Helper to generate a unique conversation ID
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Update the conversation state after a response
export function updateStateWithResponse(state, questionId, response) {
  const newState = { ...state };
  
  // Store the response
  newState.responses = {
    ...newState.responses,
    [questionId]: response
  };
  
  // Check if this needs to be stored as a dynamic reference
  const currentQuestion = getQuestionById(state, questionId);
  if (currentQuestion?.createDynamicReference && currentQuestion?.referenceName) {
    newState.dynamicReferences = {
      ...newState.dynamicReferences,
      [currentQuestion.referenceName]: response
    };
  }
  
  return newState;
}

// Helper function to get question by ID
function getQuestionById(state, questionId) {
  // This would typically fetch the question from the form config
  // For now, return a placeholder
  return {
    id: questionId,
    createDynamicReference: false,
    referenceName: null
  };
}

// Advance to the next question
export function advanceToNextQuestion(state) {
  const newState = { ...state };
  newState.currentQuestionIndex += 1;
  newState.currentAttempts = 0;
  return newState;
}

// Mark conversation as complete
export function completeConversation(state, requiresFollowUp = false) {
  return {
    ...state,
    isComplete: true,
    requiresFollowUp,
    currentNodeId: "end"
  };
}