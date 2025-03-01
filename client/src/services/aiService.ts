import { OpenAI } from 'openai';

// Initialize OpenAI client
let openai: OpenAI | null = null;

// Initialize ElevenLabs client (we'll use the API directly)
let elevenLabsApiKey: string | null = null;

// Native WebSocket connection
let webSocket: WebSocket | null = null;

/**
 * Initialize AI services with required API keys
 */
export const initializeAIServices = (openaiKey: string, elevenLabsKey: string) => {
  try {
    // Initialize OpenAI
    if (openaiKey) {
      openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true // Enable in browser for demo purposes
      });
    }
    
    // Store ElevenLabs API key for direct API calls
    if (elevenLabsKey) {
      elevenLabsApiKey = elevenLabsKey;
    }
    
    // For demo purposes, we can proceed without actual API keys
    return true;
  } catch (error) {
    console.error('Error initializing AI services:', error);
    return false;
  }
};

/**
 * Generate a text response from OpenAI
 */
export const generateResponse = async (prompt: string, temperature: number = 0.7, maxTokens: number = 150) => {
  if (!openai) {
    console.error('OpenAI not initialized. Please provide an API key.');
    return {
      text: "AI service not initialized. Please provide API keys to enable this feature.",
      stats: {
        latency: 0,
        processingTime: 0,
        tokens: 0
      }
    };
  }
  
  const startTime = Date.now();
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant helping users complete a form. Be concise and helpful." },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
    });
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    return {
      text: completion.choices[0].message.content || "No response generated",
      stats: {
        latency: processingTime,
        processingTime,
        tokens: completion.usage?.total_tokens || 0
      }
    };
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    return {
      text: "Sorry, there was an error generating a response. Please try again.",
      stats: {
        latency: 0,
        processingTime: 0,
        tokens: 0
      }
    };
  }
};

/**
 * Transcribe audio from the user's microphone
 * @returns Promise<string> Transcribed text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  console.log('Simulating audio transcription...');
  
  // For demo purposes, return a simulated transcript
  return new Promise<string>((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Return a mock transcript
      const mockResponses = [
        "Hello, I'm calling about the form submission.",
        "I would rate my experience as excellent, definitely a 5 out of 5.",
        "I'd like to provide some feedback on your service.",
        "Yes, I'm interested in learning more about your products.",
        "Thank you for your assistance today."
      ];
      
      // Pick a random response
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      console.log('Simulated transcript:', randomResponse);
      
      resolve(randomResponse);
    }, 1500);
  });
};

/**
 * Generate text-to-speech audio using ElevenLabs API
 */
export const generateSpeech = async (text: string, voice = "male", speed = 1.0) => {
  console.log('Simulating text-to-speech conversion...');
  console.log(`Text: "${text}", Voice: ${voice}, Speed: ${speed}`);
  
  return new Promise<Blob>((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Create a mock audio blob
      const audioBlob = new Blob(['simulated audio data'], { type: 'audio/mpeg' });
      console.log('Generated simulated speech audio');
      
      resolve(audioBlob);
    }, 1000);
  });
};

/**
 * Set up WebSocket connection for real-time voice interaction
 */
export const setupWebSocketConnection = (url: string, onMessage: (data: any) => void) => {
  try {
    // For demo purposes, we'll simulate WebSocket connection rather than connect to a real one
    // This prevents errors when WebSockets aren't available
    console.log('Simulating WebSocket connection...');
    
    // Simulate successful connection
    setTimeout(() => {
      console.log('WebSocket simulated connection established');
      
      // Simulate receiving a message after a delay
      setTimeout(() => {
        onMessage({
          type: 'response',
          text: "Hello, I'm the voice assistant. How can I help you today?",
          messageId: Date.now().toString(),
          stats: {
            latency: 250,
            processingTime: 450,
            tokens: 30
          }
        });
      }, 2000);
    }, 500);
    
    return true;
  } catch (error) {
    console.error('Error setting up WebSocket connection:', error);
    return false;
  }
};

/**
 * Send a message through the WebSocket connection
 */
export const sendWebSocketMessage = (message: any) => {
  // For demo purposes, simulate sending a message
  console.log('Simulating sending message:', message);
  
  // Simulate a response after a short delay
  setTimeout(() => {
    console.log('Simulated message sent successfully');
  }, 100);
  
  return true;
};

/**
 * Close the WebSocket connection
 */
export const closeWebSocketConnection = () => {
  // For demo purposes, simulate closing the connection
  console.log('Simulated WebSocket connection closed');
  webSocket = null;
};