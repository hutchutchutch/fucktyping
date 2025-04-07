/**
 * Validation utilities for form and question data
 */
const validators = {
  /**
   * Validate form data
   * @param {Object} formData - The form data to validate
   * @returns {Object} - Validation result { isValid, errors }
   */
  validateForm: (formData) => {
    const errors = {};
    
    // Title is required
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required';
    }
    
    // Status should be one of: draft, active, archived
    if (formData.status && !['draft', 'active', 'archived'].includes(formData.status)) {
      errors.status = 'Status must be one of: draft, active, archived';
    }
    
    // Validate other fields as needed
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  /**
   * Validate question data
   * @param {Object} questionData - The question data to validate
   * @returns {Object} - Validation result { isValid, errors }
   */
  validateQuestion: (questionData) => {
    const errors = {};
    
    // Text is required
    if (!questionData.text || questionData.text.trim() === '') {
      errors.text = 'Question text is required';
    }
    
    // Type should be one of: text, multiple_choice, rating, date, etc.
    const validTypes = ['text', 'multiple_choice', 'rating', 'date', 'number', 'email', 'phone'];
    if (!questionData.type || !validTypes.includes(questionData.type)) {
      errors.type = `Question type must be one of: ${validTypes.join(', ')}`;
    }
    
    // Validate options for multiple choice questions
    if (questionData.type === 'multiple_choice') {
      if (!questionData.options || !Array.isArray(questionData.options) || questionData.options.length === 0) {
        errors.options = 'Multiple choice questions must have at least one option';
      }
    }
    
    // Order should be a positive number
    if (questionData.order !== undefined && (isNaN(questionData.order) || questionData.order < 0)) {
      errors.order = 'Order must be a positive number';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} - Whether the email is valid
   */
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Whether the phone number is valid
   */
  isValidPhone: (phone) => {
    if (!phone || typeof phone !== 'string') {
      return false;
    }
    
    // Remove common formatting characters
    const digitsOnly = phone.replace(/[-\s()]/g, '');
    
    // Check if it has a reasonable number of digits (7-15)
    return /^\+?\d{7,15}$/.test(digitsOnly);
  }
};

export default validators;