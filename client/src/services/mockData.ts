import { Form, Response, Question, FormWithQuestions } from "../../../shared/schema";

// Simulate data from Supabase
export const mockForms: FormWithQuestions[] = [
  {
    id: 1,
    title: "Customer Satisfaction",
    description: "Survey to collect feedback about our customer service",
    userId: 1,
    status: 'active', // active, draft, archived
    isActive: true,
    emailNotificationEnabled: true,
    emailRecipients: "support@example.com",
    emailSubject: "New Customer Satisfaction Response",
    emailTemplate: "Thank you for your feedback on our customer service. We appreciate your input!",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    questions: [
      {
        id: 101,
        formId: 1,
        text: "How would you rate our customer service?",
        type: "rating", 
        order: 1,
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: 102,
        formId: 1,
        text: "What aspects of our service could be improved?",
        type: "text",
        order: 2,
        required: false,
        options: null,
      },
      {
        id: 103,
        formId: 1,
        text: "How likely are you to recommend our service to others?",
        type: "multiple_choice",
        order: 3,
        required: true,
        options: ["Very likely", "Somewhat likely", "Not sure", "Unlikely", "Very unlikely"],
      }
    ],
    responseCount: 24,
  },
  {
    id: 2,
    title: "Job Application",
    description: "Application form for software developer position",
    userId: 1,
    status: 'active',
    isActive: true,
    emailNotificationEnabled: true,
    emailRecipients: "hr@example.com",
    emailSubject: "New Job Application Received",
    emailTemplate: "Thank you for applying to the software developer position. We'll review your application and get back to you soon.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 201,
        formId: 2,
        text: "Full Name",
        type: "text",
        order: 1,
        required: true,
        options: null,
      },
      {
        id: 202,
        formId: 2,
        text: "Email Address",
        type: "text",
        order: 2,
        required: true,
        options: null,
      },
      {
        id: 203,
        formId: 2,
        text: "Years of Experience",
        type: "multiple_choice",
        order: 3,
        required: true,
        options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
      },
      {
        id: 204,
        formId: 2,
        text: "Tell us about yourself",
        type: "text",
        order: 4,
        required: true,
        options: null,
      }
    ],
    responseCount: 67,
  },
  {
    id: 3,
    title: "Event Feedback",
    description: "Feedback form for our annual conference",
    userId: 1,
    status: 'active',
    isActive: true,
    emailNotificationEnabled: true,
    emailRecipients: "events@example.com",
    emailSubject: "Event Feedback Received",
    emailTemplate: "Thank you for providing feedback on our annual conference. Your input helps us improve future events.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    questions: [
      {
        id: 301,
        formId: 3,
        text: "How would you rate the overall event?",
        type: "rating",
        order: 1,
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: 302,
        formId: 3,
        text: "Which sessions did you find most valuable?",
        type: "text",
        order: 2,
        required: true,
        options: null,
      },
      {
        id: 303,
        formId: 3,
        text: "Would you attend this event next year?",
        type: "multiple_choice",
        order: 3,
        required: true,
        options: ["Yes", "Maybe", "No"],
      }
    ],
    responseCount: 18,
  },
  {
    id: 4,
    title: "Customer Feedback",
    description: "Please provide feedback about your recent experience with our customer service team.",
    userId: 1,
    status: 'draft',
    isActive: false,
    emailNotificationEnabled: false,
    emailRecipients: null,
    emailSubject: null,
    emailTemplate: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 401,
        formId: 4,
        text: "How would you rate your overall experience?",
        type: "rating",
        order: 1,
        required: true,
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: 402,
        formId: 4,
        text: "What aspects of our service did you find most helpful?",
        type: "text",
        order: 2,
        required: true,
        options: null,
      }
    ],
    responseCount: 0,
  },
  {
    id: 5,
    title: "Product Feedback",
    description: "Help us improve our products by sharing your experience",
    userId: 1,
    status: 'archived',
    isActive: false,
    emailNotificationEnabled: false,
    emailRecipients: "product@example.com",
    emailSubject: "Product Feedback Received",
    emailTemplate: "Thank you for your feedback on our product. We value your input!",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 501,
        formId: 5,
        text: "Which product are you providing feedback for?",
        type: "multiple_choice",
        order: 1,
        required: true,
        options: ["Product A", "Product B", "Product C"],
      },
      {
        id: 502,
        formId: 5,
        text: "How would you rate this product?",
        type: "rating",
        order: 2,
        required: true,
        options: ["1", "2", "3", "4", "5"],
      }
    ],
    responseCount: 125,
  },
  {
    id: 6,
    title: "Website Usability Survey",
    description: "Help us improve our website experience",
    userId: 1,
    status: 'draft',
    isActive: false,
    emailNotificationEnabled: false,
    emailRecipients: null,
    emailSubject: null,
    emailTemplate: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    questions: [
      {
        id: 601,
        formId: 6,
        text: "How easy was it to find what you were looking for?",
        type: "rating",
        order: 1,
        required: true,
        options: ["1", "2", "3", "4", "5"],
      }
    ],
    responseCount: 0,
  }
];

// Generate mock responses
export const mockResponses: Response[] = [];

// Customer Satisfaction form responses (24)
for (let i = 1; i <= 24; i++) {
  mockResponses.push({
    id: i,
    formId: 1,
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
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    lastResponse = sorted[0].createdAt;
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