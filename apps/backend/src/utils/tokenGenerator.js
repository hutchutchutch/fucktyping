/**
 * Token generator utility for creating secure tokens for various purposes
 */
const tokenGenerator = {
  /**
   * Generate a random secure token
   * @param {number} length - Length of the token (default 24)
   * @returns {string} - Generated token
   */
  generateToken: (length = 24) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let token = '';
    
    // Use crypto for secure random values if available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const values = new Uint8Array(length);
      crypto.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        token += characters[values[i] % characters.length];
      }
    } else {
      // Fallback to Math.random if crypto is not available
      for (let i = 0; i < length; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
      }
    }
    
    return token;
  },
  
  /**
   * Generate a short readable code (for share links, etc.)
   * @returns {string} - Generated code
   */
  generateShareCode: () => {
    const adjectives = ['red', 'blue', 'green', 'happy', 'smart', 'brave', 'calm', 'wise'];
    const nouns = ['dog', 'cat', 'bird', 'lion', 'tiger', 'panda', 'wolf', 'bear'];
    const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}-${noun}-${numbers}`;
  },
  
  /**
   * Validate a token
   * @param {string} token - Token to validate
   * @returns {boolean} - Whether the token is valid
   */
  validateToken: (token) => {
    // Basic validation - check if the token has the expected format
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Add more validation as needed
    return /^[A-Za-z0-9\-_]{24,}$/.test(token);
  }
};

export default tokenGenerator;