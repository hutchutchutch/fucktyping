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
│   ├── aws/                # AWS deployment resources (ECS, RDS, etc.)
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
     - PostgreSQL database with Drizzle ORM.
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
   - **aws/**: AWS ECS (Fargate) and RDS PostgreSQL deployment configurations.
   - **turn-server/**: Configuration for TURN server to facilitate WebRTC connections through NATs and firewalls.
   - Deployment configurations for AWS.  

4. **`packages/`**  
   - **`shared/`**: Shared type definitions, utilities, and constants used by both frontend and backend.
   - **`webrtc-client/`**: Reusable WebRTC client library with connection handling, stream management, and reconnection logic.
   - **pnpm** automatically handles linking across your workspace.

5. **`scripts/`**  
   - **`seed-db.ts`**: Seeds the database with sample forms and questions.  
   - Other utilities for development and deployment.

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