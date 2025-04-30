// prompts.js

// Generate system prompt for OpenActivity
export function generateOpeningPrompt(openingConfig) {
  // If direct prompt is enabled, use the prompt as is
  if (openingConfig.useDirectPrompt) {
    return openingConfig.prompt;
  }
  
  // Otherwise, generate a prompt based on background info
  return `
You're a helpful voice assistant representing a company. 
Your task is to introduce yourself and start a conversation with the user.

BACKGROUND INFORMATION:
${openingConfig.backgroundInfo || "No specific background information provided."}

Based on this information, create a friendly, conversational opening message that:
1. Introduces yourself
2. Explains the purpose of this conversation
3. Makes the user feel comfortable engaging with you

Do not use phrases like "based on the background information" in your response.
Create a natural, direct greeting as if you're speaking to the user.
  `;
}

// Generate system prompt for Question node
export function generateQuestionPrompt(questionConfig, dynamicReferences = {}) {
  // Replace any dynamic references in the prompt
  let prompt = questionConfig.prompt;
  Object.entries(dynamicReferences).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(placeholder, value);
  });
  
  // If direct prompt is enabled, use the processed prompt as is
  if (questionConfig.useDirectPrompt) {
    return prompt;
  }
  
  // Generate a more sophisticated prompt based on background info
  let systemPrompt = `
You're a helpful voice assistant asking questions as part of a form.

BACKGROUND INFORMATION:
${questionConfig.backgroundInfo || "No specific background information provided."}

QUESTION TO ASK:
${prompt}

EXPECTED RESPONSE FORMAT:
${questionConfig.expectedResponseFormat}
${questionConfig.options ? `OPTIONS: ${questionConfig.options.join(", ")}` : ""}

Ask this question in a natural, conversational way. If you need to add context to make the question
clearer, feel free to do so while maintaining the core question.

The user's response should match the expected format. Don't mention the expected format in your question
unless it would be natural to do so.

Do not use phrases like "based on the background information" in your response.
  `;
  
  return systemPrompt;
}

// Generate system prompt for validation
export function generateValidationPrompt(questionConfig, userResponse) {
  return `
You are validating a user's response to the following question:
"${questionConfig.prompt}"

Expected format: ${questionConfig.expectedResponseFormat}
${questionConfig.options ? `Valid options: ${questionConfig.options.join(", ")}` : ""}
${questionConfig.validResponseExample ? `Example of valid response: "${questionConfig.validResponseExample}"` : ""}
${questionConfig.invalidResponseExample ? `Example of invalid response: "${questionConfig.invalidResponseExample}"` : ""}

User's response: "${userResponse}"

Determine if this response is valid based on the expected format and criteria.
Return a JSON object with the following structure:
{
  "isValid": true/false,
  "extractedValue": "normalized value to store if valid, otherwise null",
  "confidence": 0.0-1.0,
  "reason": "brief explanation of validation result"
}

For multiple choice questions, check if the response clearly indicates one of the valid options.
For yes/no questions, accept variations like "yeah", "nope", "yep", etc.
For other formats, ensure the response matches the expected data type.
  `;
}

// Generate system prompt for rephrase
export function generateRephrasePrompt(questionConfig, attemptCount) {
  if (questionConfig.rephrasePrompt) {
    return questionConfig.rephrasePrompt;
  }
  
  // Generate appropriate rephrase prompt based on attempt count
  if (attemptCount === 1) {
    return `I'm sorry, I didn't quite get that. ${questionConfig.prompt} Could you please try again?`;
  } else {
    // More detailed prompt for multiple failed attempts
    let rephrasePrompt = `I'm still having trouble understanding your response. `;
    
    if (questionConfig.expectedResponseFormat === "multiple_choice" && questionConfig.options) {
      rephrasePrompt += `Please choose one of the following options: ${questionConfig.options.join(", ")}. `;
    } else if (questionConfig.expectedResponseFormat === "yes_no") {
      rephrasePrompt += `Please answer with yes or no. `;
    } else if (questionConfig.validResponseExample) {
      rephrasePrompt += `For example, you could say something like "${questionConfig.validResponseExample}". `;
    }
    
    rephrasePrompt += `${questionConfig.prompt}`;
    return rephrasePrompt;
  }
}

// Generate system prompt for ClosingActivity
export function generateClosingPrompt(closingConfig, responses) {
  // If direct prompt is enabled, use the prompt as is
  if (closingConfig.useDirectPrompt) {
    return closingConfig.prompt;
  }
  
  // Generate a summary of collected responses
  const responseSummary = Object.entries(responses)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
  
  // Otherwise, generate a prompt based on background info and responses
  return `
You're a helpful voice assistant concluding a conversation with a user.
You've collected the following information:

${responseSummary}

BACKGROUND INFORMATION:
${closingConfig.backgroundInfo || "No specific background information provided."}

Based on this information, create a friendly closing message that:
1. Thanks the user for their time
2. Briefly summarizes the key information collected (be concise)
3. Explains what will happen next
4. Asks if they have any questions before concluding

Do not use phrases like "based on the background information" in your response.
Create a natural, conversational closing as if you're speaking directly to the user.
  `;
}