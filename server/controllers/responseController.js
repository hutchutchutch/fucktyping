import { storage } from '../storage';
import emailController from './emailController';
import groqService from '../services/groqService';
import errorHandler from '../utils/errorHandler';

/**
 * Response Controller - Handles form response submissions and retrieval
 */
const responseController = {
  /**
   * Get all responses for a form
   */
  getFormResponses: async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      
      // Check if form exists
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Get all responses for the form
      const responses = await storage.getResponses(formId);
      
      // Enhance the responses with additional information
      const enhancedResponses = await Promise.all(responses.map(async (response) => {
        // Get answers for this response
        const answers = await storage.getAnswers(response.id);
        
        // Get the first answer that has text for a preview
        const previewAnswer = answers.find(a => a.value && typeof a.value === 'string' && a.value.length > 5);
        
        // Get the question associated with the first answer (if exists)
        let questionText = '';
        if (answers.length > 0 && answers[0].questionId) {
          const question = await storage.getQuestion(answers[0].questionId);
          questionText = question ? question.text : '';
        }
        
        return {
          id: response.id,
          formId: response.formId,
          submittedAt: response.submittedAt,
          completionTime: response.completionTime,
          device: response.device,
          answerCount: answers.length,
          previewText: previewAnswer ? previewAnswer.value.substring(0, 100) : 'No text response',
          firstQuestionText: questionText
        };
      }));
      
      res.json(enhancedResponses);
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Submit a new response to a form
   */
  submitResponse: async (req, res) => {
    try {
      const formId = parseInt(req.params.id);
      const { answers, completionTime, device } = req.body;
      
      // Check if form exists
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Create the response
      const response = await storage.createResponse({
        formId,
        completionTime: completionTime || 0,
        device: device || req.headers['user-agent'],
        ipAddress: req.ip
      });
      
      // Process and save the answers
      const savedAnswers = [];
      if (answers && Array.isArray(answers)) {
        for (const answer of answers) {
          // Validate the question
          const question = await storage.getQuestion(parseInt(answer.questionId));
          if (!question) {
            continue; // Skip invalid questions
          }
          
          // Ensure the question belongs to this form
          if (question.formId !== formId) {
            continue; // Skip questions from other forms
          }
          
          // Perform sentiment analysis if text is available
          let sentimentScore = null;
          if (answer.transcription || (typeof answer.value === 'string' && answer.value.length > 10)) {
            try {
              const textToAnalyze = answer.transcription || answer.value;
              const sentiment = await groqService.analyzeSentiment(textToAnalyze);
              sentimentScore = Math.round(sentiment.score * 100); // Convert to 0-100 scale
            } catch (err) {
              console.error("Sentiment analysis failed:", err);
              // Continue anyway, sentiment is optional
            }
          }
          
          // Save the answer
          const savedAnswer = await storage.createAnswer({
            responseId: response.id,
            questionId: parseInt(answer.questionId),
            value: answer.value,
            transcription: answer.transcription || null,
            audioUrl: answer.audioUrl || null,
            sentimentScore
          });
          
          savedAnswers.push(savedAnswer);
        }
      }
      
      // Send email notification if enabled for this form
      if (form.emailNotification && form.emailRecipients) {
        try {
          await emailController.sendResponseNotification(form, response, savedAnswers);
        } catch (err) {
          console.error("Failed to send email notification:", err);
          // Continue anyway, email is not critical
        }
      }
      
      res.status(201).json({
        response,
        answers: savedAnswers
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Get a specific response by ID
   */
  getResponseById: async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      
      // Get the response and its answers
      const responseData = await storage.getResponseWithAnswers(responseId);
      if (!responseData) {
        return res.status(404).json({ message: "Response not found" });
      }
      
      const { response, answers } = responseData;
      
      // Get the form
      const form = await storage.getForm(response.formId);
      if (!form) {
        return res.status(404).json({ message: "Related form not found" });
      }
      
      // Enhance answers with question information
      const enhancedAnswers = await Promise.all(answers.map(async (answer) => {
        const question = await storage.getQuestion(answer.questionId);
        return {
          ...answer,
          questionText: question ? question.text : 'Unknown question',
          questionType: question ? question.type : 'text'
        };
      }));
      
      // Generate mock AI analysis (in real app, this would come from actual analysis)
      const aiAnalysis = {
        summary: "Customer is generally satisfied with the service and specifically mentions positive experiences with customer support. They recommend improving the mobile app's performance.",
        keyTopics: ["Customer Service", "Mobile App", "Performance"]
      };
      
      const result = {
        id: response.id,
        formId: response.formId,
        formTitle: form.title,
        submittedAt: response.submittedAt,
        submittedBy: response.userId ? 'Authenticated User' : 'Anonymous User',
        completionTime: response.completionTime,
        device: response.device,
        ipAddress: response.ipAddress,
        answers: enhancedAnswers,
        sentimentScore: Math.max(...enhancedAnswers.map(a => a.sentimentScore || 0)),
        aiSummary: aiAnalysis.summary,
        keyTopics: aiAnalysis.keyTopics
      };
      
      res.json(result);
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Download a response (as CSV or JSON)
   */
  downloadResponse: async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const format = req.query.format || 'json';
      
      // Get the response and its answers
      const responseData = await storage.getResponseWithAnswers(responseId);
      if (!responseData) {
        return res.status(404).json({ message: "Response not found" });
      }
      
      const { response, answers } = responseData;
      
      // Get the form
      const form = await storage.getForm(response.formId);
      if (!form) {
        return res.status(404).json({ message: "Related form not found" });
      }
      
      // Enhance answers with question information
      const enhancedAnswers = await Promise.all(answers.map(async (answer) => {
        const question = await storage.getQuestion(answer.questionId);
        return {
          ...answer,
          questionText: question ? question.text : 'Unknown question',
          questionType: question ? question.type : 'text'
        };
      }));
      
      // Sort answers by question order
      enhancedAnswers.sort((a, b) => {
        const questionA = form.questions?.find(q => q.id === a.questionId);
        const questionB = form.questions?.find(q => q.id === b.questionId);
        return (questionA?.order || 0) - (questionB?.order || 0);
      });
      
      if (format === 'csv') {
        // Generate CSV
        let csv = 'Question,Answer,Transcription\n';
        
        enhancedAnswers.forEach(answer => {
          const questionText = answer.questionText.replace(/"/g, '""');
          const value = (answer.value || '').toString().replace(/"/g, '""');
          const transcription = (answer.transcription || '').toString().replace(/"/g, '""');
          
          csv += `"${questionText}","${value}","${transcription}"\n`;
        });
        
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename="response-${responseId}.csv"`);
        res.send(csv);
      } else {
        // Generate JSON
        const result = {
          id: response.id,
          formId: response.formId,
          formTitle: form.title,
          submittedAt: response.submittedAt,
          completionTime: response.completionTime,
          answers: enhancedAnswers
        };
        
        res.set('Content-Type', 'application/json');
        res.set('Content-Disposition', `attachment; filename="response-${responseId}.json"`);
        res.json(result);
      }
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
};

export default responseController;
