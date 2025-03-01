import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertFormSchema, insertQuestionSchema, insertResponseSchema,
  insertAnswerSchema, insertConversationSchema, insertMessageSchema,
  insertCategorySchema 
} from "@shared/schema";
import { z } from "zod";
import { log } from "./vite";

// Import our services
import * as groqService from './services/groqService';
import * as voiceService from './services/voiceService';

// Import voice form controllers
import * as voiceFormController from './controllers/voiceFormController.js';

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server on the same server but different path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Active WebSocket connections and their context
  const activeConnections = new Map<string, {
    id: string;
    sessionContext: Array<{role: string; content: string}>;
    currentForm: number | null;
    currentQuestion: number | null;
    lastActivity: number;
    voiceStreamActive: boolean;
    transcriptInProgress: boolean;
    transcriptBuffer: string;
  }>();
  
  // WebSocket handling
  wss.on('connection', (ws) => {
    const connectionId = Date.now().toString();
    log(`WebSocket client connected: ${connectionId}`);
    
    // Initialize connection context
    activeConnections.set(connectionId, {
      id: connectionId,
      sessionContext: [],
      currentForm: null,
      currentQuestion: null,
      lastActivity: Date.now(),
      voiceStreamActive: false,
      transcriptInProgress: false,
      transcriptBuffer: ''
    });
    
    // Send a welcome message
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connection',
        connectionId,
        status: 'connected',
        message: 'Connected to form voice interface'
      }));
    }
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        log(`Received WebSocket message type: ${data.type}`);
        
        const context = activeConnections.get(connectionId);
        if (!context) {
          console.error(`Connection context not found for ID: ${connectionId}`);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'error',
              error: 'Connection context not found',
              details: 'Please reconnect to the server'
            }));
          }
          return;
        }
        
        const startTime = Date.now();
        
        // Process message based on type
        if (data.type === 'transcript') {
          const { text, formId, questionId, questionType, questionContext } = data;
          
          // Update the connection context
          if (formId) context.currentForm = formId;
          if (questionId) context.currentQuestion = questionId;
          
          // Add user message to context for better continuity
          context.sessionContext.push({ role: 'user', content: text });
          
          // Define the prompt based on available context
          let prompt = text;
          if (questionContext) {
            prompt = `Question context: ${questionContext}\n\nUser response: ${text}\n\nPlease respond to the user appropriately. Be conversational, helpful, and concise.`;
          }
          
          // Generate response using Groq (Llama 3 70B)
          try {
            const response = await groqService.generateResponse(prompt, {
              temperature: data.temperature || 0.7,
              maxTokens: data.maxTokens || 250,
              model: 'grok-2-1212' // Updated to use Groq's model
            });
            
            // Add the assistant response to the context
            context.sessionContext.push({ role: 'assistant', content: response.text });
            
            // Keep context size reasonable (last 10 messages)
            if (context.sessionContext.length > 10) {
              context.sessionContext = context.sessionContext.slice(-10);
            }
            
            // Send the response back to the client
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'response',
                messageId: Date.now().toString(),
                text: response.text,
                formId,
                questionId,
                stats: {
                  latency: Date.now() - startTime,
                  processingTime: response.processingTime,
                  tokens: response.tokens,
                  inputTokens: response.inputTokens,
                  outputTokens: response.outputTokens
                }
              }));
            }
          } catch (error: any) {
            console.error('Error generating response:', error);
            
            // Send error message
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                messageId: Date.now().toString(),
                error: 'Failed to generate response',
                details: error.message || 'Unknown error'
              }));
            }
          }
        } 
        // Handle audio transcription
        else if (data.type === 'audio') {
          try {
            const transcription = await voiceService.transcribeAudio(data.audioData);
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'transcription',
                messageId: Date.now().toString(),
                text: transcription.transcript,
                confidence: transcription.confidence,
                processingTime: transcription.processingTime,
                formId: data.formId,
                questionId: data.questionId
              }));
            }
          } catch (error: any) {
            console.error('Error transcribing audio:', error);
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                messageId: Date.now().toString(),
                error: 'Failed to transcribe audio',
                details: error.message || 'Unknown error'
              }));
            }
          }
        }
        // Handle voice streaming start
        else if (data.type === 'voice_stream_start') {
          // Since we've already checked for a valid context at the beginning of the handler,
          // we don't need to check again
          context.voiceStreamActive = true;
          context.transcriptInProgress = true;
          context.transcriptBuffer = '';
          
          if (data.formId) context.currentForm = data.formId;
          if (data.questionId) context.currentQuestion = data.questionId;
          
          // Acknowledge stream start
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'voice_stream_ack',
              status: 'started',
              messageId: Date.now().toString()
            }));
          }
        }
        // Handle voice streaming chunk data
        else if (data.type === 'voice_stream_chunk') {
          // Voice streaming requires active streaming
          if (!context.voiceStreamActive) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'No active voice stream',
                details: 'You must start a voice stream before sending chunks'
              }));
            }
            return;
          }
          
          try {
            const audioChunk = data.audioChunk;
            
            // In a real implementation, we'd accumulate audio chunks and perform 
            // incremental transcription. For this demo, we'll simulate it with partial results.
            
            // If this is the first chunk or at random intervals, send partial transcription
            const shouldSendPartial = Math.random() > 0.7; // ~30% chance to send partial update
            
            if (shouldSendPartial) {
              // Simulate partial results
              const partialWords = ["hello", "testing", "this", "is", "a", "sample", "voice", "response", 
                "form", "question", "answer", "streaming", "real-time", "transcription"];
                
              // Add 1-3 random words to the buffer
              const wordCount = Math.floor(Math.random() * 3) + 1;
              for (let i = 0; i < wordCount; i++) {
                const randomWord = partialWords[Math.floor(Math.random() * partialWords.length)];
                context.transcriptBuffer += (context.transcriptBuffer ? ' ' : '') + randomWord;
              }
              
              // Send partial result
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'voice_stream_partial',
                  text: context.transcriptBuffer,
                  final: false,
                  messageId: Date.now().toString()
                }));
              }
            }
            
          } catch (error: any) {
            console.error('Error processing voice stream chunk:', error);
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Failed to process voice stream chunk',
                details: error.message || 'Unknown error'
              }));
            }
          }
        }
        // Handle voice streaming end
        else if (data.type === 'voice_stream_end') {
          // Voice streaming requires active streaming
          if (!context.voiceStreamActive) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'No active voice stream',
                details: 'You must start a voice stream before ending it'
              }));
            }
            return;
          }
          
          context.voiceStreamActive = false;
          context.transcriptInProgress = false;
          
          try {
            // In a real implementation, we'd process the entire accumulated buffer
            // For this demo, we'll send the final result based on the buffer
            
            // If buffer is empty, generate something random
            if (!context.transcriptBuffer) {
              context.transcriptBuffer = "This is a simulated final transcription result.";
            }
            
            // Send final result
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'voice_stream_result',
                text: context.transcriptBuffer,
                confidence: 0.9,
                final: true,
                formId: context.currentForm,
                questionId: context.currentQuestion,
                messageId: Date.now().toString()
              }));
            }
            
            // Process the answer if appropriate
            if (context.currentForm && context.currentQuestion) {
              // Code to process the answer would go here in a full implementation
              
              // In a real implementation, we would use LLM to improve answer processing
              // based on question type
              const improvedAnswer = context.transcriptBuffer;
              
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'voice_stream_processed',
                  originalText: context.transcriptBuffer,
                  processedText: improvedAnswer,
                  confidence: 0.85,
                  formId: context.currentForm,
                  questionId: context.currentQuestion,
                  messageId: Date.now().toString()
                }));
              }
            }
            
            // Clear buffer after processing
            context.transcriptBuffer = '';
            
          } catch (error: any) {
            console.error('Error finalizing voice stream:', error);
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Failed to finalize voice stream',
                details: error.message || 'Unknown error'
              }));
            }
          }
        }
        // Initialize form session
        else if (data.type === 'init') {
          context.currentForm = data.formId;
          context.sessionContext = [];
          
          // Send acknowledgment
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'init',
              status: 'success',
              formId: data.formId
            }));
          }
        }
      } catch (error: any) {
        console.error('Error processing WebSocket message:', error);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Failed to process message',
            details: error.message || 'Unknown error'
          }));
        }
      }
    });
    
    ws.on('close', () => {
      log(`WebSocket client disconnected: ${connectionId}`);
      activeConnections.delete(connectionId);
    });
  });

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
      // Import the voice service directly without .default
      const voiceService = await import('./services/voiceService');
      
      const { audio } = req.body;
      
      if (!audio) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      
      // Process the audio through the voice service
      const result = await voiceService.transcribeAudio(audio);
      
      // Set response time header for benchmarking
      res.set('X-Response-Time', result.processingTime.toString());
      
      // Return the transcript
      res.json({ 
        transcript: result.transcript,
        confidence: result.confidence,
        language: result.language,
        simulated: result.simulated
      });
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Error transcribing audio" });
    }
  });

  // POST text to speech
  app.post("/api/voice/synthesize", async (req: Request, res: Response) => {
    try {
      // Import the voice service directly without .default
      const voiceService = await import('./services/voiceService');
      
      const { text, voice, speed, quality } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Process the text through the voice service
      const result = await voiceService.textToSpeech(text, {
        voice: voice || 'adam',
        speed: speed || 1.0,
        quality: quality || 'high'
      });
      
      // Set response time header for benchmarking
      res.set('X-Response-Time', result.processingTime.toString());
      
      // Return the synthesized audio
      res.json({ 
        audioUrl: result.audioUrl,
        format: result.format,
        message: result.message,
        success: true
      });
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      res.status(500).json({ message: "Error synthesizing speech" });
    }
  });

  // POST conversation message
  app.post("/api/conversation", async (req: Request, res: Response) => {
    try {
      // Import the Groq service directly
      const groqService = await import('./services/groqService');
      
      const { responseId, message, questionContext, agentSettings } = req.body;
      
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
      
      // Add user message to conversation
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message
      });
      
      // Get all previous messages to build context
      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      // Build a prompt for the Groq service
      let prompt = "You are a helpful AI assistant conducting a form or survey. ";
      
      if (questionContext) {
        prompt += `Current question context: ${questionContext}. `;
      }
      
      prompt += "Respond to the following message from the user in a conversational way: ";
      
      // Add conversation history for context
      if (messages.length > 1) {
        prompt += "Previous messages: ";
        messages.slice(0, -1).forEach(m => {
          prompt += `\n${m.role}: ${m.content}`;
        });
        prompt += "\n\nUser's latest message: " + message;
      } else {
        prompt += message;
      }
      
      // Use Groq to generate a response
      const options = agentSettings || {
        temperature: 0.7,
        maxTokens: 150
      };
      
      const generatedResponse = await groqService.generateResponse(prompt, options);
      const assistantResponse = generatedResponse.text;
      
      // Add assistant message to conversation
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: assistantResponse
      });
      
      // Update conversation transcript
      const updatedMessages = await storage.getMessagesByConversationId(conversation.id);
      const transcript = updatedMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      await storage.updateConversation(conversation.id, {
        transcript,
        state: { 
          currentStep: "follow-up",
          lastMessageTimestamp: new Date(),
          messageCount: updatedMessages.length
        }
      });
      
      // Analyze sentiment if appropriate
      let sentimentScore = null;
      try {
        if (message.length > 10) {
          const sentiment = await groqService.analyzeSentiment(message);
          sentimentScore = Math.round(sentiment.score * 100); // Convert to 0-100 scale
        }
      } catch (err) {
        console.error("Sentiment analysis failed:", err);
        // Continue anyway, sentiment is optional
      }
      
      // Return the AI response along with stats
      res.json({
        message: assistantResponse,
        conversationId: conversation.id,
        stats: {
          tokens: generatedResponse.tokens,
          processingTime: generatedResponse.processingTime,
          sentiment: sentimentScore
        }
      });
    } catch (error) {
      console.error("Error processing conversation:", error);
      res.status(500).json({ message: "Error processing conversation" });
    }
  });

  // Categories API endpoints
  // GET all categories for user
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Using test user ID
      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // GET categories with stats
  app.get("/api/categories/stats", async (req: Request, res: Response) => {
    try {
      // In a real app, this would use the authenticated user's ID
      const userId = 1; // Using test user ID
      const categoriesWithStats = await storage.getAllCategoriesWithStats(userId);
      res.json(categoriesWithStats);
    } catch (error) {
      console.error("Error fetching categories with stats:", error);
      res.status(500).json({ message: "Error fetching categories with stats" });
    }
  });

  // GET category by ID
  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // GET category with stats by ID
  app.get("/api/categories/:id/stats", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryStats = await storage.getCategoryWithStats(id);
      if (!categoryStats) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(categoryStats);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ message: "Error fetching category stats" });
    }
  });

  // POST Create category
  app.post("/api/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Error creating category" });
    }
  });

  // PUT Update category
  app.put("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Error updating category" });
    }
  });

  // DELETE Category
  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const success = await storage.deleteCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // GET forms by category ID
  app.get("/api/categories/:id/forms", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const forms = await storage.getFormsByCategoryId(id);
      
      // Count responses for each form
      const formsWithStats = await Promise.all(forms.map(async (form) => {
        const responses = await storage.getResponsesByFormId(form.id);
        return {
          ...form,
          responseCount: responses.length,
          lastResponseDate: responses.length > 0 ? responses[0].completedAt : null
        };
      }));
      
      res.json(formsWithStats);
    } catch (error) {
      console.error("Error fetching forms by category:", error);
      res.status(500).json({ message: "Error fetching forms by category" });
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
