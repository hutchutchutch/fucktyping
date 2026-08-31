import type { FormConfig } from "../forms/types";

/** A ready-to-run FormConfig so the DO works locally before any form is authored.
 *  Used only when form_id is explicitly "sample" during local development. */
export const SAMPLE_FORM: FormConfig = {
  id: "sample",
  name: "Customer Feedback (sample)",
  openingActivity: {
    prompt: "Hi! Thanks for taking a moment to share your feedback.",
  },
  questions: [
    {
      id: "name",
      prompt: "First, what's your name?",
      expectedResponseFormat: "text",
      required: true,
      maxAttempts: 3,
    },
    {
      id: "rating",
      prompt: "On a scale of one to five, how would you rate your experience?",
      expectedResponseFormat: "number",
      required: true,
      maxAttempts: 3,
      validResponseExample: "four",
    },
    {
      id: "recommend",
      prompt: "Would you recommend us to a friend?",
      expectedResponseFormat: "yes_no",
      required: true,
      maxAttempts: 3,
    },
    {
      id: "comments",
      prompt: "Lastly, any additional comments?",
      expectedResponseFormat: "text",
      required: false,
      maxAttempts: 2,
    },
  ],
  closingActivity: {
    prompt: "That's everything — thank you so much for your time. Goodbye!",
  },
};
