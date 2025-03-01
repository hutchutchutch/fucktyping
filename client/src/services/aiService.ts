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
 */
export const transcribeAudio = async (audioBlob: Blob) => {
  if (!openai) {
    console.error('OpenAI not initialized. Please provide an API key.');
    return "AI service not initialized. Please provide API keys to enable this feature.";
  }
  
  try {
    // For the demo, let's use our API endpoint instead of direct OpenAI API calls
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    const response = await fetch('/api/voice/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.transcript || "Sorry, couldn't transcribe the audio.";
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return "Sorry, there was an error transcribing your audio. Please try again.";
  }
};

/**
 * Generate text-to-speech audio using ElevenLabs API
 */
export const generateSpeech = async (text: string, voice = "male", speed = 1.0) => {
  if (!elevenLabsApiKey) {
    console.error('ElevenLabs not initialized. Please provide an API key.');
    // Use our API endpoint instead
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice, speed })
      });
      
      const data = await response.json();
      
      // This is just a simulation since we're not actually connecting to ElevenLabs
      if (data.audioUrl) {
        // In a real app, we would fetch the audio and convert it to a blob
        return new Blob(['mock audio data'], { type: 'audio/mpeg' });
      }
      return null;
    } catch (error) {
      console.error('Error generating speech via API:', error);
      return null;
    }
  }
  
  // In a real app, we would directly call the ElevenLabs API here
  console.log('Using mock ElevenLabs implementation');
  return new Blob(['mock audio data'], { type: 'audio/mpeg' });
};

/**
 * Set up WebSocket connection for real-time voice interaction
 */
export const setupWebSocketConnection = (url: string, onMessage: (data: any) => void) => {
  try {
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    webSocket = new WebSocket(wsUrl);
    
    webSocket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    webSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    webSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    webSocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
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
  if (!webSocket || webSocket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    webSocket.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

/**
 * Close the WebSocket connection
 */
export const closeWebSocketConnection = () => {
  if (webSocket) {
    webSocket.close();
    webSocket = null;
  }
};