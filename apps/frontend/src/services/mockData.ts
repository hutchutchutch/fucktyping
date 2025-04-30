import {  Form, Response, Question, FormWithQuestions, Category, CategoryWithStats  } from "@schemas/schema";
import { Star, Users, Calendar, Megaphone, Inbox } from 'lucide-react';

// Simulate data from Supabase
export const mockForms: FormWithQuestions[] = [
  {
    id: 101,
    title: "Job Application Form",
    description: "Apply for open positions at our company.",
    status: "active",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-05-01T10:00:00Z",
    categoryId: 1,
    questions: [
      { id: 1, formId: 101, text: "Full Name", type: "text", required: true, order: 1 },
      { id: 2, formId: 101, text: "Email Address", type: "email", required: true, order: 2 },
      { id: 3, formId: 101, text: "Resume (paste link)", type: "text", required: false, order: 3 },
      { id: 4, formId: 101, text: "Why do you want to work here?", type: "text", required: false, order: 4 },
    ],
    responseCount: 12,
    userId: 1,
  },
  {
    id: 102,
    title: "Customer Survey",
    description: "Tell us about your experience with our product.",
    status: "active",
    createdAt: "2024-05-02T11:00:00Z",
    updatedAt: "2024-05-02T11:00:00Z",
    categoryId: 2,
    questions: [
      { id: 1, formId: 102, text: "How satisfied are you?", type: "rating", required: true, order: 1 },
      { id: 2, formId: 102, text: "What can we improve?", type: "text", required: false, order: 2 },
      { id: 3, formId: 102, text: "Would you recommend us?", type: "yes_no", required: true, order: 3 },
    ],
    responseCount: 34,
    userId: 1,
  },
  {
    id: 103,
    title: "Retreat Application",
    description: "Sign up for our annual company retreat.",
    status: "active",
    createdAt: "2024-05-03T12:00:00Z",
    updatedAt: "2024-05-03T12:00:00Z",
    categoryId: 3,
    questions: [
      { id: 1, formId: 103, text: "Name", type: "text", required: true, order: 1 },
      { id: 2, formId: 103, text: "Department", type: "text", required: false, order: 2 },
      { id: 3, formId: 103, text: "Dietary Restrictions", type: "text", required: false, order: 3 },
      { id: 4, formId: 103, text: "Will you need accommodation?", type: "yes_no", required: false, order: 4 },
    ],
    responseCount: 20,
    userId: 1,
  },
];

// Generate mock responses
export const mockResponses: Response[] = [];

// Customer Satisfaction form responses (24)
for (let i = 1; i <= 24; i++) {
  mockResponses.push({
    id: i,
    formId: 1,
    questionId: 1,
    text: '',
    respondentName: `Respondent ${i}`,
    respondentEmail: `respondent${i}@example.com`,
    completedAt: i <= 22 ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
  });
}

// Job Application form responses (67)
for (let i = 25; i <= 91; i++) {
  mockResponses.push({
    id: i,
    formId: 2,
    questionId: 1,
    text: '',
    respondentName: `Applicant ${i}`,
    respondentEmail: `applicant${i}@example.com`,
    completedAt: i <= 85 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
  });
}

// Event Feedback form responses (18)
for (let i = 92; i <= 109; i++) {
  mockResponses.push({
    id: i,
    formId: 3,
    questionId: 1,
    text: '',
    respondentName: `Attendee ${i}`,
    respondentEmail: `attendee${i}@example.com`,
    completedAt: i <= 104 ? new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000) : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
  });
}

