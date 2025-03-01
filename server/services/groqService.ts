/**
 * Groq AI Service - For text generation, sentiment analysis, and other AI features
 * Using LangChain integration with Groq
 */

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize the Groq chat model
const groqChat = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY || '',
  modelName: "grok-2-1212" // Using Grok 2 as our default model
});

/**
 * Generate a response using a Groq model via LangChain
 * @param {string} prompt - The input prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated response
 */
export async function generateResponse(prompt: string, options: {
  temperature?: number;
  maxTokens?: number;
  model?: string;
} = {}) {
  const { 
    temperature = 0.7, 
    maxTokens = 250,
    model = 'grok-2-1212' 
  } = options;
  
  console.log(`Generating response using ${model} with temperature ${temperature}`);
  
  try {
    const startTime = Date.now();
    
    // Create a chat prompt template
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["user", prompt]
    ]);
    
    // Set Groq model parameters
    const modelWithParams = groqChat.bind({
      temperature: temperature,
      maxTokens: maxTokens,
    });
    
    // Create the LangChain chain
    const chain = chatPrompt.pipe(modelWithParams).pipe(new StringOutputParser());
    
    // Execute the chain
    const responseText = await chain.invoke({});
    
    const processingTime = Date.now() - startTime;
    
    // Since LangChain doesn't provide token counts directly, we're estimating
    const estimatedTokenCount = Math.round(prompt.length / 4) + Math.round(responseText.length / 4);
    const estimatedInputTokens = Math.round(prompt.length / 4);
    const estimatedOutputTokens = Math.round(responseText.length / 4);
    
    return {
      text: responseText,
      tokens: estimatedTokenCount,
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      processingTime,
      model,
      temperature,
      completion_time: processingTime
    };
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Process an answer based on question type
 * @param {string} text - The transcript text
 * @param {string} questionType - Type of question
 * @param {string} questionText - The question text
 * @param {Array} options - Options for multiple choice questions
 * @returns {Promise<any>} - Processed answer
 */
export async function processAnswer(
  text: string, 
  questionType: string, 
  questionText: string, 
  options: string[] = []
) {
  try {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (questionType) {
      case 'multiple_choice':
        if (!options || options.length === 0) {
          return { value: text, confidence: 0.7 };
        }
        
        // Simple matching algorithm
        const userTextLower = text.toLowerCase();
        const matches = options.map((option, index) => {
          const optionText = option.toLowerCase();
          // Check if the option text appears in the user input
          if (userTextLower.includes(optionText)) {
            return { index, option, confidence: 0.9 };
          }
          
          // Check for option number mentions ("option 1", "first option", etc.)
          const numberWords = ['first', 'second', 'third', 'fourth', 'fifth', 'option 1', 'option 2', 'option 3', 'option 4', 'option 5'];
          if (numberWords[index] && userTextLower.includes(numberWords[index])) {
            return { index, option, confidence: 0.8 };
          }
          
          return { index, option, confidence: 0 };
        });
        
        // Find the best match
        const bestMatch = matches.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        , { confidence: 0, option: '', index: -1 });
        
        if (bestMatch.confidence > 0.5) {
          return { 
            value: bestMatch.option, 
            index: bestMatch.index,
            confidence: bestMatch.confidence
          };
        }
        
        return { value: text, confidence: 0.3 };
        
      case 'rating':
        // Extract numeric ratings from text
        const ratingMatch = text.match(/\b([0-5]|five|four|three|two|one)\b/i);
        if (ratingMatch) {
          const ratingText = ratingMatch[1].toLowerCase();
          const ratingMap: Record<string, number> = { 'five': 5, 'four': 4, 'three': 3, 'two': 2, 'one': 1 };
          const rating = ratingMap[ratingText] || parseInt(ratingText);
          
          return { 
            value: rating, 
            confidence: 0.9
          };
        }
        
        // Look for sentiment words
        const sentimentWords = {
          positive: ['excellent', 'awesome', 'great', 'good', 'love', 'best'],
          neutral: ['okay', 'fine', 'average', 'neutral', 'moderate'],
          negative: ['poor', 'bad', 'terrible', 'worst', 'hate', 'dislike']
        };
        
        const textLowerCase = text.toLowerCase();
        
        for (const word of sentimentWords.positive) {
          if (textLowerCase.includes(word)) {
            return { value: 5, confidence: 0.8 };
          }
        }
        
        for (const word of sentimentWords.neutral) {
          if (textLowerCase.includes(word)) {
            return { value: 3, confidence: 0.7 };
          }
        }
        
        for (const word of sentimentWords.negative) {
          if (textLowerCase.includes(word)) {
            return { value: 1, confidence: 0.8 };
          }
        }
        
        return { value: text, confidence: 0.3 };
        
      case 'date':
        // Simple date extraction
        const dateMatch = text.match(/\b(\d{1,2}[ /-]\d{1,2}[ /-]\d{2,4})\b/);
        if (dateMatch) {
          return { value: dateMatch[1], confidence: 0.9 };
        }
        
        // Look for month names
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthMatch = months.find(month => text.toLowerCase().includes(month));
        
        if (monthMatch) {
          return { value: text, confidence: 0.7 };
        }
        
        return { value: text, confidence: 0.5 };
        
      case 'text':
      default:
        return { value: text, confidence: 1.0 };
    }
  } catch (error) {
    console.error('Error processing answer:', error);
    return { value: text, confidence: 0.5, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
export async function analyzeSentiment(text: string) {
  try {
    // For development we use a simple keyword-based approach
    // In production, we would use LangChain with Groq for sentiment analysis
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'happy', 'best', 'like', 'enjoy', 'positive', 'helpful', 'wonderful', 'fantastic', 'awesome', 'pleased', 'satisfied'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'difficult', 'negative', 'unhappy', 'disappointed', 'frustrating', 'useless', 'horrible', 'annoying'];
    
    const lowerText = text.toLowerCase();
    let score = 0.5; // Neutral starting point
    
    // Count positive and negative word occurrences
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount++;
      }
    }
    
    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount++;
      }
    }
    
    // Adjust score based on positive/negative ratio
    if (positiveCount > 0 || negativeCount > 0) {
      const total = positiveCount + negativeCount;
      score = 0.5 + ((positiveCount - negativeCount) / (2 * total));
      
      // Clamp between 0 and 1
      score = Math.max(0, Math.min(1, score));
    }
    
    return {
      score,
      positive: score > 0.6,
      negative: score < 0.4,
      neutral: score >= 0.4 && score <= 0.6,
      confidence: Math.abs((score - 0.5) * 2)
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze sentiment');
  }
}