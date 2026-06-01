import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  GitBranch,
  Globe,
  Layers,
  Lock,
  Mic,
  Server,
  Shield,
  Sparkles,
  TestTube2,
  Workflow,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TECH_STACK = [
  {
    layer: "Frontend",
    color: "bg-indigo-50 border-indigo-200",
    headerColor: "bg-indigo-600",
    items: [
      { name: "React 19", role: "UI rendering with concurrent features" },
      { name: "TypeScript 5", role: "End-to-end type safety" },
      { name: "Tailwind CSS 4", role: "Utility-first styling with OKLCH tokens" },
      { name: "tRPC 11 Client", role: "Type-safe RPC calls — no REST boilerplate" },
      { name: "TanStack Query 5", role: "Server state, caching, optimistic updates" },
      { name: "Wouter", role: "Lightweight client-side routing" },
      { name: "Recharts", role: "Analytics charts and radar visualisations" },
      { name: "Framer Motion", role: "Micro-interactions and state transitions" },
      { name: "react-i18next", role: "17-language internationalisation" },
      { name: "Web Speech API", role: "Real-time browser-native STT (no upload)" },
    ],
  },
  {
    layer: "Backend",
    color: "bg-violet-50 border-violet-200",
    headerColor: "bg-violet-600",
    items: [
      { name: "Node.js + Express 4", role: "HTTP server and middleware layer" },
      { name: "tRPC 11 Server", role: "Procedure-based API with Zod validation" },
      { name: "Drizzle ORM", role: "Type-safe SQL queries against TiDB/MySQL" },
      { name: "Superjson", role: "Serialises Date/BigInt across the wire" },
      { name: "Jose (JWT)", role: "Session cookie signing and verification" },
      { name: "OAuth 2.0 / SSO", role: "Zero-config single sign-on — no password storage" },
      { name: "Vite (SSR bridge)", role: "Dev-server proxy and HMR" },
    ],
  },
  {
    layer: "AI & Voice",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-600",
    items: [
      { name: "LLM (GPT-4 class)", role: "Scenario roleplay, feedback generation, course authoring" },
      { name: "ElevenLabs Turbo v2.5", role: "Persona-matched TTS — 32 languages, <400ms latency" },
      { name: "Whisper API", role: "Fallback STT for browsers without Web Speech API" },
      { name: "Tavus CVI", role: "Real-time video interview with AI avatar" },
      { name: "D-ID SDK", role: "Talking-head avatar for persona simulation" },
    ],
  },
  {
    layer: "Infrastructure",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-600",
    items: [
      { name: "TiDB Serverless", role: "MySQL-compatible distributed database" },
      { name: "AWS S3", role: "Audio recordings, persona avatars, course assets" },
      { name: "Cloud Run (Autoscale)", role: "Serverless Node.js deployment, min-instances=0" },
      { name: "Vitest", role: "12 automated unit tests across routers and integrations" },
    ],
  },
];

