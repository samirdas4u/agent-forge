# Agent Forge

**AI-powered practice simulation and adaptive eLearning platform.**

Agent Forge replaces static training scripts with dynamic, adaptive AI scenarios that respond to the learner in real time. It is built for enterprise support teams, graduate scheme candidates, sales professionals, and anyone who wants to practise high-stakes conversations before they happen for real.

**Live platform:** [www.agentforge.org.uk](https://www.agentforge.org.uk)  
**Architecture overview:** [www.agentforge.org.uk/architecture](https://www.agentforge.org.uk/architecture)

---

## What it does

Traditional training simulations are scripted. They follow a fixed path regardless of what the learner says. Agent Forge uses a multi-agent AI system to generate scenarios that adapt in real time — escalating difficulty, shifting persona behaviour, and adjusting coaching feedback based on how the session is actually going.

The platform covers five core training domains: customer service, sales, job interviews, negotiation, and presentation skills. Each domain has its own set of AI personas with distinct communication styles, emotional states, and escalation patterns.

---

## Key features

| Feature | Description |
|---|---|
| **Seamless voice simulation** | Speak naturally — the mic listens, detects silence, sends your speech to the AI, and plays the response automatically. No buttons between speaking and hearing the AI reply. |
| **ElevenLabs voice personas** | Each AI persona has a matched ElevenLabs voice. The voice switches automatically when the simulation language changes — 32 languages supported. |
| **Multi-agent AI orchestration** | Five autonomous agents (Simulation, Coaching, Evaluation, Planning, Orchestrator) operate independently and pass context between each other. |
| **Adaptive difficulty engine** | Scenario complexity adjusts in real time based on learner performance — modifying persona emotional state, objection intensity, and technical complexity. |
| **Session analytics** | Every session is scored across communication clarity, empathy, problem-solving, and professionalism. Scores feed into a readiness prediction model. |
| **Walkthroughs** | Step-by-step guided practice modules with branching scenarios and inline coaching tips. |
| **Career prep** | Dedicated interview practice with industry-specific question banks, live AI interviewer, and post-session feedback. |
| **17-language support** | Full UI and simulation localisation across English, French, German, Spanish, Arabic, Mandarin, and 11 more. |
| **Agentic dashboard** | Real-time view of the AI agent system — active agents, inter-agent messages, task queue, and orchestration events. |
| **Feature experimentation sandbox** | LaunchDarkly-style feature flags with statistical confidence measurement, built directly into the platform. |

---

## Architecture

The system is built on a React 19 + TypeScript frontend, an Express 4 + tRPC 11 backend, and a MySQL/TiDB database managed with Drizzle ORM. All backend calls are end-to-end typed via tRPC — no REST routes, no Axios wrappers, no shared contract files.

```
client/          React 19 + Tailwind 4 + shadcn/ui
server/          Express 4 + tRPC 11 + Drizzle ORM
drizzle/         Schema definitions and migrations
server/_core/    Auth, LLM, TTS, image generation, maps, notifications
storage/         S3 helpers for file storage
shared/          Constants and types shared across client/server
```

**Voice pipeline:** Web Speech API captures audio in real time → 1.5s silence detection triggers transcript submission → tRPC `chat` procedure sends transcript + conversation history to the LLM → response text is passed to ElevenLabs TTS → MP3 audio plays in browser → mic restarts automatically.

**LLM integration:** All AI inference runs server-side via a preconfigured LLM helper. The system uses structured JSON schema responses for evaluation scoring and readiness prediction, and streaming text for simulation responses.

**Authentication:** Manus OAuth 2.0 with JWT session cookies. Role-based access control (`admin` / `user`) gates admin procedures and the management dashboard.

For a full breakdown of architectural decisions, data flow diagrams, and the database schema, see the [Architecture page](https://www.agentforge.org.uk/architecture).

---

## Tech stack

| Layer | Technology | Reason for choice |
|---|---|---|
| Frontend framework | React 19 + TypeScript | Concurrent rendering, strong typing |
| Styling | Tailwind CSS 4 + shadcn/ui | Design token system, accessible components |
| API layer | tRPC 11 + Superjson | End-to-end type safety, no code generation step |
| Backend | Express 4 + Node.js | Lightweight, compatible with serverless hosting |
| Database ORM | Drizzle ORM | Type-safe queries, lightweight, fast migrations |
| Database | MySQL / TiDB | Relational integrity, horizontal scalability |
| Voice synthesis | ElevenLabs multilingual v2 | 32-language support, persona-matched voices |
| Speech recognition | Web Speech API | Zero-latency real-time transcription, no upload needed |
| File storage | AWS S3 | Scalable object storage, presigned URL access |
| Hosting | Cloud Run (serverless autoscale) | Cold-start tolerant, cost-efficient at variable load |

---

## Running locally

```bash
# Install dependencies
pnpm install

# Set environment variables (see .env.example)
cp .env.example .env

# Apply database migrations
pnpm drizzle-kit generate
# then apply the generated SQL via your database client

# Start development server
pnpm dev
```

The development server runs on `http://localhost:3000`. The Vite frontend and Express backend share the same port via a proxy.

---

## Testing

```bash
pnpm test
```

Tests are written with Vitest and cover authentication flows, simulation procedures, and the ElevenLabs TTS integration. All tests run in under 5 seconds.

---

## Project structure decisions

**Why tRPC over REST?** Type safety flows from the database schema through to the React component without any intermediate contract files or code generation. Refactoring a procedure signature immediately surfaces every call site that needs updating.

**Why Web Speech API over Whisper for voice mode?** Whisper requires uploading an audio file, waiting for transcription, and returning a result — adding 2–4 seconds of latency per turn. The Web Speech API transcribes in real time as the user speaks, making the silence-detection trigger feel instantaneous.

**Why ElevenLabs over browser TTS?** Browser TTS voices are flat and robotic, which undermines the realism of a practice simulation. ElevenLabs multilingual v2 produces natural, persona-appropriate speech and handles language switching automatically.

---

## Licence

MIT — free to use, fork, and build on.

---

Built by [Samir Das](https://www.samirdas.co.uk) — AI Learning & Knowledge Technology Architect.
