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
