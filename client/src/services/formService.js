/**
 * Service for interacting with form-related API endpoints
 */
import { get, post, put, del } from './api';

/**
 * Get all forms for the current user
 * @returns {Promise<Array>} Array of forms
 */
export async function getForms() {
  const response = await get('/api/forms');
  return response.json();
}

/**
 * Get a specific form by ID
 * @param {number|string} formId - ID of the form to fetch
 * @returns {Promise<Object>} Form data
 */
export async function getForm(formId) {
  const response = await get(`/api/forms/${formId}`);
  return response.json();
}

/**
 * Create a new form
 * @param {Object} formData - Form data to create
 * @returns {Promise<Object>} Created form data
 */
export async function createForm(formData) {
  const response = await post('/api/forms', formData);
  return response.json();
}

/**
 * Update an existing form
 * @param {number|string} formId - ID of the form to update
 * @param {Object} formData - Updated form data
 * @returns {Promise<Object>} Updated form data
 */
export async function updateForm(formId, formData) {
  const response = await put(`/api/forms/${formId}`, formData);
  return response.json();
}

/**
 * Delete a form
 * @param {number|string} formId - ID of the form to delete
 * @returns {Promise<void>}
 */
export async function deleteForm(formId) {
  await del(`/api/forms/${formId}`);
}

/**
 * Get questions for a specific form
 * @param {number|string} formId - ID of the form
 * @returns {Promise<Array>} Array of questions
 */
export async function getQuestions(formId) {
  const response = await get(`/api/forms/${formId}/questions`);
  return response.json();
}

/**
 * Create a new question for a form
 * @param {number|string} formId - ID of the form
 * @param {Object} questionData - Question data to create
 * @returns {Promise<Object>} Created question data
 */
export async function createQuestion(formId, questionData) {
  const response = await post(`/api/forms/${formId}/questions`, questionData);
  return response.json();
}

/**
 * Update an existing question
 * @param {number|string} questionId - ID of the question to update
 * @param {Object} questionData - Updated question data
 * @returns {Promise<Object>} Updated question data
 */
export async function updateQuestion(questionId, questionData) {
  const response = await put(`/api/questions/${questionId}`, questionData);
  return response.json();
}

/**
 * Delete a question
 * @param {number|string} questionId - ID of the question to delete
 * @returns {Promise<void>}
 */
export async function deleteQuestion(questionId) {
  await del(`/api/questions/${questionId}`);
}

/**
 * Get responses for a specific form
 * @param {number|string} formId - ID of the form
 * @returns {Promise<Array>} Array of responses
 */
export async function getResponses(formId) {
  const response = await get(`/api/forms/${formId}/responses`);
  return response.json();
}

/**
 * Get a specific response by ID
 * @param {number|string} responseId - ID of the response to fetch
 * @returns {Promise<Object>} Response data
 */
export async function getResponse(responseId) {
  const response = await get(`/api/responses/${responseId}`);
  return response.json();
}

/**
 * Submit a response to a form
 * @param {number|string} formId - ID of the form
 * @param {Object} responseData - Response data to submit
 * @returns {Promise<Object>} Submitted response data
 */
export async function submitResponse(formId, responseData) {
  const response = await post(`/api/forms/${formId}/responses`, responseData);
  return response.json();
}

/**
 * Generate a shareable link for a form
 * @param {number|string} formId - ID of the form
 * @returns {Promise<Object>} Object containing the share link
 */
export async function generateShareLink(formId) {
  const response = await post(`/api/forms/${formId}/share`);
  return response.json();
}

/**
 * Get analytics for a specific form
 * @param {number|string} formId - ID of the form
 * @returns {Promise<Object>} Analytics data
 */
export async function getFormAnalytics(formId) {
  const response = await get(`/api/forms/${formId}/analytics`);
  return response.json();
}

/**
 * Publish a form (change status from draft to active)
 * @param {number|string} formId - ID of the form to publish
 * @returns {Promise<Object>} Updated form data
 */
export async function publishForm(formId) {
  const response = await post(`/api/forms/${formId}/publish`);
  return response.json();
}

/**
 * Archive a form (change status to archived)
 * @param {number|string} formId - ID of the form to archive
 * @returns {Promise<Object>} Updated form data
 */
export async function archiveForm(formId) {
  const response = await post(`/api/forms/${formId}/archive`);
  return response.json();
}
