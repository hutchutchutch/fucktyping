# FuckTyping: Voice-First Form Platform

## Say Goodbye to Typing, Hello to Talking

FuckTyping is a revolutionary voice-first form platform that transforms tedious form-filling into natural conversations. Built with AI-powered conversational flows, it allows users to complete forms by simply speaking, dramatically improving completion rates and user satisfaction.

<img src="generated-icon.png" alt="FuckTyping Logo" width="200"/>

## Why FuckTyping Matters

### The Problem: Forms Are Broken

- **High Abandonment Rates**: Traditional forms have abandonment rates of 60-80%
- **Incomplete Data**: Users skip questions or provide minimal information
- **Poor User Experience**: Typing on mobile is tedious and error-prone
- **Limited Context**: Forms don't adapt to user responses

### Our Solution: Just Talk

- **Voice-First Interaction**: Users respond by speaking naturally
- **AI-Guided Conversations**: LangGraph conversational flows adapt to user responses
- **Rich Data Collection**: Capture nuanced responses impossible with text fields
- **Multi-Step Validation**: Ensure responses make sense in context

## Core Features

### 🎙️ Voice Form Responder
Allows users to complete forms through natural speech with real-time transcription and AI-powered response validation.

### 🧠 LangGraph AI Engine
Orchestrates multi-step conversation flows with validation, follow-up questions, and context-aware responses.

### 🛠️ Intuitive Form Builder
Create sophisticated multi-question forms with branching logic, validation rules, and custom response options.

### 📊 Response Analytics
Visualize form completion metrics, analyze sentiment, and extract key insights from conversational responses.

### 📱 Mobile-First Design
Optimized for the way people actually use their devices, with a focus on voice interaction.

## Technology Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Express.js + LangGraph + WebSockets
- **AI**: Groq integration for fast inference
- **Database**: SQL with Drizzle ORM

## Use Cases

### Customer Feedback
Gather detailed, contextual feedback through conversations rather than rigid rating scales.

### Lead Generation
Increase conversion by removing friction from contact forms and qualification questions.

### Patient Intake
Make medical forms less daunting and more accessible for all patients.

### Support Requests
Let users explain their problems naturally instead of forcing them into predefined categories.

### Surveys & Research
Collect richer qualitative data with higher completion rates.

## Why Voice-First Matters

Voice input is:
- **3x faster** than typing on mobile
- **More accessible** to people with disabilities
- **More natural** for expressing complex thoughts
- **Less intimidating** than blank form fields

## Getting Started

To run FuckTyping locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to see the application running.

## Project Structure

```
├── client/              # React frontend
│   ├── components/      # UI components
│   │   ├── form-builder/    # Form creation interface
│   │   ├── form-responder/  # Voice interaction components
│   │   └── ...
│   └── pages/           # Application pages
├── server/              # Express backend
│   ├── controllers/     # Request handlers
│   ├── engine/          # LangGraph conversation engine
│   └── services/        # External service integrations
└── shared/              # Shared type definitions
```

## Deployment

The application is designed to be deployed as a containerized solution, with the frontend and backend services deployed separately for optimal scaling.

## License

MIT License

---

FuckTyping: Because nobody likes typing on forms.