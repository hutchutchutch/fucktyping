/**
 * Utility functions for form and data validation
 */

/**
 * Check if a string is a valid email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid
 */
export function isValidUrl(url) {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if a password meets minimum requirements
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {boolean} True if valid
 */
export function isValidPassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = false
  } = options;
  
  if (!password || password.length < minLength) return false;
  
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/[0-9]/.test(password)) return false;
  if (requireSymbols && !/[^A-Za-z0-9]/.test(password)) return false;
  
  return true;
}

/**
 * Check if a phone number is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the cleaned number is between 10-15 digits
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Check if a string is empty or contains only whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty
 */
export function isEmpty(str) {
  return !str || str.trim() === '';
}

/**
 * Validate a form question
 * @param {Object} question - Question to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateQuestion(question) {
  const errors = {};
  
  if (isEmpty(question.text)) {
    errors.text = 'Question text is required';
  }
  
  if (!question.type) {
    errors.type = 'Question type is required';
  }
  
  if (['multiple', 'rating', 'yesno'].includes(question.type)) {
    if (!question.options || question.options.length === 0) {
      errors.options = 'Options are required for this question type';
    } else if (question.type === 'rating' && question.options.length < 2) {
      errors.options = 'Rating questions require at least 2 options';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate a form
 * @param {Object} form - Form to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateForm(form) {
  const errors = {};
  
  if (isEmpty(form.title)) {
    errors.title = 'Form title is required';
  }
  
  if (form.emailNotification) {
    if (isEmpty(form.emailSubject)) {
      errors.emailSubject = 'Email subject is required when notifications are enabled';
    }
    
    if (isEmpty(form.emailRecipients)) {
      errors.emailRecipients = 'Email recipients are required when notifications are enabled';
    } else {
      // Validate each email recipient
      const recipients = form.emailRecipients.split(',').map(email => email.trim());
      const invalidEmails = recipients.filter(email => !isValidEmail(email));
      
      if (invalidEmails.length > 0) {
        errors.emailRecipients = `Invalid email address${invalidEmails.length > 1 ? 'es' : ''}: ${invalidEmails.join(', ')}`;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Check if a file is of an allowed type
 * @param {File} file - File to check
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if allowed
 */
export function isAllowedFileType(file, allowedTypes) {
  if (!file || !allowedTypes || !Array.isArray(allowedTypes)) return false;
  
  return allowedTypes.includes(file.type);
}

/**
 * Check if a file is within the size limit
 * @param {File} file - File to check
 * @param {number} maxSizeInBytes - Maximum allowed size in bytes
 * @returns {boolean} True if within limit
 */
export function isFileSizeValid(file, maxSizeInBytes) {
  if (!file || !maxSizeInBytes) return false;
  
  return file.size <= maxSizeInBytes;
}

/**
 * Validate an audio file
 * @param {File} file - Audio file to validate
 * @returns {Object} Validation result with isValid and error
 */
export function validateAudioFile(file) {
  // Allowed audio types
  const allowedTypes = [
    'audio/wav',
    'audio/webm',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg'
  ];
  
  // Maximum size: 10MB
  const maxSize = 10 * 1024 * 1024;
  
  if (!file) {
    return { isValid: false, error: 'No audio file provided' };
  }
  
  if (!isAllowedFileType(file, allowedTypes)) {
    return { 
      isValid: false, 
      error: `Unsupported file type. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  if (!isFileSizeValid(file, maxSize)) {
    return { 
      isValid: false, 
      error: `File size exceeds the maximum allowed (10MB)` 
    };
  }
  
  return { isValid: true };
}
