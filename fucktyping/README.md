# FuckTyping: Voice-First Form Platform

## Say Goodbye to Typing, Hello to Talking

FuckTyping is a revolutionary voice-first form platform that transforms tedious form-filling into natural conversations. Built with AI-powered conversational flows, it allows users to complete forms by simply speaking, dramatically improving completion rates and user satisfaction.

<img src="../generated-icon.png" alt="FuckTyping Logo" width="200"/>

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

## Project Structure

This project is organized as a Turborepo monorepo with pnpm for package management:

```
fucktyping/
├── apps/
│   ├── frontend/           # React frontend with TypeScript & TailwindCSS
│   │   ├── Dockerfile      # Production Dockerfile
│   │   ├── Dockerfile.dev  # Development Dockerfile with hot reload
│   │   └── src/
│   │       ├── pages/      # Application pages
│   │       ├── components/ # UI components
│   │       └── hooks/      # React hooks
│   └── backend/            # Express.js backend with LangGraph & WebRTC
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       └── src/
│           ├── routes/     # API routes
│           ├── controllers/# Request handlers
│           ├── services/   # Business logic
│           ├── engine/     # LangGraph conversation engine
│           └── rtc/        # WebRTC signaling
├── infra/                  # Infrastructure configuration
│   ├── docker-compose.yml  # Local development environment
│   ├── aws/                # AWS deployment configs
│   └── turn-server/        # TURN server for WebRTC
├── packages/               # Shared libraries
│   ├── shared/             # Shared types, schemas, and utilities
│   └── webrtc-client/      # WebRTC client library
├── scripts/                # Helper scripts for development
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace definition
└── package.json            # Root package.json
```

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm
- Docker and Docker Compose (for local development)
- A Groq API key (for LangGraph AI)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fucktyping
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the backend directory:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Add your Groq API key to the `.env` file.

4. **Start the development environment**

   ```bash
   cd infra
   docker compose up
   ```

   This will start:
   - PostgreSQL database
   - TURN server for WebRTC
   - Backend Express server
   - Frontend React server

5. **Access the application**

   Visit `http://localhost:5173` to see the application running.

## Development Workflow

```bash
# Start the entire stack with Docker Compose
cd infra && docker compose up

# Or run services individually
pnpm --filter=backend dev
pnpm --filter=frontend dev

# Seed the database with sample data
pnpm --filter=scripts seed-db
```

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, WebRTC for voice streaming
- **Backend**: Express.js, LangGraph for conversation flows, WebRTC signaling
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Groq for fast inference
- **Infrastructure**: Docker, pnpm, Turborepo

## Use Cases

- **Customer Feedback**: Gather detailed, contextual feedback
- **Lead Generation**: Increase conversion by removing friction
- **Patient Intake**: Make medical forms more accessible
- **Support Requests**: Let users explain problems naturally
- **Surveys & Research**: Collect richer qualitative data

## License

MIT License

---

FuckTyping: Because nobody likes typing on forms.