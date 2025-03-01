import { OpenAI } from 'openai';
import { Voice } from 'elevenlabs';

// Initialize OpenAI client
let openai: OpenAI;

// Initialize ElevenLabs
let elevenlabs: any;

// Socket.io connection
let socket: any;

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
    
    // Initialize ElevenLabs
    if (elevenLabsKey) {
      elevenlabs = new Voice(elevenLabsKey);
    }
    
    // Initialize Socket.io connection
    socket = null; // We'll initialize this in the server
    
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
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai.apiKey}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data.text || "Sorry, couldn't transcribe the audio.";
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return "Sorry, there was an error transcribing your audio. Please try again.";
  }
};

/**
 * Generate text-to-speech audio using ElevenLabs
 */
export const generateSpeech = async (text: string, voice = "male", speed = 1.0) => {
  if (!elevenlabs) {
    console.error('ElevenLabs not initialized. Please provide an API key.');
    return null;
  }
  
  // Map voice types to ElevenLabs voice IDs (these are example IDs)
  const voiceMap: Record<string, string> = {
    male: "pNInz6obpgDQGcFmaJgB", // Adam
    female: "EXAVITQu4vr4xnSDxMaL", // Rachel
    neutral: "21m00Tcm4TlvDq8ikWAM", // Sam
  };
  
  try {
    const voiceId = voiceMap[voice] || voiceMap.male;
    
    const audioResponse = await elevenlabs.textToSpeech({
      voice_id: voiceId,
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        speaking_speed: speed
      }
    });
    
    return new Blob([audioResponse], { type: 'audio/mpeg' });
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
};

/**
 * Set up WebSocket connection for real-time voice interaction
 */
export const setupWebSocketConnection = (url: string, onMessage: (data: any) => void) => {
  try {
    // Set up Socket.io connection
    socket = io(url);
    
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    socket.on('message', (data: any) => {
      onMessage(data);
    });
    
    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });
    
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
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
  if (!socket) {
    console.error('WebSocket not connected');
    return false;
  }
  
  try {
    socket.emit('message', message);
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
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};