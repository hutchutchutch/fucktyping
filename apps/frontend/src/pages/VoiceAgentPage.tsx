import React from 'react';
import { Helmet } from 'react-helmet';
import VoiceAgentInteraction from '@components/voice-agent/VoiceAgentInteraction';

export default function VoiceAgentPage() {
  return (
    <div className="container mx-auto py-6">
      <Helmet>
        <title>Voice Form Agent | AI-Powered Form Interaction</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Voice Form Agent</h1>
          <p className="text-muted-foreground">
            Interact with forms using your voice and our AI-powered LangGraph agent
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">About Voice Form Agent</h2>
            <p className="mb-3">
              Our voice form agent uses LangGraph to create a stateful, conversational experience for 
              completing forms. This demonstrates how AI can make form completion more natural and engaging.
            </p>
            <p>
              Try speaking to the agent below or type your responses. The agent will guide you through 
              the form process while maintaining context of your previous answers.
            </p>
          </div>
        </div>
        
        <VoiceAgentInteraction 
          formId={1} 
          title="Customer Satisfaction Survey" 
          description="A brief survey to help us improve our service. Use voice or text to respond."
        />
        
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-2">1. LangGraph State Management</h3>
                <p className="text-sm text-gray-600">
                  Uses AI agents with state graphs to maintain context throughout the conversation.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-2">2. Voice Processing</h3>
                <p className="text-sm text-gray-600">
                  Records, transcribes, and validates voice input for seamless interaction.
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <h3 className="font-medium mb-2">3. Dynamic Response Generation</h3>
                <p className="text-sm text-gray-600">
                  Creates personalized responses based on your previous answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}