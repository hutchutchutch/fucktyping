# FuckTyping: Voice-First Form Platform - Turbo Monorepo with pnpm, React, Express, LangGraph, and Groq

This repository demonstrates a revolutionary **voice-first form platform** that transforms tedious form-filling into natural conversations. It's built as a **Turborepo**-style monorepo, using **pnpm** for package management and **Docker** for both development and production builds. It integrates with **Groq** for fast AI inference, uses **LangGraph** for multi-step conversational logic in the **backend**, and features a **React/TypeScript** frontend for creating and responding to voice-based forms.

## Say Goodbye to Typing, Hello to Talking

<img src="generated-icon.png" alt="FuckTyping Logo" width="200"/>

---

## Repository Overview

```
fucktyping/
├── apps/
│   ├── frontend/           # React + TypeScript + TailwindCSS
│   │   ├── Dockerfile      # Production Dockerfile
│   │   ├── Dockerfile.dev  # Dev Dockerfile (hot reload)
│   │   ├── src/
│   │   │   ├── pages/      # Application pages (home, form builder, responder)
│   │   │   ├── components/ # Shared UI components (voice recorder, form elements)
│   │   │   │   ├── form-builder/  # Form creation interface
│   │   │   │   ├── form-responder/ # Voice interaction components
│   │   │   │   └── ...
│   │   │   ├── hooks/      # React hooks (useMicrophone, useTranscription)
│   │   │   └── ...
│   │   └── ...
│   └── backend/            # Express.js + LangGraph + WebRTC
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       ├── src/
│       │   ├── routes/     # API routes for forms, responses, users
│       │   ├── controllers/ # Handlers for form data, voice processing
│       │   ├── services/   # Business logic, e.g. transcription, validation
│       │   ├── engine/     # LangGraph conversation engine 
│       │   ├── rtc/        # WebRTC signaling and connection management
│       │   └── ...
│       └── ...
├── infra/                  # Infrastructure for Docker Compose, deployment configs
│   ├── docker-compose.yml  # Orchestrates local dev environment
│   ├── aws/                # AWS deployment resources (if applicable)
│   ├── turn-server/        # TURN server configuration for WebRTC
│   └── ...
├── packages/               # Shared libraries across apps
│   ├── shared/             # Shared type definitions, constants, utilities
│   ├── webrtc-client/      # Shared WebRTC client library
│   └── ...
├── scripts/                # Helper scripts/CLI automation
│   ├── seed-db.ts          # Initialize database with sample forms
│   └── ...
├── turbo.json              # Turborepo config
├── pnpm-workspace.yaml     # pnpm workspace definition
├── package.json            # Root-level scripts and devDependencies
└── README.md               # This file
```

### Key Directories

1. **`apps/frontend/`**  
   - **React** with TypeScript and TailwindCSS.
   - **Dockerfiles**:
     - `Dockerfile.dev` for local dev with hot reload.
     - `Dockerfile` for production builds.
   - Pages include:
     - **Home page**: Introduction to voice-first form filling and key benefits.
     - **Form Builder**: Interface for creating sophisticated multi-question forms.
     - **Form Responder**: Voice-based interface for completing forms through natural speech.
     - **Analytics Dashboard**: Visualize form completion metrics and response analysis.
   - Services layer for API communication with the backend.
   - WebRTC integration for peer-to-peer voice streaming.
   - Type definitions that mirror backend data models.

2. **`apps/backend/`**  
   - **Express.js** with TypeScript.  
   - **Database Integration**:
     - SQL database with Drizzle ORM.
     - Models for forms, questions, responses, and users.
     - Schema definitions and migrations.
   - **RESTful API**:
     - Endpoints for creating and managing forms.
     - Voice processing and transcription.
     - Response storage and analysis.
   - **WebRTC Signaling**:
     - Manages WebRTC connection establishment.
     - Handles ICE candidates and offers/answers.
     - Coordinates peer-to-peer audio streaming.
   - Integrates **LangGraph** for multi-step conversation flows with validation, follow-up questions, and context-aware responses.  
   - Connects to:
     - **Groq** for fast AI inference.
     - Transcription services for voice-to-text conversion.
     - Analytics tools for response analysis.

