import { Answer } from './schemas';
import { SENTIMENT_THRESHOLDS } from './constants';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format a date to a user-friendly string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calculate completion time in minutes
 */
export function calculateCompletionTime(
  startTime: Date,
  endTime: Date
): number {
  const diff = endTime.getTime() - startTime.getTime();
  return Math.round((diff / 1000 / 60) * 10) / 10; // Round to 1 decimal place
}

/**
 * Categorize sentiment based on score
 */
export function categorizeSentiment(
  score: number
): 'positive' | 'negative' | 'neutral' {
  if (score >= SENTIMENT_THRESHOLDS.POSITIVE) return 'positive';
  if (score <= SENTIMENT_THRESHOLDS.NEGATIVE) return 'negative';
  return 'neutral';
}

/**
 * Calculate sentiment statistics for a set of answers
 */
export function calculateSentimentStats(answers: Answer[]): {
  positive: number;
  negative: number;
  neutral: number;
} {
  const sentiments = answers
    .filter(a => a.sentimentScore !== undefined)
    .map(a => categorizeSentiment(a.sentimentScore as number));
  
  const counts = {
    positive: sentiments.filter(s => s === 'positive').length,
    negative: sentiments.filter(s => s === 'negative').length,
    neutral: sentiments.filter(s => s === 'neutral').length
  };
  
  const total = sentiments.length || 1; // Avoid division by zero
  
  return {
    positive: Math.round((counts.positive / total) * 100),
    negative: Math.round((counts.negative / total) * 100),
    neutral: Math.round((counts.neutral / total) * 100)
  };
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Calculate completion rate as a percentage
 */
export function calculateCompletionRate(
  totalResponses: number,
  completedResponses: number
): number {
  if (totalResponses === 0) return 0;
  return Math.round((completedResponses / totalResponses) * 100);
}

/**
 * Format seconds to minutes and seconds (MM:SS)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if a value passes validation rules
 */
export function validateValue(
  value: any,
  rules: Record<string, any>
): { valid: boolean; error?: string } {
  if (!rules) return { valid: true };
  
  if (rules.required && !value) {
    return { valid: false, error: 'This field is required' };
  }
  
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return { valid: false, error: `Must be at least ${rules.minLength} characters` };
  }
  
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return { valid: false, error: `Must be at most ${rules.maxLength} characters` };
  }
  
  if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
    return { valid: false, error: rules.patternError || 'Invalid format' };
  }
  
  if (rules.min && typeof value === 'number' && value < rules.min) {
    return { valid: false, error: `Must be at least ${rules.min}` };
  }
  
  if (rules.max && typeof value === 'number' && value > rules.max) {
    return { valid: false, error: `Must be at most ${rules.max}` };
  }
  
  if (rules.emailFormat && typeof value === 'string' && !validateEmail(value)) {
    return { valid: false, error: 'Invalid email address' };
  }
  
  if (rules.phoneFormat && typeof value === 'string' && !validatePhone(value)) {
    return { valid: false, error: 'Invalid phone number' };
  }
  
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function validatePhone(phone: string): boolean {
  // Simple phone validation that requires at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}