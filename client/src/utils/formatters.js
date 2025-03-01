/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to a human-readable format
 * @param {string|Date} dateString - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Default options
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
}

/**
 * Format a date to include time
 * @param {string|Date} dateString - The date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format seconds to minutes and seconds display (mm:ss)
 * @param {number} seconds - Number of seconds
 * @returns {string} Formatted time string
 */
export function formatDuration(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '0:00';
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format a number as a percentage
 * @param {number} value - The value to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Truncate a long string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength = 50) {
  if (!str) return '';
  
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Format a name to title case
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
export function formatName(name) {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a phone number in US format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
}

/**
 * Format a number with commas as thousands separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(number) {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Convert seconds to a human-readable time format (X min Y sec)
 * @param {number} seconds - Number of seconds
 * @returns {string} Formatted time
 */
export function formatTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '0 seconds';
  }
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  let result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  if (remainingSeconds > 0) {
    result += ` ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
  
  return result;
}