const DESIGN_DECISIONS = [
  {
    title: "tRPC over REST",
    icon: Code2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    problem: "Traditional REST APIs require duplicated type definitions on client and server, leading to runtime type mismatches and verbose boilerplate.",
    decision: "tRPC 11 with Superjson serialisation provides end-to-end TypeScript inference. Procedures defined in server/routers.ts are consumed directly in React components via trpc.*.useQuery/useMutation — no shared contract files, no Axios wrappers, no manual type casting.",
    tradeoff: "Tighter client-server coupling. Acceptable for a single-team product where both layers evolve together.",
  },
  {
    title: "Web Speech API for real-time STT",
    icon: Mic,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    problem: "The original voice flow required four manual steps: tap Record → speak → tap Stop → tap Send. This created cognitive friction that broke the simulation immersion.",
    decision: "The browser-native Web Speech API provides continuous real-time transcription with zero upload latency. A 1.5-second silence detector automatically submits the transcript, creating a zero-decision voice loop. Whisper API is used as a fallback for Safari and Firefox.",
    tradeoff: "Web Speech API is Chrome/Edge-only for full support. The fallback path preserves functionality across all browsers at the cost of higher latency.",
  },
  {
    title: "ElevenLabs Turbo v2.5 for TTS",
    icon: Sparkles,
    color: "text-violet-600",
    bg: "bg-violet-50",
    problem: "Browser-native TTS (SpeechSynthesis API) produces flat, robotic output that undermines the realism of a sales or interview simulation.",
    decision: "ElevenLabs eleven_turbo_v2_5 model is called server-side, returning MP3 audio streamed to the client. Voice IDs are mapped to scenario personas by name and category — Sarah Chen gets Bella (warm female), board executives get Arnold (crisp male). The model handles all 32 supported languages automatically based on text content.",
    tradeoff: "API cost per character. Mitigated by a 500-character cap per response and server-side fallback to built-in TTS when quota is exhausted.",
  },
  {
    title: "Drizzle ORM over Prisma",
    icon: Database,
    color: "text-amber-600",
    bg: "bg-amber-50",
    problem: "Prisma's query engine is a native binary that does not run in Cloud Run's Node-only build image without additional configuration.",
    decision: "Drizzle ORM is a pure TypeScript/JavaScript library with no native binary dependency. It compiles to raw SQL, is fully compatible with TiDB's MySQL wire protocol, and produces typed query results that flow directly into tRPC procedures without additional mapping.",
    tradeoff: "Drizzle's migration tooling is less mature than Prisma's. Migrations are applied manually via webdev_execute_sql to maintain explicit control over schema changes.",
  },
  {
    title: "Serverless (Autoscale) hosting",
    icon: Server,
    color: "text-rose-600",
    bg: "bg-rose-50",
    problem: "A training platform used episodically (not 24/7) would waste cost on always-on reserved instances.",
    decision: "Cloud Run Autoscale with min-instances=0 means the platform costs nothing when idle and scales to handle concurrent users during active sessions. The 180-second request timeout is sufficient for all LLM and TTS operations.",
    tradeoff: "Cold starts of 2–4 seconds on first request after idle. Acceptable for a training tool; not suitable for real-time financial or safety-critical systems.",
  },
  {
    title: "Role-based access via database enum",
    icon: Lock,
    color: "text-slate-600",
    bg: "bg-slate-50",
    problem: "Admin features (scenario creation, user management, agentic dashboard) must be gated without introducing a separate auth service.",
    decision: "The users table includes a role enum (user | admin). Every protected tRPC procedure checks ctx.user.role before executing. adminProcedure is a middleware layer that throws FORBIDDEN before any business logic runs. Frontend conditionally renders admin nav items based on useAuth().user?.role.",
    tradeoff: "Role promotion requires a direct SQL update. Intentional — it prevents accidental privilege escalation and keeps the permission model auditable.",
  },
];

const DATA_FLOW = [
  { step: "1", label: "User speaks", detail: "Web Speech API captures audio in real time, streaming interim results to a live transcript bubble in the UI." },
  { step: "2", label: "Silence detected", detail: "After 1.5s of silence, the final transcript is sent to the tRPC speakText procedure via a useMutation call." },
  { step: "3", label: "AI generates response", detail: "The server calls invokeLLM() with the scenario system prompt, conversation history, and user message. The LLM returns a text response." },
  { step: "4", label: "TTS synthesis", detail: "The response text is passed to elevenLabsTTS() with the persona-matched voice ID. The server returns an MP3 buffer as a base64 data URL." },
  { step: "5", label: "Audio playback", detail: "The client decodes the base64 URL into an Audio object and plays it. The animated orb transitions to 'speaking' state with sound-wave animation." },
  { step: "6", label: "Auto-restart", detail: "When audio ends, the orb returns to 'listening' state and the Web Speech API restarts automatically — no user action required." },
  { step: "7", label: "Real-time scoring", detail: "In parallel, the server calls the scoring LLM with the user's message and appends a score object to the session's messages array in TiDB." },
];

