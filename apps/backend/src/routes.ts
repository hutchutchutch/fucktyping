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
  app.get("/api/forms/:formId/responses", responseController.default.getFormResponses);
  app.get("/api/responses/:id", responseController.default.getResponseById);
  app.post("/api/forms/:formId/responses", responseController.default.submitResponse);
  // TODO: Implement updateResponse in responseController
  // app.put("/api/responses/:id", responseController.default.updateResponse);
  // TODO: Implement deleteResponse in responseController
  // app.delete("/api/responses/:id", responseController.default.deleteResponse);
  // TODO: Implement getFormAnalytics in responseController
  // app.get("/api/forms/:formId/analytics", responseController.default.getFormAnalytics);

  // Conversation routes
  app.get("/api/conversations/:id", conversationController.default.getConversationState);
  app.post("/api/forms/:formId/conversations", conversationController.default.initializeConversation);
  // TODO: Implement addMessage or clarify which conversationController method to use
  // app.post("/api/conversations/:id/messages", conversationController.default.addMessage);
  // TODO: Implement getTranscript or clarify which conversationController method to use (getConversationState returns messages)
  // app.get("/api/conversations/:id/transcript", conversationController.default.getTranscript);

  // Voice form routes
  app.post("/api/voice/forms/:formId/start", voiceFormController.startConversation);
  app.post("/api/voice/forms/:formId/continue", voiceFormController.continueConversation);
  // TODO: Implement transcribeAudio in voiceFormController
  // app.post("/api/voice/transcribe", voiceFormController.transcribeAudio);
  // TODO: Implement synthesizeSpeech in voiceFormController
  // app.post("/api/voice/synthesize", voiceFormController.synthesizeSpeech);

  // Email routes
  // TODO: Clarify which emailController method should handle this route. sendResponseNotification is not an Express handler.
  // app.post("/api/email/send-notification", emailController.default.sendResponseNotification);
  // TODO: Implement updateEmailTemplate in emailController
  // app.post("/api/email/templates/:formId", emailController.default.updateEmailTemplate);
  // TODO: Implement getEmailTemplate in emailController
  // app.get("/api/email/templates/:formId", emailController.default.getEmailTemplate);

  return app;
}