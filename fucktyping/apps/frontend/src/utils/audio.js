/**
 * Utility functions for audio processing and visualization
 */

// AudioContext singleton with lazy initialization
let audioContext = null;

/**
 * Get the shared AudioContext instance
 * @returns {AudioContext} The shared AudioContext
 */
export function getAudioContext() {
  if (!audioContext) {
    // Use the AudioContext or webkitAudioContext depending on browser support
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/**
 * Create an analyser node for audio visualization
 * @param {AudioContext} context - The AudioContext to use
 * @param {Object} options - Analyser options
 * @returns {AnalyserNode} The configured analyser node
 */
export function createAnalyser(context = getAudioContext(), options = {}) {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    minDecibels = -100,
    maxDecibels = -30
  } = options;
  
  const analyser = context.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = smoothingTimeConstant;
  analyser.minDecibels = minDecibels;
  analyser.maxDecibels = maxDecibels;
  
  return analyser;
}

/**
 * Get normalized frequency data from an analyser node
 * @param {AnalyserNode} analyser - The analyser node
 * @returns {Array<number>} Array of normalized frequency values (0-1)
 */
export function getFrequencyData(analyser) {
  if (!analyser) return [];
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  analyser.getByteFrequencyData(dataArray);
  
  // Normalize values to 0-1 range
  return Array.from(dataArray).map(value => value / 255);
}

/**
 * Get normalized time domain data from an analyser node
 * @param {AnalyserNode} analyser - The analyser node
 * @returns {Array<number>} Array of normalized waveform values (-1 to 1)
 */
export function getWaveformData(analyser) {
  if (!analyser) return [];
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  analyser.getByteTimeDomainData(dataArray);
  
  // Normalize values to -1 to 1 range
  return Array.from(dataArray).map(value => (value / 128) - 1);
}

/**
 * Create a dummy visualization data array for UI testing
 * @param {number} length - Length of the array to generate
 * @returns {Array<number>} Array of dummy visualization values
 */
export function createDummyVisualizationData(length = 30) {
  return Array.from({ length }, () => Math.random());
}

/**
 * Create an animated dummy visualization
 * @param {number} length - Length of the array to generate
 * @param {number} maxValue - Maximum value for the visualization
 * @returns {Array<number>} Array of dummy visualization values
 */
export function createAnimatedDummyData(length = 30, maxValue = 1) {
  const time = Date.now() / 1000;
  
  return Array.from({ length }, (_, i) => {
    // Create a wave pattern using sine functions
    const value = 
      Math.sin(time * 2 + i * 0.2) * 0.3 + 
      Math.sin(time * 4 + i * 0.3) * 0.2 + 
      Math.sin(time * 6 + i * 0.5) * 0.1;
    
    // Normalize to 0-maxValue and add some randomness
    return Math.abs((value + 1) / 2 * maxValue) + (Math.random() * 0.1);
  });
}

/**
 * Convert audio blob to an audio buffer for processing
 * @param {Blob} audioBlob - The audio blob to convert
 * @param {AudioContext} context - The AudioContext to use
 * @returns {Promise<AudioBuffer>} The decoded audio buffer
 */
export async function audioToBuffer(audioBlob, context = getAudioContext()) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  return context.decodeAudioData(arrayBuffer);
}

/**
 * Calculate the duration of an audio blob
 * @param {Blob} audioBlob - The audio blob
 * @returns {Promise<number>} Duration in seconds
 */
export function calculateAudioDuration(audioBlob) {
  return new Promise((resolve) => {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src);
    });
    
    // Fallback in case loadedmetadata doesn't fire
    setTimeout(() => {
      if (audio.duration) {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      }
    }, 1000);
  });
}

/**
 * Create an audio element from a blob URL
 * @param {Blob} audioBlob - The audio blob
 * @returns {HTMLAudioElement} Audio element with the blob as source
 */
export function createAudioElement(audioBlob) {
  const audio = new Audio();
  audio.src = URL.createObjectURL(audioBlob);
  
  // Clean up the URL when no longer needed
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audio.src);
  });
  
  return audio;
}

/**
 * Check if the browser supports the required audio APIs
 * @returns {boolean} True if all required audio APIs are supported
 */
export function isAudioSupported() {
  return !!(
    window.AudioContext || 
    window.webkitAudioContext
  ) && !!(
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Draw a waveform visualization on a canvas
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on
 * @param {Array<number>} data - The audio data to visualize
 * @param {Object} options - Visualization options
 */
export function drawWaveform(canvas, data, options = {}) {
  if (!canvas || !data) return;
  
  const {
    color = '#4F46E5',         // Primary color
    backgroundColor = 'transparent',
    lineWidth = 2,
    fillOpacity = 0.2,
    reflection = true          // Mirror the waveform
  } = options;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const centerY = height / 2;
  const barWidth = width / data.length;
  
  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Set up styles
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  
  // Draw waveform
  ctx.beginPath();
  
  data.forEach((value, index) => {
    const x = index * barWidth;
    const scaledValue = value * (centerY * 0.9); // Scale to 90% of half height
    
    if (index === 0) {
      ctx.moveTo(x, centerY - scaledValue);
    } else {
      ctx.lineTo(x, centerY - scaledValue);
    }
  });
  
  // If reflection is enabled, complete the path by mirroring
  if (reflection) {
    for (let i = data.length - 1; i >= 0; i--) {
      const x = i * barWidth;
      const scaledValue = data[i] * (centerY * 0.9);
      ctx.lineTo(x, centerY + scaledValue);
    }
  }
  
  ctx.closePath();
  
  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color}${fillOpacity.toString(16).padStart(2, '0')}`);
  gradient.addColorStop(0.5, `${color}${Math.floor(fillOpacity * 0.5).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, `${color}${fillOpacity.toString(16).padStart(2, '0')}`);
  
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.stroke();
}