const DB_TABLES = [
  { name: "users", purpose: "Auth identity, role, streak tracking, aggregate stats" },
  { name: "scenarios", purpose: "Simulation blueprints — persona, system prompt, channel, language lock, folder" },
  { name: "sessions", purpose: "Practice session lifecycle — status, per-dimension scores, feedback summary" },
  { name: "messages", purpose: "Individual conversation turns with per-message scores and AI feedback" },
  { name: "walkthroughs", purpose: "Step-by-step product walkthrough definitions" },
  { name: "walkthrough_completions", purpose: "Per-user walkthrough progress tracking" },
  { name: "courses", purpose: "AI-generated eLearning courses from uploaded documents" },
  { name: "lessons", purpose: "Ordered lesson units within a course" },
  { name: "content_blocks", purpose: "Atomic content units — text, key-concept, quiz, summary" },
  { name: "course_enrollments", purpose: "Learner progress and completion state per course" },
  { name: "sandbox_instances", purpose: "Product sandbox environments with status and preview URLs" },
  { name: "feature_flags", purpose: "Rollout percentage, targeting rules, kill switches" },
  { name: "test_runs", purpose: "Synthetic conversation test scripts and pass/fail results" },
  { name: "personas", purpose: "Reusable AI persona definitions with version history" },
  { name: "sandbox_events", purpose: "Full event stream per sandbox for replay and audit" },
  { name: "agent_events", purpose: "Agentic system events — nudges, interventions, orchestration logs" },
  { name: "coaching_nudges", purpose: "AI-generated coaching interventions per learner" },
  { name: "learning_paths", purpose: "Adaptive learning path recommendations per user" },
  { name: "difficulty_adjustments", purpose: "Dynamic difficulty tuning records per session" },
];

const LEARNING_SCIENCE = [
  {
    number: "01",
    name: "Ericsson's Deliberate Practice Theory",
    informs: "Unlimited Repetition with Immediate Feedback",
    color: "bg-indigo-50 border-indigo-200",
    numColor: "bg-indigo-600",
    detail: "Expert-level performance is not the result of innate talent but of sustained, focused practice with immediate feedback. Agent Forge implements this through unlimited repetition of targeted scenarios with real-time coaching interventions — the digital equivalent of Rapid Cycle Deliberate Practice (RCDP) used in medical simulation training.",
  },
  {
    number: "02",
    name: "Vygotsky's Zone of Proximal Development",
    informs: "Adaptive Difficulty Calibration",
    color: "bg-violet-50 border-violet-200",
    numColor: "bg-violet-600",
    detail: "Learning occurs most effectively in the zone between what a learner can accomplish independently and what they can achieve with guidance. The Adaptive Difficulty Agent functions as a digital scaffold, continuously calibrating challenge levels to maintain each learner within their personal ZPD — never so easy that learning stalls, never so difficult that confidence collapses.",
  },
  {
    number: "03",
    name: "Bloom's Revised Taxonomy",
    informs: "Higher-Order Assessment Design",
    color: "bg-emerald-50 border-emerald-200",
    numColor: "bg-emerald-600",
    detail: "Rather than testing recall (Level 1) or comprehension (Level 2), Agent Forge evaluates at the higher-order levels: Application, Analysis, and Evaluation. This ensures training transfers to production performance rather than merely testing memorisation of procedures. Most platforms assess at Bloom's Level 1–2 via multiple-choice quizzes; Agent Forge assesses at Levels 3–6 through authentic performance.",
  },
];

const RUBRIC_DOMAINS = [
  { domain: "Decision Quality", pts: 15, pct: "30%", bloom: "Analyse / Evaluate (L4–L5)", example: "Did the agent identify root cause from multiple symptoms?" },
  { domain: "Process Adherence", pts: 10, pct: "20%", bloom: "Apply (L3)", example: "Did the agent apply the correct verification procedure?" },
  { domain: "Communication", pts: 10, pct: "20%", bloom: "Evaluate / Create (L5–L6)", example: "Did the agent synthesise a coherent case summary?" },
  { domain: "Tool Proficiency", pts: 5, pct: "10%", bloom: "Apply (L3)", example: "Did the agent use the CRM tools correctly and efficiently?" },
  { domain: "Documentation", pts: 5, pct: "10%", bloom: "Create (L6)", example: "Did the agent produce accurate, complete case notes?" },
  { domain: "Time Efficiency", pts: 5, pct: "10%", bloom: "Apply (L3)", example: "Did the agent resolve the issue within the target handle time?" },
];

