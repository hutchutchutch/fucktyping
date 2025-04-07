// nodes.js
import {
  generateOpeningPrompt,
  generateQuestionPrompt,
  generateValidationPrompt,
  generateRephrasePrompt,
  generateClosingPrompt
} from './prompts.js';

import {
  updateStateWithResponse,
  advanceToNextQuestion,
  completeConversation
} from './state.js';

// OpenActivity node - starts the conversation
export const createOpenActivityNode = (formConfig) => {
  return async (state) => {
    // Generate the opening prompt
    const openingPrompt = generateOpeningPrompt(formConfig.openingActivity);
    
    // Create the assistant message
    const assistantMessage = {
      role: "assistant",
      content: openingPrompt
    };
    
    // Add to conversation history
    const messages = [...state.messages, assistantMessage];
    
    // Update the state
    return {
      ...state,
      messages,
      currentNodeId: "question"
    };
  };
};

// Question node - asks the current question
export const createQuestionNode = (formConfig) => {
  return async (state) => {
    const { questions } = formConfig;
    const { currentQuestionIndex, dynamicReferences } = state;
    
    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      // No more questions, move to closing
      return {
        ...state,
        currentNodeId: "closing_activity"
      };
    }
    
    // Generate the question prompt
    const questionPrompt = generateQuestionPrompt(currentQuestion, dynamicReferences);
    
    // Create the assistant message
    const assistantMessage = {
      role: "assistant",
      content: questionPrompt
    };
    
    // Add to conversation history
    const messages = [...state.messages, assistantMessage];
    
    // Update the state
    return {
      ...state,
      messages,
      currentNodeId: "validate_response"
    };
  };
};

// ValidateResponse node - validates the user's response
export const createValidateResponseNode = (formConfig, llm) => {
  return async (state) => {
    const { questions } = formConfig;
    const { currentQuestionIndex, messages, currentAttempts } = state;
    
    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];
    
    // Get the last user message
    const lastUserMessage = messages
      .filter(msg => msg.role === "user")
      .pop();
    
    if (!lastUserMessage) {
      // No user message to validate
      return {
        ...state,
        currentNodeId: "question"
      };
    }
    
    try {
      // Generate validation prompt
      const validationPrompt = generateValidationPrompt(currentQuestion, lastUserMessage.content);
      
      // Call LLM to validate
      const validationResult = await llm.invoke([
        { role: "system", content: validationPrompt }
      ]);
      
      // Parse the validation result
      const parsedResult = JSON.parse(validationResult.content);
      
      if (parsedResult.isValid) {
        // Valid response, store it and move to next question
        const updatedState = updateStateWithResponse(
          state, 
          currentQuestion.id, 
          parsedResult.extractedValue
        );
        
        // Check if we've reached the end of questions
        if (currentQuestionIndex >= questions.length - 1) {
          return {
            ...updatedState,
            currentNodeId: "closing_activity"
          };
        }
        
        // Move to next question
        return {
          ...advanceToNextQuestion(updatedState),
          currentNodeId: "question"
        };
      } else {
        // Invalid response, check if we've reached max attempts
        if (currentAttempts >= currentQuestion.maxAttempts - 1) {
          // Too many attempts, move to next question or skip
          if (currentQuestion.required) {
            // For required questions, we need to keep trying
            return {
              ...state,
              currentAttempts: 0,
              currentNodeId: "rephrase_question"
            };
          } else {
            // For optional questions, we can skip
            if (currentQuestionIndex >= questions.length - 1) {
              return {
                ...state,
                currentNodeId: "closing_activity"
              };
            }
            
            return {
              ...advanceToNextQuestion(state),
              currentNodeId: "question"
            };
          }
        }
        
        // Increment attempts and try again
        return {
          ...state,
          currentAttempts: currentAttempts + 1,
          currentNodeId: "rephrase_question"
        };
      }
    } catch (error) {
      console.error("Error validating response:", error);
      
      // Handle validation error, try again
      return {
        ...state,
        currentNodeId: "rephrase_question"
      };
    }
  };
};

// RephraseQuestion node - rephrases the question if validation fails
export const createRephraseNode = (formConfig) => {
  return async (state) => {
    const { questions } = formConfig;
    const { currentQuestionIndex, currentAttempts } = state;
    
    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];
    
    // Generate the rephrase prompt
    const rephrasePrompt = generateRephrasePrompt(currentQuestion, currentAttempts);
    
    // Create the assistant message
    const assistantMessage = {
      role: "assistant",
      content: rephrasePrompt
    };
    
    // Add to conversation history
    const messages = [...state.messages, assistantMessage];
    
    // Update the state
    return {
      ...state,
      messages,
      currentNodeId: "validate_response"
    };
  };
};

// ClosingActivity node - closes the conversation
export const createClosingActivityNode = (formConfig) => {
  return async (state) => {
    // Generate the closing prompt
    const closingPrompt = generateClosingPrompt(formConfig.closingActivity, state.responses);
    
    // Create the assistant message
    const assistantMessage = {
      role: "assistant",
      content: closingPrompt
    };
    
    // Add to conversation history
    const messages = [...state.messages, assistantMessage];
    
    // Determine if follow-up is needed
    const requiresFollowUp = formConfig.closingActivity.followUpEmailTemplate !== undefined;
    
    // Update the state and mark as complete
    return completeConversation({
      ...state,
      messages
    }, requiresFollowUp);
  };
};

// ProcessUserInput node - handles user input
export const createProcessUserInputNode = () => {
  return async (state, { userInput }) => {
    if (!userInput) {
      return state;
    }
    
    // Create the user message
    const userMessage = {
      role: "user",
      content: userInput
    };
    
    // Add to conversation history
    const messages = [...state.messages, userMessage];
    
    // Update the state
    return {
      ...state,
      messages
    };
  };
};