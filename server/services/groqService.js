/**
 * Groq AI Service - For text generation, sentiment analysis, and other AI features
 */

// In a real app with an actual Groq API key, you would use the official client
// const { GroqClient } = require('@groq/api');
// const client = new GroqClient({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate a response using a Groq model
 * @param {string} prompt - The input prompt
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Generated response
 */
async function generateResponse(prompt, options = {}) {
  const { 
    temperature = 0.7, 
    maxTokens = 150,
    model = 'grok-2-1212' 
  } = options;
  
  console.log(`Generating response using ${model} with temperature ${temperature}`);
  
  try {
    // Simulating API latency
    const startTime = Date.now();
    const processingTime = Math.floor(Math.random() * 300) + 100; // 100-400ms
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // In a real implementation, you would call the Groq API
    // const response = await client.chat.completions.create({
    //   model,
    //   messages: [{ role: "user", content: prompt }],
    //   temperature,
    //   max_tokens: maxTokens,
    // });
    
    // For this demo, generate a realistic response based on the prompt
    let text = '';
    
    if (prompt.includes('form') || prompt.includes('survey')) {
      text = "Thank you for your response! That's helpful information. Is there anything specific you'd like to add about your experience?";
    } else if (prompt.includes('product') || prompt.includes('service')) {
      text = "I appreciate your feedback about our product. Your insights will help us improve. Do you have any suggestions for features you'd like to see in the future?";
    } else if (prompt.includes('experience') || prompt.includes('feedback')) {
      text = "Thanks for sharing your experience. It's valuable for us to understand how we're doing. Would you mind elaborating a bit more on what aspects stood out to you?";
    } else if (prompt.includes('rate') || prompt.includes('rating')) {
      text = "Thank you for your rating! We're always looking to improve. Could you tell me what factors influenced your rating the most?";
    } else {
      text = "Thank you for your response. That's helpful information for our survey. Is there anything else you'd like to share before we move to the next question?";
    }
    
    // Calculate tokens (very rough estimation for demo)
    const inputTokens = Math.ceil(prompt.length / 4);
    const outputTokens = Math.ceil(text.length / 4);
    const totalTokens = inputTokens + outputTokens;
    
    return {
      text,
      tokens: totalTokens,
      processingTime,
      model,
      temperature,
      completion_time: Date.now() - startTime
    };
  } catch (error) {
    console.error('Error generating Groq response:', error);
    throw new Error('Failed to generate AI response');
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
async function processAnswer(text, questionType, questionText, options = []) {
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
        , { confidence: 0 });
        
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
          const ratingMap = { 'five': 5, 'four': 4, 'three': 3, 'two': 2, 'one': 1 };
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
    return { value: text, confidence: 0.5, error: error.message };
  }
}

/**
 * Analyze sentiment of text
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
async function analyzeSentiment(text) {
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would call the Groq API for sentiment analysis
    // For this demo, use a simple keyword-based approach
    
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

module.exports = {
  generateResponse,
  processAnswer,
  analyzeSentiment
};

// Export default for ESM imports
module.exports.default = module.exports;