const COACHING_TIERS = [
  { tier: "Hint", trigger: "Missed opportunity", ux: "Non-blocking notification badge", color: "bg-amber-50 border-amber-300", dot: "bg-amber-400" },
  { tier: "Warning", trigger: "Procedural error", ux: "Slide-in panel, requires acknowledgement", color: "bg-orange-50 border-orange-300", dot: "bg-orange-500" },
  { tier: "Critical", trigger: "Compliance violation", ux: "Full overlay, requires correction before continuing", color: "bg-rose-50 border-rose-300", dot: "bg-rose-600" },
];

const AGENT_CASCADE = [
  { step: "1", agent: "Learner", action: "Submits response", detail: "The learner's message is sent to the tRPC speakText procedure." },
  { step: "2", agent: "Simulation Agent", action: "Generates customer reply", detail: "Produces the AI customer's next response within persona constraints." },
  { step: "3", agent: "Coaching Agent", action: "Evaluates for intervention triggers", detail: "Analyses the response against compliance rules and best-practice benchmarks." },
  { step: "4", agent: "Coaching Agent", action: "Publishes CRITICAL_ERROR event", detail: "If a critical error is detected, broadcasts to the shared state bus." },
  { step: "5", agent: "Adaptive Difficulty Agent", action: "Reduces persona complexity by 0.2", detail: "Subscribes to CRITICAL_ERROR — softens the customer persona to prevent confidence collapse." },
  { step: "6", agent: "Evaluation Agent", action: "Logs error with timestamp", detail: "Records the error for post-session 50-point rubric scoring." },
  { step: "7", agent: "Planning Agent", action: "Updates competency map", detail: "Receives session-end summary and adjusts the learner's personalised learning path." },
];

const COMPETITORS = [
  { platform: "Second Nature", approach: "AI role-play for sales", limitation: "Single-agent, sales-only, no CRM simulation or multi-agent orchestration" },
  { platform: "Solidroad", approach: "AI conversation practice", limitation: "No multi-agent orchestration, no adaptive difficulty, no 50-point rubric" },
  { platform: "Mindtickle", approach: "Revenue enablement", limitation: "Sales-focused, no customer service depth, no real-time coaching tiers" },
  { platform: "Whatfix / WalkMe", approach: "Digital adoption platforms", limitation: "Guidance overlays, not simulation-based training" },
  { platform: "Articulate Rise", approach: "eLearning authoring", limitation: "Static content, no AI, no real-time interaction or adaptive difficulty" },
];

