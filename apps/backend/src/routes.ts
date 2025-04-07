import { Express } from "express";
import { Server as SocketIOServer } from "socket.io";
import * as formController from "./controllers/formController";
import * as responseController from "./controllers/responseController";
import * as conversationController from "./controllers/conversationController";
import * as voiceFormController from "./controllers/voiceFormController";
import * as emailController from "./controllers/emailController";

export async function registerRoutes(app: Express, io: SocketIOServer) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // WebRTC signaling endpoints
  app.post("/api/rtc/create-room", (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }
    
    res.json({ 
      success: true, 
      roomId, 
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });
  });

  // Form routes
  app.get("/api/forms", formController.getForms);
  app.get("/api/forms/:id", formController.getFormById);
  app.post("/api/forms", formController.createForm);
  app.put("/api/forms/:id", formController.updateForm);
  app.delete("/api/forms/:id", formController.deleteForm);
  app.get("/api/forms/:id/questions", formController.getFormQuestions);
  app.post("/api/forms/:id/questions", formController.createQuestion);
  app.put("/api/forms/:id/questions/:questionId", formController.updateQuestion);
  app.delete("/api/forms/:id/questions/:questionId", formController.deleteQuestion);
  app.post("/api/forms/:id/reorder-questions", formController.reorderQuestions);

  // Response routes
  app.get("/api/forms/:formId/responses", responseController.getFormResponses);
  app.get("/api/responses/:id", responseController.getResponseById);
  app.post("/api/forms/:formId/responses", responseController.createResponse);
  app.put("/api/responses/:id", responseController.updateResponse);
  app.delete("/api/responses/:id", responseController.deleteResponse);
  app.get("/api/forms/:formId/analytics", responseController.getFormAnalytics);

  // Conversation routes
  app.get("/api/conversations/:id", conversationController.getConversationById);
  app.post("/api/forms/:formId/conversations", conversationController.startConversation);
  app.post("/api/conversations/:id/messages", conversationController.addMessage);
  app.get("/api/conversations/:id/transcript", conversationController.getTranscript);

  // Voice form routes
  app.post("/api/voice/forms/:formId/start", voiceFormController.startVoiceForm);
  app.post("/api/voice/forms/:formId/continue", voiceFormController.continueVoiceForm);
  app.post("/api/voice/transcribe", voiceFormController.transcribeAudio);
  app.post("/api/voice/synthesize", voiceFormController.synthesizeSpeech);

  // Email routes
  app.post("/api/email/send-notification", emailController.sendFormNotification);
  app.post("/api/email/templates/:formId", emailController.updateEmailTemplate);
  app.get("/api/email/templates/:formId", emailController.getEmailTemplate);

  return app;
}