3. **`infra/`**  
   - **docker-compose.yml**: For local dev, spins up the backend, frontend, and database.
   - **turn-server/**: Configuration for TURN server to facilitate WebRTC connections through NATs and firewalls.
   - Deployment configurations for various cloud providers.  

4. **`packages/`**  
   - **`shared/`**: Shared type definitions, utilities, and constants used by both frontend and backend.
   - **`webrtc-client/`**: Reusable WebRTC client library with connection handling, stream management, and reconnection logic.
   - **pnpm** automatically handles linking across your workspace.

5. **`scripts/`**  
   - **`seed-db.ts`**: Seeds the database with sample forms and questions.  
   - Other utilities for development and deployment.

---

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

---

## Intent & Features

1. **Docker-based Development**  
   - Each app has a dev Dockerfile for immediate reloading.  
   - `infra/docker-compose.yml` can run the entire stack: database, backend, frontend, and TURN server.

2. **Voice Form Responder**  
   - Allow users to complete forms through natural speech.
   - Real-time peer-to-peer voice streaming via WebRTC.
   - Low-latency transcription and validation of responses.
   - Fallback to text input when necessary.

3. **LangGraph AI Engine**  
   - The backend orchestrates multi-step conversation flows with validation, follow-up questions, and context-aware responses.  
   - Code in `apps/backend/src/engine/`, managing sophisticated conversational logic.

4. **WebRTC Integration**  
   - Peer-to-peer audio streaming for minimal latency.
   - Secure, encrypted communication channels.
   - Fallback mechanisms for challenging network environments.
   - TURN server support for NAT traversal.

5. **Intuitive Form Builder**  
   - Create sophisticated multi-question forms with branching logic.
   - Define validation rules and custom response options.
   - Preview form flow from the user's perspective.

6. **Response Analytics**  
   - Visualize form completion metrics.
   - Analyze sentiment in voice responses.
   - Extract key insights from conversational data.

7. **Mobile-First Design**  
   - Optimized for the way people actually use their devices.
   - Focus on voice interaction for mobile users.
   - Responsive UI for all screen sizes.

---

## Security & Best Practices

1. **Rate Limiting**
   - Implemented Express rate limiter to prevent abuse
   - Configurable per-endpoint limits to match expected usage patterns
   - IP-based and user-based limits to prevent spam and DoS attacks

2. **Row-Level Security (RLS)**
   - Database access restricted by user ID
   - Custom middleware validates resource ownership before access
   - Ensures users can only see and modify their own data

3. **CAPTCHA Protection**
   - reCAPTCHA v3 integration for form submissions
   - Invisible to users while effectively blocking bot traffic
   - Configurable risk thresholds for different actions

4. **Cloudflare Security Integration**
   - Cloudflare WAF configured for application protection
   - DDoS mitigation with Cloudflare's global network
   - Bot Management for automated threat detection
   - Protection against SQL injection, XSS, and other OWASP Top 10
   - Geo-blocking capabilities for regional compliance
   - SSL/TLS encryption with automatic certificate management

5. **Secure Secrets Management**
   - All API keys stored in .env files (gitignored)
   - No hardcoded credentials anywhere in the codebase
   - Environment-specific secrets for dev/staging/prod

6. **Server-Side Validation**
   - Zod schemas for comprehensive data validation
   - All user inputs validated regardless of frontend validation
   - Type-safe validation shared between frontend and backend

7. **Dependency Management**
   - Regular audit with `pnpm audit`
   - Minimal dependencies to reduce attack surface
   - Dependabot enabled for timely security updates

8. **Monitoring & Observability**
   - Error tracking with Sentry for real-time alerts
   - Performance monitoring with custom metrics
   - Health check endpoints for uptime monitoring

---

## Development Workflow

1. **pnpm Install**  
   ```bash
   pnpm install
   ```
   Installs dependencies across the entire monorepo.

2. **Local Docker**  
   In `infra/`, run:
   ```bash
   docker compose up --build
   ```
   This spins up the database, TURN server, backend (Express + LangGraph), and frontend (React).

   Alternatively, run them separately:
   ```bash
   pnpm --filter=backend dev
   pnpm --filter=frontend dev
   ```

3. **Credentials & Env Variables**  
   Manage environment variables (Groq API keys, database credentials, TURN server secrets) through `.env` in dev and container secrets in production.

---

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

---

## Why Voice-First Matters

Voice input is:
- **3x faster** than typing on mobile
- **More accessible** to people with disabilities
- **More natural** for expressing complex thoughts
- **Less intimidating** than blank form fields

---

## Technology Stack

This voice-first form platform uses:

- **Frontend**: 
  - React with TypeScript for type-safe components
  - TailwindCSS for responsive design
  - WebRTC for peer-to-peer audio streaming
  - Web Audio API for voice recording and processing

- **Backend**:
  - Express.js with TypeScript for a robust API server
  - SQL database with Drizzle ORM
  - WebRTC signaling server
  - LangGraph for orchestrating conversational flows
  - Groq integration for fast AI inference

- **Infrastructure**:
  - Turborepo + pnpm for consolidated multi-app dev
  - Docker for local dev/prod builds
  - TURN server for WebRTC NAT traversal
  - Containerized deployment for optimal scaling

---

## Getting Started

### Prerequisites

- Node.js v18+ and pnpm
- Docker and Docker Compose
- Groq API key

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

3. **Environment variables**

   Create a `.env` file in the backend directory:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Add your Groq API key and TURN server credentials to the `.env` file.

4. **Start the development environment**

   ```bash
   cd infra
   docker compose up
   ```

   This will start:
   - Database
   - TURN server
   - Backend Express server
   - Frontend React server

5. **Access the application**

   Visit `http://localhost:5173` to see the application running.

## Deployment

The application is designed to be deployed as a containerized solution, with the frontend, backend, and TURN server deployed separately for optimal scaling.

## License

MIT License

---

FuckTyping: Because nobody likes typing on forms.