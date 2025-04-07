import { storage } from '../storage';
import graphBuilder from '../engine/graphBuilder';
import groqService from '../services/groqService';
import voiceService from '../services/voiceService';
import errorHandler from '../utils/errorHandler';
import tokenGenerator from '../utils/tokenGenerator';
import validators from '../utils/validators';

/**
 * Conversation Controller - Manages conversation flow for form completion
 */
const conversationController = {
  /**
   * Initialize a new conversation for a form response
   */
  initializeConversation: async (req, res) => {
    try {
      const { formId } = req.body;
      
      // Validate form ID
      if (!formId) {
        return res.status(400).json({ message: "Form ID is required" });
      }
      
      // Check if form exists
      const form = await storage.getForm(parseInt(formId));
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }
      
      // Get form questions
      const questions = await storage.getQuestions(form.id);
      if (questions.length === 0) {
        return res.status(400).json({ message: "Form has no questions" });
      }
      
      // Create a new response for this form submission
      const response = await storage.createResponse({
        formId: form.id,
        completionTime: 0,
        device: req.headers['user-agent'],
        ipAddress: req.ip
      });
      
      // Initialize conversation state
      const initialState = {
        formId: form.id,
        responseId: response.id,
        questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: new Date().toISOString(),
        history: []
      };
      
      // Create a new conversation
      const conversation = await storage.createConversation({
        responseId: response.id,
        state: initialState,
        currentQuestionId: questions[0].id,
        isComplete: false
      });
      
      // Create initial system message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "system",
        content: `You are an AI assistant helping a user complete a form called "${form.title}". Guide them through each question in a friendly and helpful manner.`
      });
      
      // Create first assistant message
      const currentQuestion = questions[0];
      let questionPrompt = `${currentQuestion.text}`;
      
      // Add options information for certain question types
      if (['multiple', 'rating', 'yesno'].includes(currentQuestion.type) && currentQuestion.options) {
        questionPrompt += ` Choose from: ${currentQuestion.options.join(', ')}`;
      }
      
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: questionPrompt
      });
      
      res.status(201).json({
        conversationId: conversation.id,
        formId: form.id,
        responseId: response.id,
        currentQuestion: {
          id: currentQuestion.id,
          text: currentQuestion.text,
          type: currentQuestion.type,
          options: currentQuestion.options,
          required: currentQuestion.required
        },
        state: initialState
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Get the current state of a conversation
   */
  getConversationState: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get the current question
      const currentQuestion = await storage.getQuestion(conversation.currentQuestionId);
      
      // Get conversation messages
      const messages = await storage.getMessages(conversationId);
      
      res.json({
        conversationId,
        state: conversation.state,
        currentQuestion,
        isComplete: conversation.isComplete,
        messages
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Process user input in a conversation
   */
  processInput: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { text, audioBlob, audioBase64 } = req.body;
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.isComplete) {
        return res.status(400).json({ message: "Conversation is already complete" });
      }
      
      // Get current question
      const currentQuestionId = conversation.currentQuestionId;
      const currentQuestion = await storage.getQuestion(currentQuestionId);
      if (!currentQuestion) {
        return res.status(404).json({ message: "Current question not found" });
      }
      
      // Process user input
      let userInput = text;
      let transcription = null;
      
      // If audio was provided, transcribe it
      if (audioBase64 || audioBlob) {
        try {
          transcription = await voiceService.transcribe(audioBase64 || audioBlob);
          userInput = transcription.text;
        } catch (err) {
          return res.status(400).json({ message: "Failed to transcribe audio", error: err.message });
        }
      }
      
      if (!userInput) {
        return res.status(400).json({ message: "No input provided" });
      }
      
      // Create user message
      await storage.createMessage({
        conversationId,
        role: "user",
        content: userInput
      });
      
      // Process the answer with LangGraph
      const graph = graphBuilder.buildGraph(conversation.state);
      
      // Run the graph with the user input
      const result = await graph.execute({
        userInput,
        currentQuestion,
        state: conversation.state
      });
      
      // Update conversation state
      const updatedState = result.state;
      
      // Determine if we need to move to the next question
      const { questions, currentQuestionIndex } = updatedState;
      const isLastQuestion = currentQuestionIndex >= questions.length - 1;
      
      let nextQuestion = null;
      let isComplete = false;
      
      if (result.shouldContinue && !isLastQuestion) {
        // Move to the next question
        const nextIndex = currentQuestionIndex + 1;
        nextQuestion = questions[nextIndex];
        
        // Update state with next question index
        updatedState.currentQuestionIndex = nextIndex;
        
        // Create assistant message for the next question
        let questionPrompt = `${nextQuestion.text}`;
        
        // Add options information for certain question types
        if (['multiple', 'rating', 'yesno'].includes(nextQuestion.type) && nextQuestion.options) {
          questionPrompt += ` Choose from: ${nextQuestion.options.join(', ')}`;
        }
        
        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: questionPrompt
        });
      } else if (result.shouldContinue && isLastQuestion) {
        // This was the last question, complete the conversation
        isComplete = true;
        
        // Create closing message
        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: "Thank you for completing the form! Your responses have been recorded."
        });
      } else if (result.needsFollowUp) {
        // Need to follow up on the current question
        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: result.followUpMessage
        });
      }
      
      // Update the conversation
      await storage.updateConversation(conversationId, {
        state: updatedState,
        currentQuestionId: nextQuestion ? nextQuestion.id : currentQuestionId,
        isComplete
      });
      
      // If there was an answer and it's valid, save it
      if (result.validAnswer) {
        // Save the answer
        const answer = await storage.createAnswer({
          responseId: conversation.state.responseId,
          questionId: currentQuestionId,
          value: result.processedAnswer,
          transcription: userInput, // The original transcription
          sentimentScore: result.sentimentScore || null,
          // If we had real audio processing, we would save the URL here
          audioUrl: transcription ? "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3" : null
        });
        
        // Update the answers in the state
        updatedState.answers[currentQuestionId] = {
          id: answer.id,
          value: result.processedAnswer
        };
      }
      
      // If conversation is complete, update the response with completion time
      if (isComplete) {
        const startTime = new Date(conversation.state.startTime);
        const endTime = new Date();
        const completionTime = Math.round((endTime - startTime) / 1000); // in seconds
        
        await storage.updateResponse(conversation.state.responseId, {
          completionTime
        });
      }
      
      res.json({
        conversationId,
        currentQuestion: nextQuestion || currentQuestion,
        processedAnswer: result.validAnswer ? result.processedAnswer : null,
        needsFollowUp: result.needsFollowUp,
        followUpMessage: result.followUpMessage,
        isComplete,
        state: updatedState
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Get the next question in a conversation
   */
  getNextQuestion: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.isComplete) {
        return res.status(400).json({ message: "Conversation is already complete" });
      }
      
      const { questions, currentQuestionIndex } = conversation.state;
      
      if (currentQuestionIndex >= questions.length - 1) {
        return res.status(400).json({ message: "No more questions" });
      }
      
      // Move to the next question
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questions[nextIndex];
      
      // Update state with next question index
      const updatedState = {
        ...conversation.state,
        currentQuestionIndex: nextIndex
      };
      
      // Update the conversation
      await storage.updateConversation(conversationId, {
        state: updatedState,
        currentQuestionId: nextQuestion.id
      });
      
      // Create assistant message for the next question
      let questionPrompt = `${nextQuestion.text}`;
      
      // Add options information for certain question types
      if (['multiple', 'rating', 'yesno'].includes(nextQuestion.type) && nextQuestion.options) {
        questionPrompt += ` Choose from: ${nextQuestion.options.join(', ')}`;
      }
      
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: questionPrompt
      });
      
      res.json({
        conversationId,
        currentQuestion: nextQuestion,
        state: updatedState
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Save an answer in a conversation
   */
  saveAnswer: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { questionId, value, audioBlob, audioBase64, transcription } = req.body;
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.isComplete) {
        return res.status(400).json({ message: "Conversation is already complete" });
      }
      
      // Get the question
      const question = await storage.getQuestion(parseInt(questionId));
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Validate the answer
      if (question.required && !value) {
        return res.status(400).json({ message: "Answer is required" });
      }
      
      // Process transcription if needed
      let finalTranscription = transcription;
      
      if (!finalTranscription && (audioBlob || audioBase64)) {
        try {
          const result = await voiceService.transcribe(audioBase64 || audioBlob);
          finalTranscription = result.text;
        } catch (err) {
          return res.status(400).json({ message: "Failed to transcribe audio", error: err.message });
        }
      }
      
      // Perform sentiment analysis if text is available
      let sentimentScore = null;
      if (finalTranscription || (typeof value === 'string' && value.length > 10)) {
        try {
          const textToAnalyze = finalTranscription || value;
          const sentiment = await groqService.analyzeSentiment(textToAnalyze);
          sentimentScore = Math.round(sentiment.score * 100); // Convert to 0-100 scale
        } catch (err) {
          console.error("Sentiment analysis failed:", err);
          // Continue anyway, sentiment is optional
        }
      }
      
      // Save the answer
      const answer = await storage.createAnswer({
        responseId: conversation.state.responseId,
        questionId: parseInt(questionId),
        value,
        transcription: finalTranscription,
        sentimentScore,
        // If we had real audio processing, we would save the URL here
        audioUrl: audioBlob || audioBase64 ? "https://audio-samples.github.io/samples/mp3/blizzard_biased/sample-1.mp3" : null
      });
      
      // Update the answers in the state
      const updatedState = {
        ...conversation.state,
        answers: {
          ...conversation.state.answers,
          [questionId]: {
            id: answer.id,
            value
          }
        }
      };
      
      // Update the conversation
      await storage.updateConversation(conversationId, {
        state: updatedState
      });
      
      res.status(201).json({
        id: answer.id,
        questionId,
        value,
        transcription: finalTranscription,
        sentimentScore
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Complete a conversation and finalize the form response
   */
  completeConversation: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.isComplete) {
        return res.status(400).json({ message: "Conversation is already complete" });
      }
      
      // Check if all required questions have been answered
      const { questions, answers } = conversation.state;
      const unansweredRequiredQuestions = questions.filter(q => 
        q.required && !answers[q.id]
      );
      
      if (unansweredRequiredQuestions.length > 0) {
        return res.status(400).json({ 
          message: "Not all required questions have been answered",
          unansweredQuestions: unansweredRequiredQuestions
        });
      }
      
      // Calculate completion time
      const startTime = new Date(conversation.state.startTime);
      const endTime = new Date();
      const completionTime = Math.round((endTime - startTime) / 1000); // in seconds
      
      // Update the response with completion time
      await storage.updateResponse(conversation.state.responseId, {
        completionTime
      });
      
      // Mark conversation as complete
      await storage.updateConversation(conversationId, {
        isComplete: true
      });
      
      // Create closing message
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: "Thank you for completing the form! Your responses have been recorded."
      });
      
      // Get the full response with answers
      const response = await storage.getResponse(conversation.state.responseId);
      const responseAnswers = await storage.getAnswers(response.id);
      
      res.json({
        conversationId,
        isComplete: true,
        response,
        answers: responseAnswers
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Get the conversation message history
   */
  getConversationHistory: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Get messages
      const messages = await storage.getMessages(conversationId);
      
      res.json(messages);
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Handle a follow-up question from the AI
   */
  handleFollowUp: async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { followUpQuestion, context } = req.body;
      
      // Get the conversation
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      if (conversation.isComplete) {
        return res.status(400).json({ message: "Conversation is already complete" });
      }
      
      // Create assistant message for the follow-up question
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: followUpQuestion
      });
      
      // Update the state with follow-up context
      const updatedState = {
        ...conversation.state,
        followUpContext: context
      };
      
      // Update the conversation
      await storage.updateConversation(conversationId, {
        state: updatedState
      });
      
      res.json({
        conversationId,
        followUpQuestion,
        state: updatedState
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Transcribe audio to text
   */
  transcribeAudio: async (req, res) => {
    try {
      const { audio } = req.files || {};
      const { audioBase64 } = req.body || {};
      
      if (!audio && !audioBase64) {
        return res.status(400).json({ message: "No audio provided" });
      }
      
      let transcription;
      
      if (audio) {
        transcription = await voiceService.transcribe(audio.data);
      } else {
        transcription = await voiceService.transcribe(audioBase64);
      }
      
      res.json({ text: transcription.text });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Process voice input to extract structured information
   */
  processVoiceInput: async (req, res) => {
    try {
      const { audio, audioBase64, questionType, questionText, options } = req.body;
      
      if (!audio && !audioBase64) {
        return res.status(400).json({ message: "No audio provided" });
      }
      
      if (!questionType || !questionText) {
        return res.status(400).json({ message: "Question type and text are required" });
      }
      
      // First transcribe the audio
      let transcription;
      
      if (audio) {
        transcription = await voiceService.transcribe(audio);
      } else {
        transcription = await voiceService.transcribe(audioBase64);
      }
      
      // Process the transcription based on question type
      const processedAnswer = await groqService.processAnswer(
        transcription.text,
        questionType,
        questionText,
        options
      );
      
      // Perform sentiment analysis
      let sentimentScore = null;
      try {
        const sentiment = await groqService.analyzeSentiment(transcription.text);
        sentimentScore = Math.round(sentiment.score * 100); // Convert to 0-100 scale
      } catch (err) {
        console.error("Sentiment analysis failed:", err);
        // Continue anyway, sentiment is optional
      }
      
      res.json({
        transcription: transcription.text,
        processedAnswer,
        sentimentScore
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Analyze sentiment of text
   */
  analyzeSentiment: async (req, res) => {
    try {
      const { text, audio, audioBase64 } = req.body;
      
      if (!text && !audio && !audioBase64) {
        return res.status(400).json({ message: "No text or audio provided" });
      }
      
      let textToAnalyze = text;
      
      // If audio was provided, transcribe it first
      if (!text && (audio || audioBase64)) {
        const transcription = await voiceService.transcribe(audio || audioBase64);
        textToAnalyze = transcription.text;
      }
      
      const sentiment = await groqService.analyzeSentiment(textToAnalyze);
      
      res.json({
        text: textToAnalyze,
        sentiment: sentiment.sentiment,
        score: sentiment.score
      });
    } catch (error) {
      errorHandler(error, req, res);
    }
  },

  /**
   * Convert text to speech
   */
  textToSpeech: async (req, res) => {
    try {
      const { text, voice } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "No text provided" });
      }
      
      const audioBuffer = await voiceService.textToSpeech(text, voice);
      
      res.set('Content-Type', 'audio/mp3');
      res.send(audioBuffer);
    } catch (error) {
      errorHandler(error, req, res);
    }
  }
};

export default conversationController;
