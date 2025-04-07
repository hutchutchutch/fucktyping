import { storage } from '../storage';
import emailService from '../services/emailService';
import errorHandler from '../utils/errorHandler';

/**
 * Email Controller - Handles email notifications for form responses
 */
const emailController = {
  /**
   * Send an email notification for a new form response
   * @param {Object} form - The form object
   * @param {Object} response - The response object
   * @param {Array} answers - The answers array
   */
  sendResponseNotification: async (form, response, answers) => {
    try {
      if (!form.emailNotification || !form.emailRecipients) {
        return false;
      }
      
      // Get questions for the form to include in the email
      const questions = await storage.getQuestions(form.formId);
      
      // Format the answers for the email
      const formattedAnswers = await Promise.all(answers.map(async (answer) => {
        const question = questions.find(q => q.id === answer.questionId) || { text: 'Unknown question' };
        return {
          question: question.text,
          answer: answer.value
        };
      }));
      
      // Format date
      const formattedDate = new Date(response.submittedAt).toLocaleString();
      
      // Generate response URL (for the dashboard)
      const responseUrl = `${process.env.APP_URL || 'http://localhost:5000'}/forms/${form.id}/responses/${response.id}`;
      
      // Process email template with variables
      let emailContent = form.emailTemplate || 'A new response has been submitted to your form.\n\n{formName}\nSubmitted by: {respondent}\nDate: {submissionDate}\n\nView the full response on your dashboard.';
      
      emailContent = emailContent
        .replace(/{formName}/g, form.title)
        .replace(/{respondent}/g, response.userId ? 'Authenticated User' : 'Anonymous User')
        .replace(/{submissionDate}/g, formattedDate)
        .replace(/{responseLink}/g, responseUrl);
      
      // Add answers to the email content
      emailContent += '\n\n--- Responses ---\n\n';
      formattedAnswers.forEach(({ question, answer }) => {
        emailContent += `${question}: ${answer}\n\n`;
      });
      
      // Add link to view full response
      emailContent += `\nView full response details: ${responseUrl}`;
      
      // Send the email
      const emailResult = await emailService.sendEmail({
        to: form.emailRecipients,
        subject: form.emailSubject || `New response to "${form.title}"`,
        text: emailContent
      });
      
      return emailResult;
    } catch (error) {
      console.error("Failed to send response notification email:", error);
      return false;
    }
  },

  /**
   * Send an email with a response
   */
  sendResponseEmail: async (req, res) => {
    try {
      const responseId = parseInt(req.params.id);
      const { to, subject, message } = req.body;
      
      // Validate email parameters
      if (!to) {
        return res.status(400).json({ message: "Recipient email is required" });
      }
      
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
      
      // Get questions for context
      const questions = await storage.getQuestions(form.id);
      
      // Format the answers for the email
      const formattedAnswers = answers.map(answer => {
        const question = questions.find(q => q.id === answer.questionId) || { text: 'Unknown question' };
        return {
          question: question.text,
          answer: answer.value
        };
      });
      
      // Build email content
      let emailContent = message || `Response details for "${form.title}"\n\n`;
      
      emailContent += '--- Responses ---\n\n';
      formattedAnswers.forEach(({ question, answer }) => {
        emailContent += `${question}: ${answer}\n\n`;
      });
      
      // Format date
      const formattedDate = new Date(response.submittedAt).toLocaleString();
      emailContent += `\nSubmitted on: ${formattedDate}`;
      
      // Send the email
      const emailResult = await emailService.sendEmail({
        to,
        subject: subject || `Response details for "${form.title}"`,
        text: emailContent
      });
      
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
};

export default emailController;
