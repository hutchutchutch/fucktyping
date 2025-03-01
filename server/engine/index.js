// index.js
export { FormConfigSchema, OpenActivitySchema, QuestionSchema, ClosingActivitySchema } from './schemas.js';
export { generateVoiceFormGraph, runVoiceForm, continueConversation } from './graph.js';

// Example usage:
/*
import { FormConfigSchema, runVoiceForm } from './index.js';

// Create a form configuration
const formConfig = {
  id: "customer-survey",
  name: "Customer Satisfaction Survey",
  description: "A brief survey to gather customer feedback",
  openingActivity: {
    prompt: "Hello! I'm your virtual assistant. I'd like to ask you a few questions about your recent experience with our service. Is that okay?",
    backgroundInfo: "This is a customer satisfaction survey for users who have recently used our product.",
    useDirectPrompt: true
  },
  questions: [
    {
      id: "name",
      prompt: "What is your name?",
      backgroundInfo: "We want to personalize the conversation.",
      expectedResponseFormat: "text",
      useDirectPrompt: true,
      createDynamicReference: true,
      referenceName: "userName",
      order: 0
    },
    {
      id: "satisfaction",
      prompt: "Hi {userName}, on a scale of 1-10, how satisfied are you with our service?",
      backgroundInfo: "We're measuring overall satisfaction on a scale of 1-10.",
      expectedResponseFormat: "number",
      useDirectPrompt: true,
      validResponseExample: "8",
      invalidResponseExample: "pretty good",
      order: 1
    }
  ],
  closingActivity: {
    prompt: "Thank you for your feedback! We'll use it to improve our services.",
    backgroundInfo: "We want to thank the customer and let them know their feedback is valuable.",
    useDirectPrompt: true
  },
  collectEmail: false
};

// Validate the form configuration
const validatedConfig = FormConfigSchema.parse(formConfig);

// Run the form
const result = await runVoiceForm(validatedConfig);
console.log(result);
*/