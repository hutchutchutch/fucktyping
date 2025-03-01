// Test script for the voice form agent

const fetch = require('node-fetch');

async function testVoiceFormAgent() {
  const API_BASE = 'http://localhost:5000';
  
  try {
    console.log('Testing Voice Form Agent API...');
    
    // Step 1: Create a voice form agent
    console.log('\n1. Creating voice form agent...');
    const formConfig = {
      id: "customer-survey",
      name: "Customer Satisfaction Survey",
      description: "A brief survey to gather customer feedback",
      openingActivity: {
        prompt: "Hello! I'm your virtual assistant. I'd like to ask you a few questions about your recent experience with our service. Is that okay?",
        backgroundInfo: "This is a customer satisfaction survey for users who have recently used our product.",
        useDirectPrompt: true
      },
      questions: [
        {
          id: "name",
          prompt: "What is your name?",
          backgroundInfo: "We want to personalize the conversation.",
          expectedResponseFormat: "text",
          useDirectPrompt: true,
          createDynamicReference: true,
          referenceName: "userName",
          order: 0
        },
        {
          id: "satisfaction",
          prompt: "Hi {userName}, on a scale of 1-10, how satisfied are you with our service?",
          backgroundInfo: "We're measuring overall satisfaction on a scale of 1-10.",
          expectedResponseFormat: "number",
          useDirectPrompt: true,
          validResponseExample: "8",
          invalidResponseExample: "pretty good",
          order: 1
        }
      ],
      closingActivity: {
        prompt: "Thank you for your feedback! We'll use it to improve our services.",
        backgroundInfo: "We want to thank the customer and let them know their feedback is valuable.",
        useDirectPrompt: true
      },
      collectEmail: false
    };
    
    const createResponse = await fetch(`${API_BASE}/api/voice-forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formConfig)
    });
    
    const createResult = await createResponse.json();
    console.log('Response:', createResult);
    
    // Step 2: Start a conversation with the created form
    // In a real app, we would use a real form ID from the database
    // For this test, we'll use a hardcoded ID
    const formId = 1; // Using the first test form in our database
    
    console.log(`\n2. Starting conversation with form ID ${formId}...`);
    const startResponse = await fetch(`${API_BASE}/api/voice-forms/${formId}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const startResult = await startResponse.json();
    console.log('Response:', startResult);
    
    if (!startResult.success) {
      console.error('Failed to start conversation');
      return;
    }
    
    const conversationId = startResult.conversation.conversationId;
    console.log(`Conversation started with ID: ${conversationId}`);
    console.log(`Opening message: ${startResult.nextMessage}`);
    
    // Step 3: Continue the conversation with a user response
    console.log(`\n3. Continuing conversation with user input...`);
    const continueResponse = await fetch(`${API_BASE}/api/voice-conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: "My name is John" })
    });
    
    const continueResult = await continueResponse.json();
    console.log('Response:', continueResult);
    
    if (continueResult.nextMessage) {
      console.log(`Next message: ${continueResult.nextMessage}`);
    }
    
    // Step 4: Continue the conversation again with another user response
    console.log(`\n4. Continuing conversation with another user input...`);
    const continue2Response = await fetch(`${API_BASE}/api/voice-conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInput: "I would rate it 9 out of 10" })
    });
    
    const continue2Result = await continue2Response.json();
    console.log('Response:', continue2Result);
    
    if (continue2Result.nextMessage) {
      console.log(`Next message: ${continue2Result.nextMessage}`);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testVoiceFormAgent();