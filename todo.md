# Agent Forge - Project TODO

## Foundation
- [x] Database schema: scenarios, sessions, messages, walkthroughs, analytics
- [x] tRPC routers for all features
- [x] Global blueprint aesthetic (CSS variables, fonts, grid background)
- [x] App layout with sidebar navigation and auth

## Landing Page
- [x] Hero section with blueprint aesthetic
- [x] Feature highlights section
- [x] CTA section with login

## Communication Simulation Module
- [x] Scenario selection page (sales, customer service, interviews)
- [x] AI conversation interface with real-time chat
- [x] Real-time feedback panel during conversation
- [x] Scoring system per message and overall session
- [x] Session completion summary with detailed feedback

## Tool Walkthrough Module
- [x] Walkthrough library page
- [x] Interactive step-by-step guided tour UI
- [x] Progress indicator within walkthrough
- [x] Completion tracking per walkthrough

## Progress Dashboard
- [x] Overview stats (sessions, avg score, streaks)
- [x] Practice history timeline
- [x] Performance metrics charts (recharts)
- [x] Improvement trends over time

## Scenario Management
- [x] Scenario browser with difficulty filters
- [x] Scenario detail page
  - [x] Custom scenario creation (admin)

## Session Recording & Replay
- [x] Session recording storage
- [x] Replay viewer for past sessions
- [x] Message-by-message replay with feedback

## Performance Analytics
- [x] Strengths and weaknesses breakdown
- [x] Category-based scoring (clarity, empathy, objection handling, etc.)
- [x] Comparative analytics across sessions

## Testing
- [x] Vitest tests for simulation router
- [x] Vitest tests for analytics router
- [x] Vitest tests for walkthrough router

## UI/UX Rebuild (Solidroad + Whatfix inspired)
- [x] Solidroad-style 3-panel simulation layout (context | chat | scoring)
- [x] Whatfix-style spotlight walkthrough player with step tooltip
- [x] Solidroad-style session result with score ring and dimension breakdown
- [x] Analytics page with recharts (radar, trend, bar, dimension table)
- [x] Enterprise SaaS dark sidebar navigation (Whatfix-style)
- [x] Card-lift hover effects and micro-interactions
- [x] Orange accent for walkthroughs, indigo accent for simulation
- [x] Fix /simulate route mismatch (added /simulate → Scenarios)
- [x] TypeScript clean (0 errors)
- [x] All 8 tests passing

## Voice Input (Feature Sprint 2)
- [x] Microphone recording button in simulator chat input
- [x] Audio upload to S3 and transcription via Whisper API
- [x] Visual recording indicator (waveform / timer)
- [x] Transcribed text auto-fills input before sending

## Custom Scenario Builder (Feature Sprint 2)
- [x] Admin-only scenario creation form (title, category, difficulty, persona, system prompt, tags)
- [x] Admin scenario list with edit / delete
- [x] Admin panel route (/admin/scenarios) gated by role=admin
- [x] Admin nav item in sidebar for admin users

## Team Leaderboard & Streaks (Feature Sprint 2)
- [x] Daily streak tracking per user (streak_days, last_practice_date)
- [x] Leaderboard page showing top users by score and sessions
- [x] Streak badge on dashboard and leaderboard
- [x] Leaderboard route (/leaderboard) in sidebar nav

## eLearning Authoring Module (Document → Course)

### Database
- [ ] courses table (id, userId, title, description, status, sourceType, slug, createdAt)
- [ ] lessons table (id, courseId, title, objectives, order, createdAt)
- [ ] content_blocks table (id, lessonId, type, content, order, createdAt)
- [ ] course_enrollments table (id, userId, courseId, progress, completedAt)

### Server
- [ ] Document upload + text extraction (PDF via pdf-parse, DOCX via mammoth)
- [ ] AI course generation router (extract → outline → lessons → blocks)
- [ ] Course CRUD router (create, read, update, delete, publish)
- [ ] Lesson CRUD + block CRUD routers
- [ ] Refine with AI router (simplify, add quiz, add example, summarise, rewrite)
- [ ] SCORM 1.2 ZIP export
- [ ] SCORM 2004 3rd Ed ZIP export
- [ ] SCORM 2004 4th Ed ZIP export
- [ ] Public course slug router (unauthenticated learner access)

