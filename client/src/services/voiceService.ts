import { apiRequest } from "@/lib/queryClient";

// Interface for transcription response
interface TranscribeResponse {
  transcript: string;
}

// Interface for text-to-speech response
interface SynthesizeResponse {
  audioUrl: string;
  message: string;
}

// Interface for conversation response
interface ConversationResponse {
  message: string;
  conversationId: number;
}

// Main voice service API
export const voiceService = {
  // Convert audio to text
  transcribeAudio: async (audioBlob: Blob | string): Promise<string> => {
    try {
      // In a real implementation, we would convert the audio blob to base64
      // or use FormData to send the actual audio data
      const audioData = typeof audioBlob === 'string' 
        ? audioBlob 
        : 'base64encodedaudiodatawouldgohere';
      
      const response = await apiRequest("POST", "/api/voice/transcribe", {
        audio: audioData
      });
      
      const data: TranscribeResponse = await response.json();
      return data.transcript;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw new Error(`Failed to transcribe audio: ${error}`);
    }
  },
  
  // Convert text to speech
  synthesizeSpeech: async (text: string): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/voice/synthesize", {
        text
      });
      
      const data: SynthesizeResponse = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error("Error synthesizing speech:", error);
      throw new Error(`Failed to synthesize speech: ${error}`);
    }
  },
  
  // Process a conversation message
  processConversationMessage: async (responseId: number, message: string): Promise<ConversationResponse> => {
    try {
      const response = await apiRequest("POST", "/api/conversation", {
        responseId,
        message
      });
      
      return await response.json();
    } catch (error) {
      console.error("Error processing conversation:", error);
      throw new Error(`Failed to process conversation: ${error}`);
    }
  },
  
  // Request microphone access and create a MediaRecorder
  requestMicrophoneAccess: async (): Promise<MediaRecorder> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return new MediaRecorder(stream);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw new Error(`Failed to access microphone: ${error}`);
    }
  },
  
  // Convert MediaRecorder audio chunks to a blob
  createAudioBlob: (chunks: Blob[]): Blob => {
    return new Blob(chunks, { type: 'audio/wav' });
  },
  
  // Mock transcription function for development/testing
  getMockTranscription: (): string => {
    const mockResponses = [
      "I would rate my experience as excellent. The customer service representative was very helpful and resolved my issue quickly.",
      "My experience was good overall. The product works as expected, but the setup was a bit confusing.",
      "I think your website could be improved by making the navigation simpler and adding more product details.",
      "The shipping was incredibly fast, and the packaging was excellent. Very satisfied with my purchase.",
      "I'd like to see more color options available for this product.",
      "I had trouble finding the information I needed on your support page.",
      "The quality of the product exceeded my expectations."
    ];
    
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  },
  
  // Generate realistic conversation responses based on form context
  generateAIResponse: (question: string, userResponse: string): string => {
    if (!userResponse) {
      return "I didn't catch that. Could you please repeat your answer?";
    }
    
    if (userResponse.length < 5) {
      return "Could you elaborate a bit more on your answer?";
    }
    
    if (question.toLowerCase().includes("rate") || question.toLowerCase().includes("rating")) {
      return "Thank you for your rating. Can you explain why you gave this rating?";
    }
    
    if (question.toLowerCase().includes("improve") || question.toLowerCase().includes("suggestion")) {
      return "Thanks for your feedback. Is there anything specific you'd like to see implemented?";
    }
    
    return "Thank you for your response. Let's move on to the next question.";
  }
};

export default voiceService;
