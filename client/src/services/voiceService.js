/**
 * Service for handling voice recording, transcription and processing
 */
import { uploadFile, post } from './api';

/**
 * Start recording audio using the browser's MediaRecorder API
 * @returns {Promise<{mediaRecorder: MediaRecorder, stream: MediaStream}>}
 */
export async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    
    // Start recording
    mediaRecorder.start();
    
    return { mediaRecorder, stream };
  } catch (error) {
    console.error('Error starting recording:', error);
    throw new Error('Could not access microphone. Please check your permissions.');
  }
}

/**
 * Stop recording and get the recorded audio blob
 * @param {MediaRecorder} mediaRecorder - The MediaRecorder instance
 * @param {MediaStream} stream - The MediaStream being recorded
 * @returns {Promise<Blob>} The recorded audio as a Blob
 */
export function stopRecording(mediaRecorder, stream) {
  return new Promise((resolve) => {
    const audioChunks = [];
    
    // Listen for dataavailable event to collect audio chunks
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    });
    
    // When recording stops, create a blob from the chunks
    mediaRecorder.addEventListener('stop', () => {
      // Stop all audio tracks
      stream.getAudioTracks().forEach(track => track.stop());
      
      // Create blob from audio chunks
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      resolve(audioBlob);
    });
    
    // Stop the recording
    mediaRecorder.stop();
  });
}

/**
 * Convert audio blob to base64 string for API transmission
 * @param {Blob} audioBlob - The audio blob to convert
 * @returns {Promise<string>} Base64 encoded audio
 */
export function audioToBase64(audioBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove the prefix (e.g., "data:audio/wav;base64,") to get just the base64 data
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioBlob);
  });
}

/**
 * Upload audio for transcription
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @returns {Promise<Object>} Transcription result
 */
export async function transcribeAudio(audioBlob) {
  try {
    // Upload the audio file for transcription
    const result = await uploadFile('/api/voice/transcribe', audioBlob, 'audio');
    return result;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

/**
 * Process a voice response to extract information
 * @param {Blob} audioBlob - The audio blob to process
 * @param {Object} options - Processing options like question type
 * @returns {Promise<Object>} Processed response data
 */
export async function processVoiceResponse(audioBlob, options) {
  try {
    // First convert audio to base64
    const audioBase64 = await audioToBase64(audioBlob);
    
    // Send for processing
    const response = await post('/api/voice/process', {
      audio: audioBase64,
      ...options
    });
    
    return response.json();
  } catch (error) {
    console.error('Voice processing error:', error);
    throw new Error('Failed to process voice response. Please try again.');
  }
}

/**
 * Analyze sentiment of a text or audio input
 * @param {string|Blob} input - Text or audio blob to analyze
 * @param {string} type - Type of input ('text' or 'audio')
 * @returns {Promise<Object>} Sentiment analysis result
 */
export async function analyzeSentiment(input, type = 'text') {
  try {
    let requestData;
    
    if (type === 'audio') {
      // If audio, convert to base64 first
      const audioBase64 = await audioToBase64(input);
      requestData = { audio: audioBase64, type };
    } else {
      // If text, send directly
      requestData = { text: input, type };
    }
    
    const response = await post('/api/voice/sentiment', requestData);
    return response.json();
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    throw new Error('Failed to analyze sentiment. Please try again.');
  }
}

/**
 * Convert text to speech
 * @param {string} text - The text to convert to speech
 * @param {Object} options - TTS options like voice, speed, etc.
 * @returns {Promise<Blob>} Audio blob of the synthesized speech
 */
export async function textToSpeech(text, options = {}) {
  try {
    const response = await post('/api/voice/tts', {
      text,
      ...options
    });
    
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw new Error('Failed to convert text to speech. Please try again.');
  }
}
