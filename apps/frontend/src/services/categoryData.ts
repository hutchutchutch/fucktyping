import {  Category, CategoryWithStats  } from "@schemas/schema";
import { mockForms } from '@services/mockData';

// Mock categories
export const mockCategories: Category[] = [
  {
    id: 1,
    userId: 1,
    name: "Customer Feedback",
    description: "Forms for gathering customer input and feedback",
    color: "#3B82F6", // blue
    icon: "star",
    createdAt: new Date("2023-02-15T09:00:00Z")
  },
  {
    id: 2,
    userId: 1,
    name: "Human Resources",
    description: "Forms related to HR processes and recruiting",
    color: "#8B5CF6", // purple
    icon: "users",
    createdAt: new Date("2023-02-17T10:30:00Z")
  },
  {
    id: 3,
    userId: 1,
    name: "Events",
    description: "Forms for event planning, feedback, and management",
    color: "#EC4899", // pink
    icon: "calendar",
    createdAt: new Date("2023-03-01T14:45:00Z")
  },
  {
    id: 4,
    userId: 1,
    name: "Marketing",
    description: "Forms for marketing surveys and campaigns",
    color: "#10B981", // green
    icon: "megaphone",
    createdAt: new Date("2023-03-10T11:20:00Z")
  }
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
    form.categoryId = categoryAssignments[form.id as keyof typeof categoryAssignments] || null;
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