// Questions for form 4 (Customer Feedback form)
export const mockQuestions: Question[] = [
  {
    id: 1,
    formId: 4,
    text: "How would you rate your overall experience?",
    type: "rating",
    order: 1,
    required: true,
    options: ["1", "2", "3", "4", "5"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    formId: 4,
    text: "What aspects of our service did you find most helpful?",
    type: "text",
    order: 2,
    required: true,
    options: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    formId: 4,
    text: "How likely are you to recommend our service to others?",
    type: "multiple_choice",
    order: 3,
    required: true,
    options: ["Very likely", "Somewhat likely", "Neutral", "Somewhat unlikely", "Very unlikely"],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    formId: 4,
    text: "When did you last interact with our team?",
    type: "date",
    order: 4,
    required: false,
    options: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  }
];

// Stats calculation functions
export const getStatsData = () => {
  const totalForms = mockForms.length;
  const totalResponses = mockResponses.length;
  
  // Calculate completion rate
  const completedResponses = mockResponses.filter(r => r.completedAt !== null).length;
  const completionRate = Math.round((completedResponses / totalResponses) * 100);
  
  return {
    totalForms,
    totalResponses,
    completionRate: `${completionRate}%`
  };
};

interface FormWithResponseCount extends Form {
  responseCount: number;
  lastResponseDate: Date | null;
}

export const getFormWithResponses = (formId: number): FormWithResponseCount | null => {
  const form = mockForms.find(f => f.id === formId);
  if (!form) return null;
  
  const responses = mockResponses.filter(r => r.formId === formId);
  
  // Find last response time
  let lastResponse: Date | null = null;
  if (responses.length > 0) {
    const sorted = [...responses].sort((a, b) => {
      const aDate = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
      const bDate = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
      return bDate.getTime() - aDate.getTime();
    });
    const last = sorted[0].createdAt;
    lastResponse = typeof last === 'string' ? new Date(last) : last;
  }
  
  return {
    ...form,
    responseCount: responses.length,
    lastResponseDate: lastResponse
  };
};

export const getRecentForms = (): FormWithResponseCount[] => {
  // Get forms with their response counts and last response dates
  return mockForms
    .filter(form => form.isActive === true)
    .map(form => {
      const formWithResponses = getFormWithResponses(form.id);
      if (!formWithResponses) return null;
      return formWithResponses;
    })
    .filter((form): form is FormWithResponseCount => form !== null)
    .sort((a, b) => {
      // Sort by last response date, then by response count if dates are equal
      if (a.lastResponseDate && b.lastResponseDate) {
        return b.lastResponseDate.getTime() - a.lastResponseDate.getTime();
      }
      if (a.lastResponseDate) return -1;
      if (b.lastResponseDate) return 1;
      return b.responseCount - a.responseCount;
    })
    .slice(0, 3); // Only return top 3
};

// Helper function to format relative time (e.g., "2h ago", "1d ago")
export const getRelativeTimeString = (date: Date | null): string => {
  if (!date) return 'never';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Mock categories data
export const mockCategories: Category[] = [
  {
    id: 1,
    userId: 1,
    name: "Customer Feedback",
    description: "Forms for gathering customer input and feedback",
    color: "#3B82F6", // blue
    icon: "star",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    userId: 1,
    name: "Human Resources",
    description: "Forms related to HR processes and recruiting",
    color: "#8B5CF6", // purple
    icon: "users",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    userId: 1,
    name: "Events",
    description: "Forms for event planning, feedback, and management",
    color: "#EC4899", // pink
    icon: "calendar",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    id: 4,
    userId: 1,
    name: "Marketing",
    description: "Forms for marketing surveys and campaigns",
    color: "#10B981", // green
    icon: "megaphone",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  }
];

// Mock categories with statistics
export const mockCategoriesWithStats: CategoryWithStats[] = [
  {
    id: 1,
    userId: 1,
    name: "Recruitment",
    description: "Forms for job applications and candidate screening.",
    color: "#3b82f6",
    icon: "users",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    forms: mockForms.filter(f => f.categoryId === 1),
    formCount: mockForms.filter(f => f.categoryId === 1).length,
    responseRate: 0.75,
    completionRate: 0.92,
    averageSentiment: 0.85
  },
  {
    id: 2,
    userId: 1,
    name: "Customer Feedback",
    description: "Surveys for customer satisfaction and product feedback.",
    color: "#f59e42",
    icon: "star",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    forms: mockForms.filter(f => f.categoryId === 2),
    formCount: mockForms.filter(f => f.categoryId === 2).length,
    responseRate: 0.64,
    completionRate: 0.78,
    averageSentiment: 0.70
  },
  {
    id: 3,
    userId: 1,
    name: "Event Registration",
    description: "Forms for event signups and retreat applications.",
    color: "#10b981",
    icon: "calendar",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    forms: mockForms.filter(f => f.categoryId === 3),
    formCount: mockForms.filter(f => f.categoryId === 3).length,
    responseRate: 0.55,
    completionRate: 0.68,
    averageSentiment: 0.75
  }
];

// Helper functions for categories
export const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'star':
      return Star;
    case 'users':
      return Users;
    case 'calendar':
      return Calendar;
    case 'megaphone':
      return Megaphone;
    default:
      return Inbox;
  }
};

// Format percentage for display
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// Get sentiment label based on value
export const getSentimentLabel = (value: number): string => {
  if (value >= 0.8) return "Very Positive";
  if (value >= 0.6) return "Positive";
  if (value >= 0.4) return "Neutral";
  if (value >= 0.2) return "Negative";
  return "Very Negative";
};