### Frontend
- [ ] Courses library page (/courses)
- [ ] Course creation page with document upload (/courses/new)
- [ ] AI processing progress screen
- [ ] Block-based course editor (/courses/:id/edit)
- [ ] Refine with AI right panel in editor
- [ ] Lesson outline sidebar in editor
- [ ] Content block types: text, key-concept, quiz, summary
- [ ] SCORM export dialog (choose version, download ZIP)
- [ ] Public learner view (/learn/:slug)
- [ ] Lesson player with progress tracking
- [ ] Quiz block interactive UI
- [ ] Sidebar nav item for Courses

## Product Sandbox — Engineering Control Plane

### Navigation Redesign
- [ ] Dual-pillar top nav: Training | Product Sandbox
- [ ] Training section: Dashboard, Simulate, Walkthroughs, Courses, Analytics, Leaderboard
- [ ] Product Sandbox section: Sandbox Hub, Feature Flags, AI Tester, Test Runner, Persona Lab, Event Log
- [ ] Role-gated: Product Sandbox visible only to engineer/admin roles

### Database Schema
- [ ] sandbox_instances table
- [ ] feature_flags table
- [ ] test_runs table
- [ ] personas table
- [ ] sandbox_events table

### Sandbox Hub
- [ ] Sandbox instance list with status badges
- [ ] Create / clone / snapshot / reset / archive sandbox
- [ ] Shareable preview URL per sandbox

### Feature Flag Console
- [ ] Flag list with toggle, rollout %, targeting rules
- [ ] Kill switch and activity history

### AI Behaviour Tester
- [ ] Debug mode with raw LLM prompt, token usage, latency
- [ ] Per-message scoring breakdown and confidence scores
- [ ] Side-by-side persona comparison

### Synthetic Test Runner
- [ ] Script editor for test conversations
- [ ] Pass/fail assertion results and test history

### Persona Lab
- [ ] Create/edit/publish AI personas with live preview chat
- [ ] Version history per persona

### Event Log & Replay
- [ ] Full event stream per sandbox with filters
- [ ] Step-by-step replay and CSV/JSON export

