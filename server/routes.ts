import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFormSchema, insertQuestionSchema, insertResponseSchema,
  insertAnswerSchema, insertConversationSchema, insertMessageSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // GET Forms
  app.get("/api/forms", async (req: Request, res: Response) => {
    try {
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Using test user ID
      const forms = await storage.getFormsByUserId(userId);
      
      // Count responses for each form
      const formsWithStats = await Promise.all(forms.map(async (form) => {
        const responses = await storage.getResponsesByFormId(form.id);
        return {
          ...form,
          responseCount: responses.length,
          lastResponseDate: responses.length > 0 ? 
            responses[0].completedAt : null
        };
      }));
      
      res.json(formsWithStats);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ message: "Error fetching forms" });
    }
  });

  // GET Form by ID
  app.get("/api/forms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getFormWithQuestions(id);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      res.json(form);
    } catch (error) {
      console.error("Error fetching form:", error);
      res.status(500).json({ message: "Error fetching form" });
    }
  });

  // POST Create Form
  app.post("/api/forms", async (req: Request, res: Response) => {
    try {
      const formData = insertFormSchema.parse(req.body);
      const form = await storage.createForm(formData);
      res.status(201).json(form);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      console.error("Error creating form:", error);
      res.status(500).json({ message: "Error creating form" });
    }
  });

  // PUT Update Form
  app.put("/api/forms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const formData = insertFormSchema.partial().parse(req.body);
      const updatedForm = await storage.updateForm(id, formData);
      
      if (!updatedForm) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      res.json(updatedForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      console.error("Error updating form:", error);
      res.status(500).json({ message: "Error updating form" });
    }
  });

  // DELETE Form
  app.delete("/api/forms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const success = await storage.deleteForm(id);
      if (!success) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      res.json({ message: "Form deleted successfully" });
    } catch (error) {
      console.error("Error deleting form:", error);
      res.status(500).json({ message: "Error deleting form" });
    }
  });

  // GET Questions by Form ID
  app.get("/api/forms/:formId/questions", async (req: Request, res: Response) => {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const questions = await storage.getQuestionsByFormId(formId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Error fetching questions" });
    }
  });

  // POST Create Question
  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Error creating question" });
    }
  });

  // PUT Update Question
  app.put("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const questionData = insertQuestionSchema.partial().parse(req.body);
      const updatedQuestion = await storage.updateQuestion(id, questionData);
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid question data", errors: error.errors });
      }
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Error updating question" });
    }
  });

  // DELETE Question
  app.delete("/api/questions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const success = await storage.deleteQuestion(id);
      if (!success) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Error deleting question" });
    }
  });

  // GET Responses by Form ID
  app.get("/api/forms/:formId/responses", async (req: Request, res: Response) => {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const responses = await storage.getResponsesByFormId(formId);
      
      // Enrich responses with answers
      const responsesWithAnswers = await Promise.all(
        responses.map(async (response) => {
          const answers = await storage.getAnswersByResponseId(response.id);
          return { ...response, answers };
        })
      );
      
      res.json(responsesWithAnswers);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Error fetching responses" });
    }
  });

  // GET Response by ID
  app.get("/api/responses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid response ID" });
      }
      
      const response = await storage.getResponseWithAnswers(id);
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      
      res.json(response);
    } catch (error) {
      console.error("Error fetching response:", error);
      res.status(500).json({ message: "Error fetching response" });
    }
  });

  // POST Create Response
  app.post("/api/responses", async (req: Request, res: Response) => {
    try {
      const responseData = insertResponseSchema.parse(req.body);
      const response = await storage.createResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      console.error("Error creating response:", error);
      res.status(500).json({ message: "Error creating response" });
    }
  });

  // POST Create Answer
  app.post("/api/answers", async (req: Request, res: Response) => {
    try {
      const answerData = insertAnswerSchema.parse(req.body);
      const answer = await storage.createAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      console.error("Error creating answer:", error);
      res.status(500).json({ message: "Error creating answer" });
    }
  });

  // POST Submit entire form response with answers
  app.post("/api/forms/:formId/submit", async (req: Request, res: Response) => {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return res.status(400).json({ message: "Invalid form ID" });
      }
      
      const form = await storage.getForm(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Validate basic response data
      const { respondentName, respondentEmail, answers } = req.body;
      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers must be an array" });
      }
      
      // Create response
      const response = await storage.createResponse({
        formId,
        respondentName,
        respondentEmail
      });
      
      // Create answers
      for (const answer of answers) {
        const { questionId, answerText } = answer;
        await storage.createAnswer({
          responseId: response.id,
          questionId,
          answerText
        });
      }
      
      res.status(201).json({
        message: "Form submitted successfully",
        responseId: response.id
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      res.status(500).json({ message: "Error submitting form" });
    }
  });

  // POST process speech to text
  app.post("/api/voice/transcribe", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would use a speech-to-text API
      // For demo purposes, just echo back the text if provided or return mock response
      const { audio } = req.body;
      
      if (!audio) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      
      // Mock response - would connect to Groq or other STT API
      const transcript = req.body.text || "This is a simulated transcription of the audio input.";
      
      res.json({ transcript });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Error transcribing audio" });
    }
  });

  // POST text to speech
  app.post("/api/voice/synthesize", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Mock response - would connect to a TTS API
      // Return a mock audio URL (in a real app, this would be a base64 audio or URL)
      res.json({
        audioUrl: "data:audio/wav;base64,mockAudioData",
        message: "Text-to-speech conversion simulated. In a real app, this would return actual audio."
      });
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      res.status(500).json({ message: "Error synthesizing speech" });
    }
  });

  // POST conversation message
  app.post("/api/conversation", async (req: Request, res: Response) => {
    try {
      const { responseId, message } = req.body;
      
      if (!responseId || !message) {
        return res.status(400).json({ message: "Response ID and message are required" });
      }
      
      // Get or create conversation for this response
      let conversation = await storage.getConversationByResponseId(responseId);
      
      if (!conversation) {
        conversation = await storage.createConversation({
          responseId,
          transcript: "",
          state: {}
        });
      }
      
      // Add message to conversation
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message
      });
      
      // In a real app, process with LangGraph.js and Groq
      // Mock assistant response
      const assistantResponse = "Thank you for your response. Is there anything else you'd like to add?";
      
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: assistantResponse
      });
      
      // Update conversation transcript
      const messages = await storage.getMessagesByConversationId(conversation.id);
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      await storage.updateConversation(conversation.id, {
        transcript,
        state: { currentStep: "follow-up" }
      });
      
      res.json({
        message: assistantResponse,
        conversationId: conversation.id
      });
    } catch (error) {
      console.error("Error processing conversation:", error);
      res.status(500).json({ message: "Error processing conversation" });
    }
  });

  // GET stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      // Get all forms for the (mock) user
      const userId = 1; // Using test user ID
      const forms = await storage.getFormsByUserId(userId);
      
      // Get all responses
      let totalResponses = 0;
      let completionCount = 0;
      
      for (const form of forms) {
        const responses = await storage.getResponsesByFormId(form.id);
        totalResponses += responses.length;
        
        // In a real app, would check if all required questions are answered
        // For demo, assume all responses are complete
        completionCount += responses.length;
      }
      
      const completionRate = totalResponses > 0
        ? Math.round((completionCount / totalResponses) * 100)
        : 0;
      
      res.json({
        totalForms: forms.length,
        totalResponses,
        completionRate: `${completionRate}%`
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  return httpServer;
}