const MODULES = [
  { name: "Communication Simulation", icon: "🎭", routes: ["/scenarios", "/simulate/:sessionId", "/session/:id/result", "/session/:id/replay"], description: "5 scenario categories, 5 AI personas, real-time scoring across 5 dimensions, session replay." },
  { name: "Video Interview Practice", icon: "🎥", routes: ["/interview", "/interview/session/:id", "/interview/result"], description: "Tavus CVI real-time video interview with AI avatar, structured feedback report, LinkedIn share." },
  { name: "eLearning Course Builder", icon: "📚", routes: ["/courses", "/courses/new", "/courses/:id/edit", "/learn/:slug"], description: "Document upload → AI course generation → block editor → SCORM export → public learner view." },
  { name: "Tool Walkthrough Player", icon: "🗺️", routes: ["/walkthroughs", "/walkthroughs/:id"], description: "Whatfix-style spotlight walkthrough with step tooltips and completion tracking." },
  { name: "Product Sandbox", icon: "🔬", routes: ["/sandbox", "/sandbox/flags", "/sandbox/ai-tester", "/sandbox/test-runner", "/sandbox/personas", "/sandbox/events"], description: "Engineering control plane — feature flags, AI behaviour tester, synthetic test runner, persona lab, event log." },
  { name: "Agentic Dashboard", icon: "🤖", routes: ["/agentic-dashboard"], description: "5-agent orchestration system — Readiness Predictor, Coaching Nudge, Difficulty Adjuster, Content Curator, Engagement Monitor." },
  { name: "Analytics & Progress", icon: "📊", routes: ["/dashboard", "/analytics", "/leaderboard", "/readiness"], description: "Recharts radar/trend/bar visualisations, streak tracking, leaderboard, readiness predictions." },
  { name: "AI Coaching", icon: "🧠", routes: ["/coaching"], description: "4 coach personas (Socratic, GROW, Solution-Focused, Directive) — voice-enabled 1:1 sessions, session arc tracking, post-session coaching report. Beta." },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Architecture() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-700">
          <Layers size={20} />
          Agent Forge
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">← Home</Link>

        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-20">

        {/* ── Hero ── */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-4 py-2 rounded-full border border-indigo-200">
            <Code2 size={14} />
            Technical Architecture — Agent Forge v29
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            How Agent Forge<br />
            <span className="text-indigo-600">was engineered</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A full-stack AI training platform built in TypeScript from first principles — covering system design, architectural decisions, data models, and the engineering rationale behind every major choice.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { icon: Code2, label: "21,766 lines of TypeScript" },
              { icon: TestTube2, label: "12 automated tests" },
              { icon: Database, label: "19 database tables" },
              { icon: Layers, label: "8 product modules" },
              { icon: Globe, label: "17 languages" },
              { icon: Brain, label: "5 AI agents" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium">
                <Icon size={14} className="text-indigo-500" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── System Architecture Diagram (text-based) ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Architecture</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agent Forge is a monorepo with a shared TypeScript codebase. The frontend and backend run as a single Node.js process in production, with Vite handling the client bundle. All API traffic flows through tRPC procedures — there are no REST endpoints for feature logic.
          </p>
          <div className="bg-gray-950 rounded-2xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-gray-300 leading-7">{`
  Browser (React 19 + Tailwind 4)
  │
  ├── tRPC Client (TanStack Query)  ──────────────────────────────┐
  │   └── trpc.*.useQuery / useMutation                          │
  │                                                               ▼
  ├── Web Speech API (real-time STT)          Express Server (Node.js)
  │   └── SpeechRecognition → interim text    │
  │                                           ├── tRPC Router
  └── Audio playback (base64 MP3)             │   ├── auth.*        (OAuth, session)
                                              │   ├── simulation.*  (scenarios, sessions)
                                              │   ├── interview.*   (Tavus CVI)
                                              │   ├── courses.*     (AI authoring)
                                              │   ├── sandbox.*     (flags, personas)
                                              │   ├── agentic.*     (5-agent system)
                                              │   └── coaching.*    (personas, chat, TTS, report)
                                              │
                                              ├── LLM (GPT-4 class)
                                              │   └── invokeLLM()
                                              │
                                              ├── ElevenLabs TTS
                                              │   └── elevenLabsTTS() → MP3 buffer
                                              │
                                              ├── Drizzle ORM
                                              │   └── TiDB Serverless (MySQL)
                                              │
                                              └── AWS S3
                                                  └── storagePut() / storageGet()
`}</pre>
          </div>
        </section>

        {/* ── Voice Data Flow ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Simulation Data Flow</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The voice simulation loop was redesigned from a 4-step manual process (record → stop → transcribe → send) to a fully automatic cycle. The user speaks; the AI responds. No buttons, no waiting, no decisions.
          </p>
          <div className="space-y-3">
            {DATA_FLOW.map((item) => (
              <div key={item.step} className="flex gap-4 items-start bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                  <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technology Stack</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Every dependency was chosen for a specific reason — not defaults or familiarity. The table below maps each library to the problem it solves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TECH_STACK.map((layer) => (
              <div key={layer.layer} className={`rounded-2xl border ${layer.color} overflow-hidden`}>
                <div className={`${layer.headerColor} text-white px-5 py-3 font-bold text-sm`}>
                  {layer.layer}
                </div>
                <div className="divide-y divide-gray-100">
                  {layer.items.map((item) => (
                    <div key={item.name} className="px-5 py-3 flex gap-3">
                      <span className="font-semibold text-gray-900 text-sm w-40 flex-shrink-0">{item.name}</span>
                      <span className="text-gray-600 text-sm">{item.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Design Decisions ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Key Engineering Decisions</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The decisions below reflect deliberate trade-off analysis — each one had a clear problem, a considered solution, and an acknowledged downside. This is the kind of reasoning that distinguishes architecture from assembly.
          </p>
          <div className="space-y-5">
            {DESIGN_DECISIONS.map((d) => (
              <div key={d.title} className="rounded-2xl border border-gray-200 overflow-hidden">
                <div className={`${d.bg} px-6 py-4 flex items-center gap-3`}>
                  <d.icon size={20} className={d.color} />
                  <h3 className="font-bold text-gray-900">{d.title}</h3>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">Problem</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">{d.problem}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Decision</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">{d.decision}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Trade-off</span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">{d.tradeoff}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Database Schema ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Schema</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            19 tables in TiDB Serverless (MySQL-compatible), defined in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">drizzle/schema.ts</code> with full TypeScript inference. All timestamps are stored as UTC; all scores are stored as floats to support fractional precision.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-5 py-3 font-semibold text-xs w-52">Table</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {DB_TABLES.map((t, i) => (
                  <tr key={t.name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3 font-mono text-xs text-indigo-700 font-semibold">{t.name}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{t.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Product Modules ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Modules</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agent Forge is composed of 7 independent product modules, each with its own routes, tRPC router, and database tables. Modules are loosely coupled — a user can use the course builder without ever touching the simulation engine.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map((m) => (
              <div key={m.name} className="rounded-2xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{m.icon}</span>
                  <h3 className="font-bold text-gray-900 text-sm">{m.name}</h3>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed mb-3">{m.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.routes.map((r) => (
                    <span key={r} className="bg-gray-100 text-gray-600 font-mono text-xs px-2 py-0.5 rounded">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testing & Quality ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Testing & Code Quality</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            All server-side logic is covered by Vitest unit tests. TypeScript strict mode is enabled across the entire monorepo. The CI check runs <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">tsc --noEmit</code> and <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">vitest run</code> before every deployment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: TestTube2, label: "12 / 12 tests passing", sub: "Vitest — simulation, auth, ElevenLabs", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Shield, label: "0 TypeScript errors", sub: "strict mode, noImplicitAny, strictNullChecks", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: Zap, label: "50-criterion QA scoring", sub: "Automated per-message evaluation by LLM", color: "text-amber-600", bg: "bg-amber-50" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-5 border border-gray-100`}>
                <item.icon size={24} className={`${item.color} mb-3`} />
                <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                <p className="text-gray-600 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Security ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Model</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "No password storage", detail: "Authentication is delegated entirely to OAuth 2.0 SSO. The platform stores only an openId reference — never a password hash." },
              { title: "Server-side API keys", detail: "ElevenLabs, LLM, Tavus, and S3 credentials are injected as server-side environment variables. No API key is ever sent to the browser." },
              { title: "JWT session cookies", detail: "Sessions are signed with HS256 using a platform-injected JWT_SECRET. Cookies are HttpOnly and SameSite=Lax." },
              { title: "Role-gated procedures", detail: "Every admin operation is wrapped in adminProcedure middleware that throws FORBIDDEN before executing any business logic." },
              { title: "S3 path randomisation", detail: "File keys include nanoid random suffixes to prevent enumeration attacks on uploaded assets." },
              { title: "Zod input validation", detail: "All tRPC procedure inputs are validated with Zod schemas before reaching any database or LLM call." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Agentic System ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agentic Orchestration System</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agent Forge includes a 5-agent orchestration layer that operates autonomously on learner data. Each agent has a single responsibility and writes its outputs to dedicated database tables, which the Agentic Dashboard reads in real time.
          </p>
          <div className="space-y-3">
            {[
              { name: "Readiness Predictor", icon: "🎯", desc: "Analyses session history and score trends to predict whether a learner is ready to advance to the next difficulty tier. Writes to difficulty_adjustments." },
              { name: "Coaching Nudge Agent", icon: "💬", desc: "Detects learners who have not practised in 48+ hours or whose scores are declining. Generates personalised coaching messages. Writes to coaching_nudges." },
              { name: "Difficulty Adjuster", icon: "⚖️", desc: "Dynamically modifies the AI persona's behaviour mid-session based on real-time scoring — making the simulation harder or easier without interrupting the conversation." },
              { name: "Content Curator", icon: "📖", desc: "Recommends scenarios and walkthroughs based on a learner's weakest scoring dimensions. Writes to learning_paths." },
              { name: "Engagement Monitor", icon: "📡", desc: "Tracks session abandonment patterns, time-to-first-message, and response latency to identify at-risk learners. Writes to agent_events." },
            ].map((agent) => (
              <div key={agent.name} className="flex gap-4 items-start bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl flex-shrink-0">{agent.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{agent.name}</p>
                  <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Learning Science Foundations ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Science Foundations</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agent Forge's architecture is grounded in three evidence-based learning science frameworks. Each framework directly informs a distinct technical component — the connection between pedagogy and engineering is explicit, not incidental.
          </p>
          <div className="space-y-4">
            {LEARNING_SCIENCE.map((ls) => (
              <div key={ls.number} className={`rounded-2xl border ${ls.color} overflow-hidden`}>
                <div className="flex items-start gap-4 p-5">
                  <div className={`${ls.numColor} text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}>{ls.number}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{ls.name}</p>
                    <p className="text-xs text-indigo-600 font-semibold mt-0.5 mb-2">Informs: {ls.informs}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{ls.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 50-Point Competency Rubric ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">50-Point Competency Rubric</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Every simulation session is automatically scored across 6 competency domains by the Evaluation Agent. The rubric satisfies three requirements simultaneously: pedagogical validity (scores reflect genuine competency), production alignment (categories map to enterprise QA frameworks), and predictive power (simulation scores correlate with real-world performance).
          </p>
          <p className="text-gray-500 text-sm mb-6 italic">Scoring uses a criterion-referenced approach — scores reflect absolute competency against defined standards, not relative performance against peers. The rubric deliberately targets Bloom's Levels 3–6 (Apply, Analyse, Evaluate, Create) — not recall or comprehension.</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-5 py-3 font-semibold text-xs">Domain</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Points</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Weight</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Bloom's Level</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Example Assessment</th>
                </tr>
              </thead>
              <tbody>
                {RUBRIC_DOMAINS.map((r, i) => (
                  <tr key={r.domain} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3 font-semibold text-gray-900 text-xs">{r.domain}</td>
                    <td className="px-5 py-3 text-indigo-700 font-bold text-xs">{r.pts}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{r.pct}</td>
                    <td className="px-5 py-3 text-violet-700 text-xs">{r.bloom}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{r.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-indigo-800 text-xs font-semibold mb-1">Kirkpatrick 4-Level Alignment</p>
            <p className="text-indigo-700 text-xs leading-relaxed">The evaluation framework maps to all four levels of Kirkpatrick's training evaluation model — a distinction from most platforms that only measure Levels 1 and 2. Level 1 (Reaction): post-session satisfaction score. Level 2 (Learning): 50-point rubric domain breakdown. Level 3 (Behaviour): score trajectory and coaching dependency reduction over time. Level 4 (Results): Predictive Readiness Score estimating time-to-production-threshold.</p>
          </div>
        </section>

        {/* ── Coaching Agent 3-Tier System ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coaching Agent — 3-Tier Intervention System</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The Coaching Agent monitors learner actions in real time and delivers contextual interventions calibrated to avoid disrupting simulation flow. Research shows that forced scaffolding creates dependency — so interventions are severity-tiered and non-intrusive by design.
          </p>
          <div className="space-y-3">
            {COACHING_TIERS.map((t) => (
              <div key={t.tier} className={`rounded-xl border ${t.color} p-4 flex items-start gap-4`}>
                <div className={`w-3 h-3 rounded-full ${t.dot} flex-shrink-0 mt-1`} />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tier</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{t.tier}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Trigger</p>
                    <p className="text-gray-700 text-sm mt-0.5">{t.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">UX Pattern</p>
                    <p className="text-gray-700 text-sm mt-0.5">{t.ux}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Inter-Agent Cascade ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inter-Agent Communication — Cascade Example</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The orchestration layer manages a shared state bus where agents publish events and subscribe to relevant signals. A single learner action can trigger a coordinated cascade across all five agents simultaneously. The example below shows what happens when a critical compliance error is detected.
          </p>
          <div className="space-y-3">
            {AGENT_CASCADE.map((item) => (
              <div key={item.step} className="flex gap-4 items-start bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{item.action}</p>
                    <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">{item.agent}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── AI Coaching Module ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Coaching Module <span className="text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full align-middle">Beta</span></h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The AI Coaching module is a distinct pillar from simulation — where simulation trains performance through repetition, coaching develops the person through reflection. The module is built on four coach personas, each grounded in a real coaching framework, with a voice-first session experience and a structured post-session report.
          </p>

          {/* Coach personas table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-5 py-3 font-semibold text-xs">Coach</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Style</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Framework</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Focus</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">ElevenLabs Voice</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { coach: "Maya Chen", style: "Socratic / Reflective", framework: "Clean Language + Appreciative Inquiry", focus: "Leadership identity, self-awareness, values", voice: "Bella (warm female)" },
                  { coach: "James Whitfield", style: "GROW Model", framework: "Goal → Reality → Options → Will", focus: "Sales performance, career targets, goals", voice: "Adam (deep male)" },
                  { coach: "Priya Sharma", style: "Solution-Focused", framework: "SFBC + Narrative Coaching", focus: "Career transitions, confidence, imposter syndrome", voice: "Grace (calm female)" },
                  { coach: "Marcus Reid", style: "Directive / Challenge", framework: "Gestalt + Ontological Coaching", focus: "Executive presence, stakeholder influence", voice: "Arnold (crisp male)" },
                ].map((row, i) => (
                  <tr key={row.coach} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3 font-semibold text-gray-900 text-xs">{row.coach}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{row.style}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{row.framework}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{row.focus}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs font-mono">{row.voice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Session arc */}
          <h3 className="text-base font-bold text-gray-900 mb-3">Session Arc</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Every coaching session follows a 5-phase arc tracked implicitly through conversation history. The LLM system prompt instructs the coach to move through phases naturally — no explicit state machine required.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {["1 · Check-in", "2 · Exploration", "3 · Insight", "4 · Action", "5 · Close"].map((phase, i) => (
              <div key={phase} className="flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-4 py-2">
                <div className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</div>
                <span className="text-xs font-semibold text-violet-800">{phase.split(" · ")[1]}</span>
              </div>
            ))}
          </div>

          {/* Post-session report */}
          <h3 className="text-base font-bold text-gray-900 mb-3">Post-Session Coaching Report</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            At session end, the full conversation transcript is passed to the LLM with a structured JSON schema. The report is personalised — it references specific things the coachee said, not generic feedback.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { field: "sessionSummary", desc: "2–3 sentence essence of the session" },
              { field: "keyInsight", desc: "The single most important realisation" },
              { field: "breakthroughMoment", desc: "The exchange that created most movement" },
              { field: "commitment", desc: "Specific action with timeframe" },
              { field: "strengthsObserved", desc: "Array of strengths the coach noticed" },
              { field: "growthEdge", desc: "One area most ripe for development" },
              { field: "reflectionQuestions", desc: "3 questions to sit with before next session" },
              { field: "nextSessionFocus", desc: "Recommended focus for next session" },
              { field: "coachNote", desc: "Personal note from the coach to the coachee" },
            ].map(({ field, desc }) => (
              <div key={field} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <p className="font-mono text-xs text-violet-700 font-semibold mb-1">{field}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Competitive Differentiation ── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Competitive Differentiation</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Agent Forge occupies a unique position — combining multi-agent AI simulation with adaptive difficulty, a 50-point automated rubric, and zero license cost. No existing commercial platform implements all of these capabilities in a single product.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-5 py-3 font-semibold text-xs">Platform</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Approach</th>
                  <th className="text-left px-5 py-3 font-semibold text-xs">Limitation vs Agent Forge</th>
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.platform} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-3 font-semibold text-gray-900 text-xs">{c.platform}</td>
                    <td className="px-5 py-3 text-gray-700 text-xs">{c.approach}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{c.limitation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gray-950 rounded-3xl p-8 sm:p-12 text-center text-white">
          <Workflow size={36} className="mx-auto mb-4 text-indigo-400" />
          <h2 className="text-2xl font-bold mb-3">Explore the live platform</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xl mx-auto leading-relaxed">
            Every architectural decision described on this page is visible in the running product. No login required to explore scenarios, walkthroughs, or the agentic dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-500 transition-colors"
            >
              <Globe size={16} />
              Visit Agent Forge
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://github.com/samirdas4u/agent-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              <GitBranch size={16} />
              View on GitHub
            </a>
            <a
              href="https://samirdas.co.uk/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={16} />
              samirdas.co.uk
            </a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            Built by Samir Das · <a href="https://www.agentforge.org.uk" className="underline hover:text-gray-300">agentforge.org.uk</a>
          </p>
        </section>

      </div>
    </div>
  );
}