## Creator Footer & Attribution (v9.0)
- [x] Scrape samirdas.co.uk for all social/project links
- [x] Add rich 3-column footer to landing page (Home.tsx): brand+creator card, Creator Links column, Partner Organisations column
- [x] Footer includes: samirdas.co.uk, LinkedIn, YouTube (Sam's Digital Academy), Facebook, Mentoring Club, Learning Catalyst, Sam's Digital Academy, Blog, Speaking, Books
- [x] Copyright line: © 2026 Samir Das — with link to samirdas.co.uk
- [x] Add "Built by Samir Das" credit panel in sidebar (AppLayout.tsx) visible on all inner pages
- [x] Sidebar credit includes: name link → samirdas.co.uk, LinkedIn, YouTube, Mentoring Club quick links

## Mobile Responsiveness (v10.0)
- [ ] AppLayout: hamburger menu button on mobile, slide-out drawer sidebar
- [ ] Home.tsx: responsive hero, nav, feature grid, comparison table, footer
- [ ] Dashboard: responsive KPI cards and activity feed
- [ ] Scenarios: responsive card grid
- [ ] SimulationSession: stack 3-panel layout vertically on mobile
- [ ] Walkthroughs: responsive card grid
- [ ] Analytics: responsive charts and tables
- [ ] Leaderboard: responsive table/list
- [ ] Courses / CourseEditor / LearnCourse: responsive layouts
- [ ] Sandbox pages: responsive tables and panels
- [ ] AdminScenarios: responsive form and list

## Mobile Responsiveness (v10)
- [x] AppLayout mobile hamburger menu + slide-out drawer
- [x] Home.tsx landing page fully responsive (nav, hero, sections, footer)
- [x] Dashboard, Scenarios, Analytics, Leaderboard responsive
- [x] SimulationSession, Sandbox pages (EventLog, SandboxHub) responsive

## AI Voice Output + Multi-Language UI (v11)
- [x] TTS backend tRPC procedure (server/routers.ts) using OpenAI TTS API
- [x] Frontend audio playback in SimulationSession after each AI message
- [x] Voice toggle button (mute/unmute AI voice) in SimulationSession header
- [x] i18n setup with react-i18next
- [x] Translation files: EN, FR, ES, AR, ZH
- [x] LanguageSwitcher component
- [x] Language switcher in AppLayout sidebar and landing page nav
- [x] Translate all UI strings across all pages (nav + simulation + dashboard + scenarios)
- [x] Language selector on scenario creation/session start (AI converses in chosen language)

## Three-Feature Sprint (v13)
- [ ] Add Bengali (bn) and Swahili (sw) to i18n.ts and LANGUAGE_NAMES map
- [ ] Add language_lock column to scenarios table (DB migration)
- [ ] Update scenario creation/edit to allow admins to set a language lock
- [ ] Show language badge on scenario cards
- [ ] sendMessage respects scenario language_lock over user UI language
- [ ] Prominent language quick-switcher pill on scenario cards ("Practice in French?")

## Language Feature Sprint (v14)
- [ ] Seed language-specific scenario packs (French Sales, Arabic Customer Service, Spanish Interview, German Negotiation)
- [ ] Language filter on Scenarios page filter bar
- [ ] AI "Translate this scenario" button in admin panel — creates language-locked copy

## Three-Feature Sprint v16
- [ ] Scenario folder grouping — folder column in DB, folder filter/group UI on Scenarios page
- [ ] Replay in Voice Mode button on SessionResult page
- [ ] Persona avatar image upload in ScenarioWizard (S3 upload + avatar display on scenario cards)

## v20 Sprint — Interview Feedback, Channel Filters, Landing Page Updates
- [x] Channel filter chips (Phone/Email/Chat/All) on Scenarios page
- [x] generateFeedback tRPC procedure in server/routers/interview.ts
- [x] InterviewResult.tsx page — AI feedback report with score ring, dimension bars, strengths/improvements, sample answer, LinkedIn share
- [x] InterviewSession.tsx handleEnd redirects to /interview/result with query params
- [x] /interview/result route added to App.tsx
- [x] Home.tsx: Video Interview feature card added to FEATURES array
- [x] Home.tsx: 17 Languages · 3 Channels feature card added to FEATURES array
- [x] Home.tsx: Stats row updated (38+ scenarios, 17 languages, 3 channels)
- [x] Home.tsx: Prototype disclaimer banner (amber, top of page)
- [x] Home.tsx: Benchmark stats section with proper attribution (comparable deployment)
- [x] TypeScript clean (0 errors)
- [x] All 8 tests passing

## v21 Sprint — Mobile Responsiveness Audit & Fixes
- [x] Scenarios: channel + category filter chips shown in mobile expanded filter panel
- [x] SimulationSession: mode switcher bar scrollable horizontally on mobile (overflow-x-auto + flex-shrink-0 buttons)
- [x] InterviewSession: smaller PiP self-view on mobile (w-20 → w-32 → md:w-44), responsive bottom controls, hide long timer text on small screens
- [x] Home.tsx: footer padding made responsive (px-4 sm:px-6)
- [x] AppLayout: hamburger + slide-out drawer already in place (verified)
- [x] InterviewResult: already uses flex-col md:flex-row, grid gap-6 md:grid-cols-2 (verified)
- [x] Dashboard: already uses grid grid-cols-2 lg:grid-cols-4, lg:grid-cols-3 (verified)
- [x] Analytics: already uses grid-cols-2 lg:grid-cols-4 and sm: breakpoints (verified)
- [x] Leaderboard: already uses sm: breakpoints throughout (verified)
- [x] TypeScript clean (0 errors)
- [x] All 8 tests passing
- [x] Mobile-responsiveness skill created as permanent standard

## v26 Sprint — Agentic Dashboard

- [ ] Build AgenticDashboard.tsx page matching screenshot (Agent System Health, activity metrics, Agent Activity Log, At-Risk Learners, Coaching Effectiveness, Learning Paths, Event Distribution, Engineering footer)
- [ ] Add tRPC procedures for agentic dashboard data (agent events, learning paths, nudges, at-risk learners)
- [ ] Add /agentic-dashboard route to App.tsx
- [ ] Add "Agentic Dashboard" nav entry to DashboardLayout sidebar (admin only, with AI ORCHESTRATOR badge)
- [ ] Update contact email from samird@meta.com to das.samir4u@gmail.com in Home.tsx footer and everywhere else
- [ ] Add "16 Scenarios" metric to the Engineering footer bar on landing page (visible in screenshot)

## v26 Sprint — GTV Evidence & Agentic Pages

- [x] TypeScript check clean (0 errors)
- [x] Build GTV Evidence page (/gtv-evidence) — OC1/OC2/OC3, Platform Authorship, Cost Comparison, Hackathon recognition
- [x] Update landing page: hackathon badge, innovation claims, creator attribution
- [x] Update Engineering footer metric counts (DB Tables: 12, tRPC Routers: 8)
- [x] Email updated to das.samir4u@gmail.com everywhere
- [x] All 4 new DB tables migrated (agent_events, coaching_nudges, learning_paths, difficulty_adjustments)
- [x] Save checkpoint v26

## v30 Sprint — Multilingual System (Genuine Implementation)

- [x] Created `shared/languages.ts` with 35 languages (Tier 1: 17 all channels incl. video, Tier 2: 18 chat/email/phone only)
- [x] Added `language` column (varchar 10, default 'en') to `sessions` DB table in schema.ts
- [x] Applied migration `0009_numerous_scream.sql` (ALTER TABLE sessions ADD language varchar(10) DEFAULT 'en' NOT NULL)
- [x] Built `LanguageSelector.tsx` component with search, tier badges, channel disclaimer, RTL support
- [x] Added `language` param to `sessions.create` tRPC procedure (z.string().default("en"))
- [x] Updated `createSession` DB helper to accept and persist `language` param
- [x] Added `buildLanguageInstruction` import from `@shared/languages` to server/routers.ts
- [x] Updated `sendMessage` procedure: language priority = scenario.languageLock > session.language > input.language > "en"
- [x] Wired `LanguageSelector` into Scenarios page (desktop + mobile) as `practiceLanguage` state
- [x] `handleStart` passes `language: practiceLanguage` to `createSession.mutate`
- [x] `SimulationSession` reads `session.language` from loaded session data, passes to `sendMessage` and `transcribeVoice`
- [x] TypeScript: 0 errors
- [x] Tests: 8/8 passing
- [x] Checkpoint v30 saved

## D-ID Integration Sprint — Video & Voice

- [x] Audited D-ID Agents API: listed existing agents (Alex, Emma, Jack, Lila), understood chat/transcript endpoints
- [x] Created 7 new D-ID agents for Agent Forge personas (Benjamin, Anna Graduate, Mary NHS, Sophie HR, David Sales, Priya NHS, Rachel Career)
- [x] Updated D-ID client key allowed domains to include Agent Forge production URL
- [x] Created `shared/didAgents.ts` with INTERVIEW_AGENTS and SIMULATION_AGENTS maps
- [x] Installed @d-id/client-sdk npm package
- [x] Built `DIDAgentSession.tsx` component with WebRTC SDK, mute/unmute, talking indicator, transcript collection
- [x] Rewrote `server/routers/interview.ts` to use D-ID agent sessions instead of Tavus
- [x] Updated `generateFeedback` procedure to accept real transcript and score accurately
- [x] Rewrote `InterviewSession.tsx` to embed DIDAgentSession, collect transcript, pass to result page
- [x] Updated `InterviewResult.tsx` to read transcript from sessionStorage and pass to generateFeedback
- [x] Updated `CareerPrep.tsx` to use D-ID agent IDs instead of Tavus persona IDs
- [x] Integrated DIDAgentSession into SimulationSession voice mode (pre-session prompt → live avatar → transcript scoring)
- [x] TypeScript: 0 errors
- [x] Tests: 8/8 passing

## D-ID Per-Agent clientKey Fix Sprint

- [x] Updated `shared/didAgents.ts` to use per-agent clientKey (removed shared DID_CLIENT_KEY)
- [x] Fixed `SimulationSession.tsx`: updated `pickSimulationAgent()` to return full agent config (agentId + clientKey), updated SIMULATION_AGENTS key references from `priya_nhs`/`sophie_hr`/`david_sales` to `nhs`/`hr`/`sales`/`default`, passed `clientKey` to DIDAgentSession
- [x] Fixed `InterviewSession.tsx`: imported INTERVIEW_AGENTS, looked up clientKey by matching agentId, passed `clientKey` to DIDAgentSession
- [x] Fixed `server/routers/interview.ts`: removed `TAVUS_TO_DID_MAP` import, replaced legacy Tavus lookup with direct INTERVIEW_AGENTS lookup by agentId, updated `generateFeedback` persona lookup
- [x] TypeScript: 0 errors
- [x] Tests: 8/8 passing

## Voice Mode UX Fix

- [x] Voice tab in SimulationSession auto-starts D-ID session immediately on tab switch (no extra "Start Live Voice Session" button click)
- [x] Phone mode shows a clear "Switch to Voice Call" banner/CTA to guide users toward the Voice tab

## D-ID Voice Call Fix (Network request failed)

- [x] Add /api/did-proxy route in Express to forward D-ID API requests with server-side API key
- [x] Update DIDAgentSession to use { type: 'bearer', token: clientKey } auth with proxy baseURL

## Guest Mode (Option 2 — No Login Required)

- [x] Audit all auth gates: identified Scenarios, CareerPrep, InterviewPractice as blocking login redirects
- [x] Remove login requirement from: Scenarios (handleStart), CareerPrep (handleStart), InterviewPractice
- [x] Keep login requirement for: saving results, history, profile, dashboard (no change needed — already optional)
- [x] AppLayout already shows "Guest" for unauthenticated users — no blocking gate
- [x] Add "Save your results" sign-in CTA in SessionResult.tsx for guest users
- [x] Update server procedures: interview.createSession, endSession, getStatus, generateFeedback → publicProcedure
- [x] Add soft "Sign in to save progress" nudge banner in Scenarios page for guest users
- [x] Remove all "Coming Soon" disabled buttons in CareerPrep — all 12 personas now active

## Restore Phone/Voice Simulation (Stable)

- [x] Removed D-ID from SimulationSession entirely — voice mode now uses original TTS/STT approach
- [x] Restored original large mic button UI for Voice tab in SimulationSession
- [x] D-ID is now isolated to InterviewSession only (video interview feature)
- [x] Phone mode retains text input + mic recording + AI voice (TTS) as before
- [x] TypeScript: 0 errors · Tests: 8/8 passing

## Phone Simulation Auto-Initiation Fix

- [ ] AI persona should speak first automatically when phone/voice session starts (not wait for user to type)
- [ ] For cold call scenarios: AI opens with a greeting/answer; user responds
- [ ] Mic button should work for voice input in phone mode

## ElevenLabs TTS Integration (v42)
- [x] ELEVENLABS_API_KEY added as secure environment variable
- [x] @elevenlabs/elevenlabs-js SDK installed
- [x] elevenLabsTTS helper created (server/_core/elevenLabsTTS.ts) with persona voice mapping
- [x] pickVoiceForPersona() maps scenario personas to specific ElevenLabs voice IDs
- [x] speakText tRPC procedure updated to use ElevenLabs with automatic fallback to built-in TTS
- [x] SimulationSession passes aiPersona + scenarioCategory context to speakText for voice selection
- [x] Vitest tests for ElevenLabs integration (12/12 passing)
- [x] TypeScript: 0 errors

## Seamless Voice Call UX (v29)
- [x] ElevenLabs TTS integration — persona-matched voices, server-side, fallback to built-in TTS
- [x] Web Speech API real-time STT in voice mode — no manual record/stop/send steps
- [x] Auto-silence detection (1.5s pause) → auto-sends transcript to AI
- [x] 5-state call machine: idle → listening → processing → thinking → speaking
- [x] Animated orb UI — green pulse when listening, amber when processing, indigo waveform when AI speaks
- [x] Live transcript bubble shows what user is saying in real time
- [x] Interrupt button to cut AI off mid-sentence
- [x] End Call button after 2+ messages
- [x] Auto-restart listening after AI finishes speaking
- [x] Phone mode: "Switch to Voice Call" banner for quick upgrade
- [x] TypeScript clean (0 errors), 12/12 tests passing

## Technical Architecture Page (v30)
- [x] /architecture public page — system diagram, voice data flow, tech stack table, 6 design decisions, DB schema, 7 modules, security model, agentic system
- [x] Architecture link added to landing page desktop nav and mobile nav
- [x] Architecture link added to footer bottom bar alongside GTV Evidence
- [x] /architecture route registered in App.tsx
- [x] TypeScript clean (0 errors), 12/12 tests passing
