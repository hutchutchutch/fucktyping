/**
 * Service for managing conversation state and flow
 */
import { post, get } from '@services/api';

/**
 * Initialize a new conversation for a form response
 * @param {number|string} formId - ID of the form
 * @returns {Promise<Object>} Conversation state
 */
export async function initializeConversation(formId) {
  try {
    const response = await post('/api/conversations', { formId });
    return response.json();
  } catch (error) {
    console.error('Error initializing conversation:', error);
    throw new Error('Failed to initialize conversation. Please try again.');
  }
}

/**
 * Get the current state of a conversation
 * @param {number|string} conversationId - ID of the conversation
 * @returns {Promise<Object>} Current conversation state
 */
export async function getConversationState(conversationId) {
  try {
    const response = await get(`/api/conversations/${conversationId}`);
    return response.json();
  } catch (error) {
    console.error('Error getting conversation state:', error);
    throw new Error('Failed to retrieve conversation state.');
  }
}

/**
 * Process user input in a conversation
 * @param {number|string} conversationId - ID of the conversation
 * @param {Object} userInput - User's input (text or audio)
 * @returns {Promise<Object>} Updated conversation state and next action
 */
export async function processConversationInput(conversationId, userInput) {
  try {
    const response = await post(`/api/conversations/${conversationId}/input`, userInput);
    return response.json();
  } catch (error) {
    console.error('Error processing conversation input:', error);
    throw new Error('Failed to process your input. Please try again.');
  }
}

/**
 * Get the next question in a conversation
 * @param {number|string} conversationId - ID of the conversation
 * @returns {Promise<Object>} Next question and conversation state
 */
export async function getNextQuestion(conversationId) {
  try {
    const response = await get(`/api/conversations/${conversationId}/next`);
    return response.json();
  } catch (error) {
    console.error('Error getting next question:', error);
    throw new Error('Failed to get the next question.');
  }
}

/**
 * Save an answer in a conversation
 * @param {number|string} conversationId - ID of the conversation
 * @param {Object} answer - The answer to save
 * @returns {Promise<Object>} Updated conversation state
 */
export async function saveAnswer(conversationId, answer) {
  try {
    const response = await post(`/api/conversations/${conversationId}/answer`, answer);
    return response.json();
  } catch (error) {
    console.error('Error saving answer:', error);
    throw new Error('Failed to save your answer. Please try again.');
  }
}

/**
 * Complete a conversation and finalize the form response
 * @param {number|string} conversationId - ID of the conversation
 * @returns {Promise<Object>} Final response data
 */
export async function completeConversation(conversationId) {
  try {
    const response = await post(`/api/conversations/${conversationId}/complete`);
    return response.json();
  } catch (error) {
    console.error('Error completing conversation:', error);
    throw new Error('Failed to complete the conversation. Please try again.');
  }
}

/**
 * Get the conversation message history
 * @param {number|string} conversationId - ID of the conversation
 * @returns {Promise<Array>} Array of conversation messages
 */
export async function getConversationHistory(conversationId) {
  try {
    const response = await get(`/api/conversations/${conversationId}/messages`);
    return response.json();
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw new Error('Failed to retrieve conversation history.');
  }
}

/**
 * Handle a follow-up question from the AI
 * @param {number|string} conversationId - ID of the conversation
 * @param {Object} followUpData - Follow-up question and context
 * @returns {Promise<Object>} Updated conversation state
 */
export async function handleFollowUp(conversationId, followUpData) {
  try {
    const response = await post(`/api/conversations/${conversationId}/follow-up`, followUpData);
    return response.json();
  } catch (error) {
    console.error('Error handling follow-up:', error);
    throw new Error('Failed to process follow-up question.');
  }
}
