import {  Category, CategoryWithStats  } from "@schemas/schema";
import { mockForms } from '@services/mockData';

// Mock categories
export const mockCategories: Category[] = [
  {
    id: 1,
    name: "Recruitment",
    description: "Forms for job applications and candidate screening.",
    icon: "users",
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Customer Feedback",
    description: "Surveys for customer satisfaction and product feedback.",
    icon: "star",
    color: "#f59e42",
  },
  {
    id: 3,
    name: "Event Registration",
    description: "Forms for event signups and retreat applications.",
    icon: "calendar",
    color: "#10b981",
  },
];

// Assign categories to existing forms
const categoryAssignments = {
  1: 1, // Customer Satisfaction -> Customer Feedback
  2: 2, // Job Application -> Human Resources
  3: 3, // Event Feedback -> Events
  4: 1, // Customer Feedback -> Customer Feedback
  5: 1, // Product Feedback -> Customer Feedback
  6: 4  // Website Usability Survey -> Marketing
};

// Update mock forms with category information
export const updateFormsWithCategories = () => {
  mockForms.forEach(form => {
    form.categoryId = categoryAssignments[form.id as keyof typeof categoryAssignments] || undefined;
  });
};

// Calculate stats for categories
export const mockCategoriesWithStats: CategoryWithStats[] = mockCategories.map(category => {
  const categoryForms = mockForms.filter(form => form.categoryId === category.id);
  
  // Response calculations
  const totalForms = categoryForms.length;
  let totalResponses = 0;
  let totalCompletedResponses = 0;
  
  categoryForms.forEach(form => {
    const responseCount = form.responseCount || 0;
    totalResponses += responseCount;
    // Assuming 80% of responses are completed for this mock
    totalCompletedResponses += Math.floor(responseCount * 0.8);
  });
  
  const responseRate = totalForms > 0 ? totalResponses / totalForms : 0;
  const completionRate = totalResponses > 0 ? totalCompletedResponses / totalResponses : 0;
  
  // Mock sentiment for demonstration
  const sentimentValues = {
    1: 0.85, // Customer Feedback - high sentiment
    2: 0.72, // HR - medium-high sentiment
    3: 0.78, // Events - medium-high sentiment
    4: 0.90  // Marketing - very high sentiment
  };
  
  return {
    ...category,
    forms: categoryForms,
    formCount: totalForms,
    responseRate,
    completionRate,
    averageSentiment: sentimentValues[category.id as keyof typeof sentimentValues] || 0.75
  };
});

// Helper to format percentage for display
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// Helper to get sentiment label
export const getSentimentLabel = (value: number): string => {
  if (value >= 0.8) return "Very Positive";
  if (value >= 0.6) return "Positive";
  if (value >= 0.4) return "Neutral";
  if (value >= 0.2) return "Negative";
  return "Very Negative";
};