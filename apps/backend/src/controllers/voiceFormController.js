// server/controllers/voiceFormController.js
import { FormConfigSchema, runVoiceForm, continueConversation as continueFormConversation } from '../engine/index.js';
import { storage } from '../storage.js';

// Create a voice form agent from a form configuration
export const createVoiceAgent = async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate the form data against the schema
    const validatedConfig = FormConfigSchema.parse({
      ...formData,
      id: formData.id || `form_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Return the validated form configuration
    res.status(201).json({ 
      success: true, 
      message: "Voice agent created successfully", 
      formId: validatedConfig.id,
      config: validatedConfig
    });
  } catch (error) {
    console.error("Error creating voice agent:", error);
    res.status(400).json({ 
      success: false, 
      message: "Error creating voice agent", 
      error: error.message 
    });
  }
};

// Start a conversation with a voice form agent
export const startConversation = async (req, res) => {
  try {
    const { formId } = req.params;
    
    // Fetch the form from the database or storage
    const form = await storage.getFormWithQuestions(Number(formId));
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Convert the form to the voice agent format
    const formConfig = convertFormToVoiceConfig(form);
    
    // Initialize the conversation
    const result = await runVoiceForm(formConfig);
    
    // Store the conversation state in the database
    // This is just a placeholder, replace with actual database calls
    const conversation = {
      id: result.conversationId,
      formId: formId,
      state: result,
      createdAt: new Date()
    };
    
    res.status(200).json({
      success: true,
      conversation: result,
      nextMessage: getLatestAssistantMessage(result.messages)
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(400).json({
      success: false,
      message: "Error starting conversation",
      error: error.message
    });
  }
};

// Continue a conversation with a voice form agent
export const continueConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userInput } = req.body;
    
    // Fetch the conversation state from the database
    // This is just a placeholder, replace with actual database calls
    const conversation = { state: {} }; // Fetch from database
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      });
    }
    
    // Get the associated form
    const form = await storage.getFormWithQuestions(Number(conversation.formId));
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Convert the form to the voice agent format
    const formConfig = convertFormToVoiceConfig(form);
    
    // Continue the conversation
    const result = await continueFormConversation(formConfig, conversation.state, userInput);
    
    // Update the conversation state in the database
    // This is just a placeholder, replace with actual database calls
    
    res.status(200).json({
      success: true,
      conversation: result,
      isComplete: result.isComplete,
      nextMessage: getLatestAssistantMessage(result.messages)
    });
  } catch (error) {
    console.error("Error continuing conversation:", error);
    res.status(400).json({
      success: false,
      message: "Error continuing conversation",
      error: error.message
    });
  }
};

// Helper function to convert database form to voice agent format
function convertFormToVoiceConfig(form) {
  // Map question types from database to voice agent format
  const mapQuestionType = (type) => {
    const typeMap = {
      'multiple_choice': 'multiple_choice',
      'text': 'text',
      'rating': 'number',
      'date': 'date'
    };
    return typeMap[type] || 'text';
  };
  
  // Extract questions and sort by order
  const questions = form.questions
    .map(q => ({
      id: q.id.toString(),
      prompt: q.text,
      backgroundInfo: q.description || undefined,
      expectedResponseFormat: mapQuestionType(q.type),
      useDirectPrompt: true,
      options: q.options && Array.isArray(q.options) ? q.options : undefined,
      required: q.required || false,
      maxAttempts: 3,
      order: q.order
    }))
    .sort((a, b) => a.order - b.order);
  
  // Construct the form configuration
  return {
    id: form.id.toString(),
    name: form.title,
    description: form.description || "",
    openingActivity: {
      prompt: `Hello! Welcome to the ${form.title} form. I'll be guiding you through some questions.`,
      useDirectPrompt: true
    },
    questions: questions,
    closingActivity: {
      prompt: "Thank you for completing this form! Your responses have been recorded.",
      useDirectPrompt: true
    },
    collectEmail: form.collectEmail || false
  };
}

// Helper function to get the latest assistant message
function getLatestAssistantMessage(messages) {
  // Reverse the array to find the latest assistant message
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      return messages[i].content;
    }
  }
  return null;
}