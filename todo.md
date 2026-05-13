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
- [ ] Custom scenario creation (admin)

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
