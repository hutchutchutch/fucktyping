/**
 * Voice Service - For audio recording, transcription, and text-to-speech
 */

interface TranscribeResponse {
  transcript: string;
  confidence?: number;
  language?: string;
  success?: boolean;
}

interface SynthesizeResponse {
  audioUrl: string;
  format?: string;
  message: string;
  success?: boolean;
}

interface ConversationResponse {
  message: string;
  conversationId: number;
  stats?: {
    tokens?: number;
    processingTime?: number;
    sentiment?: number;
  };
}

const voiceService = {
  /**
   * Transcribe audio to text
   * @param audioBase64 Base64 encoded audio data
   * @returns Promise with transcript
   */
  transcribeAudio: async (audioBase64: string): Promise<string> => {
    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audio: audioBase64 }),
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data: TranscribeResponse = await response.json();
      return data.transcript;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  },

  /**
   * Convert text to speech
   * @param text Text to synthesize
   * @param voice Voice ID to use
   * @param options Additional options
   * @returns Promise with audio URL
   */
  synthesizeSpeech: async (
    text: string, 
    voice: string = 'adam',
    options: { speed?: number; quality?: string } = {}
  ): Promise<string> => {
    try {
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
          speed: options.speed || 1.0,
          quality: options.quality || 'high'
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech synthesis failed: ${response.status}`);
      }

      const data: SynthesizeResponse = await response.json();
      return data.audioUrl;
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw error;
    }
  },

  /**
   * Send a message to the conversation API
   * @param responseId ID of the form response
   * @param message User message
   * @param questionContext Context about the current question
   * @param agentSettings Settings for the agent
   * @returns Promise with the AI response
   */
  sendConversationMessage: async (
    responseId: number,
    message: string,
    questionContext?: string,
    agentSettings?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<ConversationResponse> => {
    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseId,
          message,
          questionContext,
          agentSettings
        }),
      });

      if (!response.ok) {
        throw new Error(`Conversation API failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing conversation:', error);
      throw error;
    }
  },

  /**
   * Helper to create an audio blob from chunks
   * @param chunks Array of audio blobs
   * @returns Combined audio blob
   */
  createAudioBlob: (chunks: Blob[]): Blob => {
    return new Blob(chunks, { type: 'audio/wav' });
  }
};

export default voiceService;