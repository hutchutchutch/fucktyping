/**
 * Email Service - Handles sending emails
 * 
 * This is a mock implementation that logs emails instead of actually sending them.
 * In a production environment, this would be replaced with an actual email service 
 * integration (e.g., Sendgrid, Mailgun, SES, etc.)
 */
const emailService = {
  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string|string[]} options.to - Recipient email address(es)
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Email text content
   * @param {string} [options.html] - Optional HTML content
   * @returns {Promise<Object>} - Promise resolving to the send result
   */
  sendEmail: async (options) => {
    const { to, subject, text, html } = options;
    
    // Validate required parameters
    if (!to || !subject || !text) {
      throw new Error('Missing required email parameters: to, subject, and text are required');
    }
    
    // Log the email (for development/testing)
    console.log(`[EMAIL SERVICE] Sending email to: ${to}`);
    console.log(`[EMAIL SERVICE] Subject: ${subject}`);
    console.log(`[EMAIL SERVICE] Text content: ${text.substring(0, 100)}...`);
    
    // In a real implementation, this would call an email service API
    // For example:
    // return sendgridClient.send({ to, from: 'noreply@fucktyping.com', subject, text, html });
    
    // Mock successful send
    return {
      success: true,
      messageId: `mock-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default emailService;