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
│   │   │   ├── App.tsx                # Main application component
│   │   │   ├── components/            # UI components organized by function
│   │   │   │   ├── ActiveDesktop.tsx  # Win98-style active desktop element
│   │   │   │   ├── BSOD.tsx           # Windows blue screen of death easter egg
│   │   │   │   ├── Clippy.tsx         # Windows assistant easter egg
│   │   │   │   ├── DesktopIcon.tsx    # Windows desktop icon component
│   │   │   │   ├── RetroButton.tsx    # Win98-style button
│   │   │   │   ├── RetroInput.tsx     # Win98-style form inputs
│   │   │   │   ├── RetroWindow.tsx    # Win98-style window component
│   │   │   │   ├── StartMenu.tsx      # Win98-style start menu
│   │   │   │   ├── Taskbar.tsx        # Win98-style taskbar with tabs
│   │   │   │   ├── WindowControls.tsx # Window minimize/maximize/close buttons
│   │   │   │   ├── ai/                # AI chat interface components
│   │   │   │   ├── animation/         # Visual animations and effects
│   │   │   │   ├── common/            # Reusable UI components
│   │   │   │   ├── dashboard/         # Analytics dashboard components
│   │   │   │   ├── form-builder/      # Form creation interface components
│   │   │   │   │   ├── EmailTemplateEditor.tsx # Email notification template editor
│   │   │   │   │   ├── FormBuilder.tsx         # Main form builder interface
│   │   │   │   │   ├── QuestionEditor.tsx      # Question creation/editing UI
│   │   │   │   │   └── ResponseOptions.tsx     # Response options configuration
│   │   │   │   ├── form-responder/     # Voice form interaction components
│   │   │   │   │   ├── AudioVisualizer.tsx   # Audio waveform visualization
│   │   │   │   │   ├── Transcript.tsx        # Speech transcript display
│   │   │   │   │   ├── VoiceFormResponder.tsx # Main voice interaction component
│   │   │   │   │   ├── VoiceInterface.tsx    # Voice UI container
│   │   │   │   │   └── VoiceRecorder.tsx     # Audio recording component
│   │   │   │   ├── form/               # Form display components
│   │   │   │   ├── layout/             # Page layout components
│   │   │   │   ├── onboarding/         # Onboarding and tutorial components
│   │   │   │   ├── ui/                 # Shadcn UI component library implementations
│   │   │   │   └── voice-agent/        # Voice agent interaction components
│   │   │   ├── context/              # React context providers
│   │   │   │   ├── AuthContext.tsx   # Authentication state management
│   │   │   │   ├── FormContext.tsx   # Form data and state management
│   │   │   │   └── ThemeContext.tsx  # Theme switching and management
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   │   ├── useAudio.tsx     # Audio recording and processing
│   │   │   │   ├── useForm.tsx      # Form data and validation
│   │   │   │   ├── useResponses.ts  # Form response management
│   │   │   │   └── useSound.tsx     # Sound effect playback
│   │   │   ├── lib/                 # Utility libraries
│   │   │   ├── pages/               # Application page components
│   │   │   │   ├── CreateForm.tsx      # Form creation page
│   │   │   │   ├── Dashboard.tsx       # User dashboard
│   │   │   │   ├── FormBuilder.tsx     # Form builder page
│   │   │   │   ├── FormResponder.tsx   # Form response page
│   │   │   │   ├── LandingPage.tsx     # Homepage with Win98 UI
│   │   │   │   ├── Login.tsx           # Authentication page
│   │   │   │   ├── ResponseViewer.tsx  # View form responses
│   │   │   │   ├── VoiceAgentPage.tsx  # Voice agent interaction page
│   │   │   │   └── WebRTCTest.tsx      # WebRTC testing page
│   │   │   ├── routes.tsx           # Application routing definition
│   │   │   ├── schemas/             # Data validation schemas
│   │   │   ├── services/            # API client services
│   │   │   │   ├── aiService.ts       # AI model interaction service
│   │   │   │   ├── api.ts             # Base API client
│   │   │   │   ├── formService.ts     # Form CRUD operations
│   │   │   │   ├── voiceService.ts    # Voice recording and processing
│   │   │   │   └── websocketService.ts # Real-time communication
│   │   │   ├── styles/              # Global and themed styles
│   │   │   │   ├── globals.css        # Global CSS
│   │   │   │   └── win95.css          # Windows 95/98 theme styling
│   │   │   └── utils/               # Utility functions
│   │   │       ├── audio.js           # Audio processing utilities
│   │   │       ├── formatters.js      # Data formatting helpers
│   │   │       └── validators.js      # Data validation functions
│   │   └── ...
│   └── backend/            # Express.js + LangGraph + WebRTC
│       ├── Dockerfile      # Production container config
│       ├── Dockerfile.dev  # Development container with hot reload
│       ├── src/
│       │   ├── controllers/          # API endpoint handlers
│       │   │   ├── conversationController.js # Manages conversational AI interactions
│       │   │   ├── emailController.js        # Handles email notifications
│       │   │   ├── formController.js         # CRUD operations for forms
│       │   │   ├── responseController.js      # Manages form responses
│       │   │   └── voiceFormController.js     # Voice-specific form handling
│       │   ├── db.ts                 # Database connection and config
│       │   ├── databaseStorage.ts    # Database interaction layer
│       │   ├── engine/               # LangGraph conversation engine
│       │   │   ├── graph.js          # Conversation flow definition
│       │   │   ├── graphBuilder.js   # Dynamic graph construction
│       │   │   ├── index.js          # Engine exports
│       │   │   ├── nodes.js          # Graph node definitions
│       │   │   ├── prompts.js        # AI prompt templates
│       │   │   ├── schemas.js        # Data validation schemas
│       │   │   └── state.js          # Conversation state management
│       │   ├── migrations/           # Database schema migrations
│       │   ├── routes.ts             # API route definitions
│       │   ├── rtc/                  # WebRTC functionality
│       │   │   ├── webrtc-signaling.ts  # WebRTC connection signaling
│       │   │   └── websocket-handler.ts # WebSocket message handling
│       │   ├── services/             # Business logic services
│       │   │   ├── emailService.js      # Email sending service
│       │   │   ├── groqService.ts       # Groq AI API integration
│       │   │   └── voiceService.ts      # Voice processing service
│       │   ├── storage.ts            # File storage service
│       │   └── utils/                # Utility functions
│       │       ├── errorHandler.js      # Error handling middleware
│       │       ├── tokenGenerator.js    # Authentication token management
│       │       └── validators.js        # Data validation utilities
│       └── ...
├── infra/                  # Infrastructure configuration
│   ├── docker-compose.yml  # Local development environment
│   ├── aws/                # AWS deployment configuration
│   │   ├── deploy.sh       # Deployment automation script
│   │   ├── ecs/            # ECS (container service) configuration
│   │   ├── rds/            # RDS (database) configuration
│   │   ├── secrets.tf      # Secrets management
│   │   ├── vpc.tf          # Network configuration
│   │   └── ...
│   └── turn-server/        # TURN server for WebRTC NAT traversal
├── packages/               # Shared libraries across apps
│   ├── database/           # Database schema definitions and utilities
│   ├── shared/             # Shared types and utilities
│   │   ├── constants.ts    # Shared constant values
│   │   ├── schemas.ts      # Shared data validation schemas
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # Shared utility functions
│   ├── tokens/             # Design tokens and theming
│   │   ├── index.css       # Base design tokens
│   │   └── theme-w95.css   # Windows 95/98 theme tokens
│   ├── tsconfig/           # Shared TypeScript configurations
│   └── webrtc-client/      # WebRTC client implementation
│       └── client.ts       # WebRTC connection management
├── scripts/                # Helper scripts/CLI automation
│   ├── seed-db.ts          # Initialize database with sample forms
│   └── ...
├── turbo.json              # Turborepo config
├── pnpm-workspace.yaml     # pnpm workspace definition
├── package.json            # Root-level scripts and devDependencies
└── README.md               # This file
```

### Key Components and Data Flow

1. **`apps/frontend/`**  
   - **React** with TypeScript and TailwindCSS.
   - **Dockerfiles**:
     - `Dockerfile.dev` for local dev with hot reload.
     - `Dockerfile` for production builds.
   - **Key Pages and Data Flow**:
     - **LandingPage.tsx**: 
       - Provides a Windows 98-inspired UI with desktop, windows, and taskbar
       - Consumes theme data from ThemeContext
       - Manages window state locally (visibility, position, z-index)
       - No external API calls; purely presentational
     - **FormBuilder.tsx**: 
       - Receives form templates from formService.getTemplates()
       - Uses FormContext to manage/persist form data (questions, logic, settings)
       - Submits completed forms via formService.createForm() which sends to backend /api/forms
       - Data is validated with zod schemas before submission
     - **FormResponder.tsx**: 
       - Fetches form data from formService.getForm(id)
       - Records voice via useAudio hook, which provides audio stream
       - Processes audio through voiceService.transcribeAudio() which calls backend /api/voice/transcribe
       - Conversation state handled by conversationService which connects to /api/conversation
       - Responses saved through formService.submitResponse() to /api/responses
     - **Dashboard.tsx**: 
       - Fetches analytics via api.get('/api/analytics')
       - Uses useResponses hook to get response data
       - Displays visualizations of form completion rates, common responses
   - **Windows 98 UI Components**:
     - Win95/98 theming implemented through theme-w95.css and RetroWindow/RetroInput components
     - Desktop environment simulation (windows, icons, taskbar) in RetroDesktop.tsx
     - Designed for nostalgic user experience while providing modern functionality
   - **Key Services**:
     - **voiceService.ts**: 
       - Handles audio recording via Web Audio API
       - Sends audio to backend for transcription (POST /api/voice/transcribe)
       - Receives text responses, sends to AI (POST /api/conversation)
       - Returns processed responses to UI components
     - **formService.ts**: 
       - CRUD operations for forms (GET/POST/PUT/DELETE /api/forms)
       - Handles form templates (GET /api/forms/templates)
       - Manages form response submission (POST /api/responses)
     - **websocketService.ts**:
       - Establishes real-time connection for live updates
       - Handles WebRTC signaling for peer-to-peer audio
       - Routes messages to appropriate handlers

2. **`apps/backend/`**  
   - **Express.js** with TypeScript.  
   - **Database Integration and Data Flow**:
     - **db.ts**: Establishes PostgreSQL connection via Drizzle ORM
     - Data flow: Controllers → Services → db/databaseStorage.ts → PostgreSQL
     - Schema defined in packages/shared/schemas.ts for consistent types across frontend/backend
     - Migrations in migrations/ folder handle schema updates
   - **API Controllers and Services**:
     - **formController.js**: 
       - Receives form creation/edit requests from frontend
       - Validates data through validators.js
       - Persists to database via databaseStorage.ts
       - Returns created/updated form data to frontend
     - **voiceFormController.js**:
       - Receives audio from frontend's voiceService
       - Passes to voiceService.ts for processing
       - Sends transcribed text to engine/graph.js for conversation processing
       - Returns AI responses to frontend
     - **conversationController.js**:
       - Handles conversational context and state
       - Uses LangGraph (engine/) to maintain conversation flow
       - Stores conversation history in database
       - Returns appropriate responses based on conversation state
   - **LangGraph Integration**:
     - **engine/graph.js**: 
       - Defines conversation flow as a directed graph
       - Nodes represent conversation states (greeting, question, validation, etc.)
       - Receives input from conversationController.js
       - Processes through appropriate nodes based on state
       - Returns next response and updated state
     - **engine/graphBuilder.js**:
       - Dynamically constructs graphs based on form configuration
       - Translates form questions into conversation nodes
       - Builds validation logic for expected responses
     - **engine/nodes.js**:
       - Individual conversation processing components
       - Each node receives input, context, and conversation state
       - Processes data and returns output for next node
       - Uses prompts.js templates for AI interactions
   - **WebRTC Implementation**:
     - **rtc/webrtc-signaling.ts**:
       - Handles connection establishment between peers
       - Exchanges ICE candidates, offers, and answers
       - Manages session initiation and teardown
       - Connects to websocket-handler.ts for message routing
     - **webrtc-server.js**:
       - Coordinates real-time connections
       - Handles WebSocket upgrade and connection management
       - Dispatches messages to appropriate handlers
   - **External Service Integration**:
     - **groqService.ts**:
       - Connects to Groq API for fast AI inference
       - Transforms conversation state into prompts
       - Processes responses and extracts relevant information
       - Returns structured data to conversation engine
     - **emailService.js**:
       - Sends form completion notifications
       - Delivers response summaries to form owners
       - Handles email templates and personalization

3. **`infra/`**  
   - **docker-compose.yml**: Defines multi-container environment with:
     - PostgreSQL database (persistent volume mapping)
     - Backend Express service (with environment variables)
     - Frontend React service (with hot reloading)
     - TURN server for WebRTC connectivity
   - **aws/**: 
     - **ecs/ecs-setup.tf**: Configures ECS cluster, tasks, and services
     - **rds/rds-setup.tf**: Sets up PostgreSQL database with backups
     - **vpc.tf**: Defines network architecture with public/private subnets
     - **secrets.tf**: Manages secure storage of API keys and credentials
   - **turn-server/**: TURN server configuration for WebRTC NAT traversal

4. **`packages/`**  
   - **`database/`**: 
     - Contains shared database schema definitions
     - Used by both backend and frontend for type consistency
     - Exports table structures and relationships
   - **`shared/`**: 
     - **constants.ts**: Application-wide constant values
     - **schemas.ts**: Zod validation schemas used in both frontend/backend
     - **types.ts**: TypeScript interfaces for data models
     - **utils.ts**: Shared utility functions for common operations
   - **`tokens/`**: 
     - **theme-w95.css**: Windows 95/98 design token definitions
     - Used by frontend for consistent styling
   - **`webrtc-client/`**: 
     - **client.ts**: WebRTC connection handling and stream management
     - Used by frontend to establish peer connections

5. **`scripts/`**  
   - **`seed-db.ts`**: 
     - Creates initial database content
     - Inserts sample forms with questions and logic
     - Sets up test user accounts
   - Deployment and maintenance utilities

---

## AWS Deployment

The application is deployed to AWS using:

- **ECS (Fargate)** for running containerized backend and frontend services
- **RDS PostgreSQL** for the database
- **ECR** for storing Docker images
- **Application Load Balancer** for routing traffic
- **Secrets Manager** for secure storage of credentials and API keys

Terraform configurations for the AWS infrastructure can be found in the `/infra/aws` directory.

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

1. **Windows 98 Nostalgic UI**
   - Authentic Windows 98 desktop experience with:
     - Draggable windows with minimize/maximize/close controls
     - Working taskbar showing currently open applications
     - Start menu with program categories
     - Desktop icons for launching applications
     - Alt+Tab window switching and Windows key functionality
     - Classic UI styling (buttons, inputs, window borders)
   - Complete with easter eggs:
     - Blue Screen of Death (try typing "crash" in a form title)
     - Clippy-style assistant for help
     - Active Desktop elements with scrolling text
   - Implements the 90s aesthetics while maintaining modern functionality
   - Defined in `apps/frontend/src/components/` with styles in `packages/tokens/theme-w95.css`

2. **Docker-based Development**  
   - Each app has a dev Dockerfile for immediate reloading.  
   - `infra/docker-compose.yml` can run the entire stack: database, backend, frontend, and TURN server.

3. **Voice Form Responder**  
   - Allow users to complete forms through natural speech.
   - Real-time peer-to-peer voice streaming via WebRTC.
   - Low-latency transcription and validation of responses.
   - Fallback to text input when necessary.

4. **LangGraph AI Engine**  
   - The backend orchestrates multi-step conversation flows with validation, follow-up questions, and context-aware responses.  
   - Code in `apps/backend/src/engine/`, managing sophisticated conversational logic.

5. **WebRTC Integration**  
   - Peer-to-peer audio streaming for minimal latency.
   - Secure, encrypted communication channels.
   - Fallback mechanisms for challenging network environments.
   - TURN server support for NAT traversal.

6. **Intuitive Form Builder**  
   - Create sophisticated multi-question forms with branching logic.
   - Define validation rules and custom response options.
   - Preview form flow from the user's perspective.

7. **Response Analytics**  
   - Visualize form completion metrics.
   - Analyze sentiment in voice responses.
   - Extract key insights from conversational data.

8. **Mobile-First Design**  
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

4. **AWS Security Integration**
   - AWS Secrets Manager for secure credentials storage
   - IAM roles with least privilege principle
   - Security groups for network isolation
   - VPC configuration with private subnets for databases
   - SSL/TLS encryption with automatic certificate management

5. **Secure Secrets Management**
   - All API keys stored in AWS Secrets Manager
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
   - Error tracking with CloudWatch for real-time alerts
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

3. **AWS Deployment**
   In `infra/aws/`, run:
   ```bash
   ./deploy.sh
   ```
   This script will:
   - Apply the Terraform configuration
   - Build and push Docker images to ECR
   - Output the application URLs

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
  - PostgreSQL database with Drizzle ORM
  - WebRTC signaling server
  - LangGraph for orchestrating conversational flows
  - Groq integration for fast AI inference

- **Infrastructure**:
  - Turborepo + pnpm for consolidated multi-app dev
  - Docker for local dev/prod builds
  - AWS ECS (Fargate) for containerized deployment
  - AWS RDS for PostgreSQL database
  - TURN server for WebRTC NAT traversal

---

## License

MIT License

---

FuckTyping: Because nobody likes typing on forms.