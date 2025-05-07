import { storage } from '../storage';
import errorHandler from '../utils/errorHandler';
import tokenGenerator from '../utils/tokenGenerator';
import validators from '../utils/validators';

/**
 * Get all forms for the current user
 */
export const getForms = async (req, res) => {
  try {
    // In a real implementation, we would get the user ID from the authenticated user
    const userId = req.query.userId || 1; // Default to demo user
    
    const forms = await storage.getForms(parseInt(userId));
    
    // For each form, count the number of responses
    const formsWithResponseCount = await Promise.all(forms.map(async (form) => {
      const responses = await storage.getResponses(form.id);
      return {
        ...form,
        responseCount: responses.length
      };
    }));
    
    res.json(formsWithResponseCount);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Create a new form
 */
export const createForm = async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate form data
    const { isValid, errors } = validators.validateForm(formData);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid form data", errors });
    }
    
    // Create the form
    const form = await storage.createForm(formData);
    
    res.status(201).json(form);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get a form by ID
 */
export const getFormById = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const form = await storage.getForm(formId);
    
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Get the form's questions
    const questions = await storage.getQuestions(formId);
    
    res.json({
      ...form,
      questions
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Update a form
 */
export const updateForm = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const formData = req.body;
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Validate form data
    const { isValid, errors } = validators.validateForm(formData);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid form data", errors });
    }
    
    // Update the form
    const updatedForm = await storage.updateForm(formId, formData);
    
    res.json(updatedForm);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Delete a form
 */
export const deleteForm = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Delete the form
    await storage.deleteForm(formId);
    
    res.status(204).end();
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Publish a form (change status from draft to active)
 */
export const publishForm = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Update the form status
    const updatedForm = await storage.updateForm(formId, { status: "active" });
    
    res.json(updatedForm);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Archive a form (change status to archived)
 */
export const archiveForm = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Update the form status
    const updatedForm = await storage.updateForm(formId, { status: "archived" });
    
    res.json(updatedForm);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Generate a shareable link for a form
 */
export const generateShareLink = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Generate a unique token for the share link
    const token = tokenGenerator.generateToken();
    
    // In a real implementation, we would save this token to the database
    // and associate it with the form
    
    // For now, just return a mock URL
    const shareLink = `${req.protocol}://${req.get('host')}/forms/${formId}/respond?token=${token}`;
    
    res.json({ shareLink });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get analytics for a form
 */
export const getFormAnalytics = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Get all responses for the form
    const responses = await storage.getResponses(formId);
    
    // Calculate basic analytics
    const totalResponses = responses.length;
    
    // Calculate completion rate (mock data for now)
    const completionRate = totalResponses > 0 ? Math.round(Math.random() * 30 + 70) : 0;
    
    // Calculate average time to complete (in seconds)
    let avgCompletionTime = 0;
    if (totalResponses > 0) {
      const totalTime = responses.reduce((sum, response) => sum + (response.completionTime || 0), 0);
      avgCompletionTime = Math.round(totalTime / totalResponses);
    }
    
    // Generate daily response data for the last 7 days
    const dailyResponses = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayResponses = responses.filter(response => {
        const responseDate = new Date(response.submittedAt);
        return responseDate >= date && responseDate < nextDate;
      });
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      dailyResponses.push({
        name: dayName,
        date: date.toISOString().split('T')[0],
        responses: dayResponses.length
      });
    }
    
    // Generate mock sentiment analysis
    const sentimentAnalysis = {
      positive: Math.round(Math.random() * 30 + 50), // 50-80%
      neutral: Math.round(Math.random() * 20 + 10),  // 10-30%
      negative: Math.round(Math.random() * 10)       // 0-10%
    };
    
    // Generate mock completion rates by question
    const questions = await storage.getQuestions(formId);
    const questionCompletionRates = questions.map(question => ({
      id: question.id,
      text: question.text.length > 30 ? question.text.substring(0, 30) + '...' : question.text,
      completionRate: Math.round(Math.random() * 20 + 80) // 80-100%
    }));
    
    res.json({
      totalResponses,
      completionRate,
      avgCompletionTime,
      dailyResponses,
      sentimentAnalysis,
      questionCompletionRates
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Get all questions for a form
 */
export const getFormQuestions = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Get the questions
    const questions = await storage.getQuestions(formId);
    
    res.json(questions);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Create a new question for a form
 */
export const createQuestion = async (req, res) => {
  try {
    const formId = parseInt(req.params.id);
    const questionData = req.body;
    
    // Check if form exists
    const existingForm = await storage.getForm(formId);
    if (!existingForm) {
      return res.status(404).json({ message: "Form not found" });
    }
    
    // Validate question data
    const { isValid, errors } = validators.validateQuestion(questionData);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid question data", errors });
    }
    
    // Get the current questions to determine the order
    const existingQuestions = await storage.getQuestions(formId);
    const order = questionData.order || existingQuestions.length + 1;
    
    // Create the question
    const question = await storage.createQuestion({
      ...questionData,
      formId,
      order
    });
    
    res.status(201).json(question);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Update a question
 */
export const updateQuestion = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const questionData = req.body;
    
    // Check if question exists
    const existingQuestion = await storage.getQuestion(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    // Validate question data
    const { isValid, errors } = validators.validateQuestion({
      ...existingQuestion,
      ...questionData
    });
    if (!isValid) {
      return res.status(400).json({ message: "Invalid question data", errors });
    }
    
    // Update the question
    const updatedQuestion = await storage.updateQuestion(questionId, questionData);
    
    res.json(updatedQuestion);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    
    // Check if question exists
    const existingQuestion = await storage.getQuestion(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    
    // Delete the question
    await storage.deleteQuestion(questionId);
    
    // Update the order of remaining questions
    const formId = existingQuestion.formId;
    const remainingQuestions = await storage.getQuestions(formId);
    
    // Re-order questions
    for (let i = 0; i < remainingQuestions.length; i++) {
      if (remainingQuestions[i].order > existingQuestion.order) {
        await storage.updateQuestion(remainingQuestions[i].id, {
          order: remainingQuestions[i].order - 1
        });
      }
    }
    
    res.status(204).end();
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// TODO: Implement reorderQuestions if it's used in routes.ts
export const reorderQuestions = async (req, res) => {
  try {
    // const formId = parseInt(req.params.id);
    // const { questionOrder } = req.body; // Expecting an array of question IDs in the new order
    // Implement logic to update the order of questions for the given formId
    // For each questionId in questionOrder, update its 'order' field in the database
    res.json({ success: true, message: "Questions reordered (not implemented yet)." });
  } catch (error) {
    errorHandler(error, req, res);
  }
};
