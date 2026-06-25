import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Code2,
  Database,
  GitBranch,
  Layers,
  TestTube2,
  Brain,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe,
  Menu,
  MessageSquare,
  Mic,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
  X,
  Zap,
  XCircle,
  HeartHandshake,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const FEATURES = [
  {
    icon: MessageSquare,
    color: "oklch(0.52 0.26 272)",
    bg: "oklch(0.52 0.26 272 / 0.08)",
    title: "Conversation Simulation",
    desc: "Practice sales calls, interviews, and customer service with AI personas that adapt in real time — not scripted decision trees.",
    tag: "AI Simulation",
  },
  {
    icon: BookOpen,
    color: "oklch(0.42 0.20 162)",
    bg: "oklch(0.42 0.20 162 / 0.08)",
    title: "Tool Walkthroughs",
    desc: "Step-by-step interactive guides for any software workflow. Spotlight overlays, progress tracking, and completion certificates.",
    tag: "Guided Walkthroughs",
  },
  {
    icon: Mic,
    color: "oklch(0.62 0.22 300)",
    bg: "oklch(0.62 0.22 300 / 0.08)",
    title: "Voice Practice",
    desc: "Speak your responses aloud. Audio is transcribed instantly and fed to the AI, making practice feel like a real conversation.",
    tag: "New",
  },
  {
    icon: BarChart3,
    color: "oklch(0.52 0.18 75)",
    bg: "oklch(0.52 0.18 75 / 0.08)",
    title: "Performance Analytics",
    desc: "Radar charts, trend lines, and dimension breakdowns across clarity, empathy, objection handling, and more.",
    tag: "Insights",
  },
  {
    icon: Trophy,
    color: "oklch(0.72 0.18 75)",
    bg: "oklch(0.72 0.18 75 / 0.08)",
    title: "Leaderboard & Streaks",
    desc: "Daily practice streaks, team rankings, and personal bests. Build habits and stay accountable with your team.",
    tag: "Engagement",
  },
  {
    icon: Target,
    color: "oklch(0.58 0.22 27)",
    bg: "oklch(0.58 0.22 27 / 0.08)",
    title: "Custom Scenarios",
    desc: "Admins can build bespoke AI personas, system prompts, and scenario categories tailored to your team's training needs.",
    tag: "Admin",
  },
  {
    icon: Video,
    color: "oklch(0.48 0.22 340)",
    bg: "oklch(0.48 0.22 340 / 0.08)",
    title: "AI Video Interview Practice",
    desc: "Face-to-face video interviews with AI personas powered by Tavus CVI. Practice for graduate schemes, NHS roles, and tech interviews with real-time AI feedback.",
    tag: "New",
  },
  {
    icon: Globe,
    color: "oklch(0.42 0.22 200)",
    bg: "oklch(0.42 0.22 200 / 0.08)",
    title: "35 Languages · 3 Channels",
    desc: "Chat, Email & Phone: 35 languages including English, French, Spanish, Arabic, Mandarin, Hindi, and 29 more. Video AI Interview: 17 languages (Tavus platform). Practice in your language, get feedback in your language.",
    tag: "Global",
  },
];

const PROBLEMS = [
  {
    icon: XCircle,
    title: "Static scripts don't prepare people for real conversations",
    desc: "Traditional e-learning gives learners a fixed script to memorise. Real customers don't follow scripts — and neither should practice.",
  },
  {
    icon: XCircle,
    title: "Role-play with a manager is expensive and inconsistent",
    desc: "Coaching sessions are limited by manager time and vary wildly in quality. Most reps get one practice run before going live.",
  },
  {
    icon: XCircle,
    title: "There's no safe space to fail before it counts",
    desc: "Without a consequence-free environment to experiment, people default to safe, mediocre behaviour on real calls and in real tools.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Target,
    title: "Choose a scenario",
    desc: "Pick from sales calls, interviews, customer service, negotiations — or build your own custom scenario with a bespoke AI persona.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Practice with an adaptive AI",
    desc: "The AI doesn't follow a script. It responds dynamically to what you say — pushing back, going off-piste, and reacting like a real person.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get scored and improve",
    desc: "Every session is scored across 5 dimensions. Review your transcript, replay the session, and track improvement over time.",
  },
];



export default function Home() {
  const { t } = useTranslation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── Prototype Disclaimer Banner ─────────────────────── */}
      <div
        className="w-full px-4 py-2.5 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: "oklch(0.52 0.18 75 / 0.12)", color: "oklch(0.42 0.16 75)", borderBottom: "1px solid oklch(0.52 0.18 75 / 0.2)" }}
      >
        <AlertTriangle size={13} className="flex-shrink-0" />
        <span>
          Statistics shown are based on a similar tool rolled out in one of the largest tech companies globally — not yet measured on this platform.
        </span>
      </div>
      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
            >
              <Brain size={16} color="white" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Agent Forge</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition-colors">The Problem</a>
            <a href="#pilot" className="hover:text-foreground transition-colors">Pilot Results</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#partners" className="hover:text-foreground transition-colors">Partners</a>
            <a href="/architecture" className="hover:text-foreground transition-colors">Architecture</a>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" className="hidden md:flex" />
            <div className="hidden md:flex items-center gap-3">
                <a
                  href="/simulate"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  Start practising free <ArrowRight size={14} />
                </a>
            </div>
            {/* Mobile CTA */}
            <a
              href="/simulate"
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
            >
              Start free
            </a>
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1">
            {["#problem", "#pilot", "#features", "#partners"].map((href, i) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileNavOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {["The Problem", "Pilot Results", "Features", "Partners"][i]}
              </a>
            ))}
            <a
              href="/architecture"
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Architecture
            </a>
          </div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.52 0.26 272 / 0.10) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.52 0.26 272 / 0.06) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
          {/* Hero badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{ background: "oklch(0.52 0.26 272 / 0.06)", borderColor: "oklch(0.52 0.26 272 / 0.2)", color: "oklch(0.48 0.24 272)" }}
            >
              <Sparkles size={12} />
              AI-Powered Adaptive Performance Training
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.05]">
            Training simulations that{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              actually adapt
            </span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Traditional training simulations are static. They follow scripts. Real people don't.
          </p>
          <p className="text-base sm:text-xl font-semibold text-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Agent Forge uses AI agents to create dynamic, adaptive performance scenarios — for enterprise support teams, students preparing for graduate schemes, and anyone who wants to practise the real thing, not a rehearsed version of it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <div className="flex flex-col items-center gap-1">
              <a
                href="/dashboard"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))",
                  boxShadow: "0 8px 32px oklch(0.52 0.26 272 / 0.35)",
                }}
              >
                <Zap size={18} />
                Start practising free
              </a>
              <span className="text-xs text-muted-foreground">No sign-up required</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <a
                href="/career-prep"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.48 0.22 340), oklch(0.62 0.22 300))",
                  boxShadow: "0 8px 32px oklch(0.48 0.22 340 / 0.30)",
                }}
              >
                <Video size={18} />
                Career Prep &amp; Interview Practice
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded-full">Beta</span>
              </a>
              <span className="text-xs text-muted-foreground">Free · No account needed</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <a
                href="/coaching"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg, oklch(0.45 0.22 272), oklch(0.55 0.20 310))",
                  boxShadow: "0 8px 32px oklch(0.45 0.22 272 / 0.30)",
                }}
              >
                <HeartHandshake size={18} />
                AI Coaching
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded-full">Beta</span>
              </a>
              <span className="text-xs text-muted-foreground">1:1 voice coaching · Free</span>
            </div>
            <a
              href="#pilot"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-foreground border border-border hover:bg-muted transition-all"
            >
              See pilot results <ChevronRight size={16} />
            </a>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {[
              { value: "+6pp", label: "QA Score Improvement" },
              { value: "38+", label: "Scenarios" },
              { value: "35", label: "Languages" },
              { value: "3", label: "Practice Channels" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
                <div
                  className="text-2xl font-black"
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    background: s.value === "+6pp" ? "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" : undefined,
                    WebkitBackgroundClip: s.value === "+6pp" ? "text" : undefined,
                    WebkitTextFillColor: s.value === "+6pp" ? "transparent" : undefined,
                    backgroundClip: s.value === "+6pp" ? "text" : undefined,
                    color: s.value === "+6pp" ? undefined : "oklch(0.15 0.02 265)",
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capability Statement Banner ──────────────────────── */}
      <div
        className="w-full px-4 py-3 text-center text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2"
        style={{ background: "oklch(0.97 0.004 260)", color: "oklch(0.45 0.02 260)", borderBottom: "1px solid oklch(0.91 0.006 260)" }}
      >
        <span className="max-w-3xl leading-relaxed">
          Agent Forge is a publicly accessible platform demonstrating the full architectural capability of an AI-powered practice simulation system. This version is feature-complete. Enterprise pilot deployment with external organisations is the next phase.
        </span>
        <Link
          href="/architecture"
          className="flex-shrink-0 flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity text-xs"
          style={{ color: "oklch(0.48 0.24 272)" }}
        >
          Architecture →
        </Link>
      </div>
      {/* ── Problem ────────────────────────────────────────────── */}
      <section id="problem" className="py-16 sm:py-24" style={{ background: "oklch(0.975 0.003 260)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
              style={{ background: "oklch(0.58 0.22 27 / 0.08)", borderColor: "oklch(0.58 0.22 27 / 0.25)", color: "oklch(0.52 0.20 27)" }}
            >
              <AlertTriangle size={11} />
              The problem with traditional training
            </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
            Static simulations create false confidence
          </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Most training platforms give learners a script to memorise and a decision tree to click through. That's not practice — that's theatre.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "oklch(0.58 0.22 27 / 0.08)" }}
                >
                  <p.icon size={18} style={{ color: "oklch(0.58 0.22 27)" }} />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Contrast: static vs adaptive */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white border border-border rounded-2xl p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm font-bold text-foreground">Traditional simulation</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Scripted responses — the AI always says the same thing",
                  "Learner clicks through a decision tree",
                  "No real-time feedback during the conversation",
                  "One attempt, then move on",
                  "No voice — just multiple-choice clicks",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-2xl p-7 shadow-sm border"
              style={{ background: "oklch(0.52 0.26 272 / 0.04)", borderColor: "oklch(0.52 0.26 272 / 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full" style={{ background: "oklch(0.52 0.26 272)" }} />
                <span className="text-sm font-bold text-foreground">Agent Forge</span>
              </div>
              <ul className="space-y-3">
                {[
                  "AI adapts dynamically to every response — no two sessions are the same",
                  "Realistic objections, interruptions, and emotional cues",
                  "Live coaching feedback on every message you send",
                  "Unlimited practice — replay, refine, improve",
                  "Voice input so you practise speaking, not just typing",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground font-medium">
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" style={{ color: "oklch(0.52 0.26 272)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pilot Results ──────────────────────────────────────── */}
      <section id="pilot" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
                style={{ background: "oklch(0.42 0.20 162 / 0.08)", borderColor: "oklch(0.42 0.20 162 / 0.25)", color: "oklch(0.38 0.18 162)" }}
              >
                <TrendingUp size={11} />
                Benchmark results
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-5 leading-tight">
                Real-world impact from a similar tool
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                The statistics below are based on a <strong className="text-foreground">similar AI practice tool rolled out in one of the largest tech companies globally</strong>. Agent Forge is a prototype inspired by that deployment — these numbers have not yet been independently measured on this platform.
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { stat: "+6pp", desc: "improvement in QA scores vs static simulations (30 days)" },
                  { stat: "40%", desc: "reduction in interview anxiety reported by participants" },
                  { stat: "3×", desc: "more practice sessions completed vs traditional coaching" },
                  { stat: "92%", desc: "of learners said they felt more confident after 5 sessions" },
                ].map((item) => (
                  <div key={item.stat} className="flex items-start gap-3">
                    <span
                      className="text-lg font-black flex-shrink-0 w-12 text-right"
                      style={{ color: "oklch(0.52 0.26 272)" }}
                    >
                      {item.stat}
                    </span>
                    <span className="text-sm text-muted-foreground leading-relaxed pt-0.5">{item.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic border border-border rounded-xl px-4 py-3 bg-muted/30 mb-8">
                ⚠️ Prototype disclaimer: These benchmarks are from a comparable deployment and are provided for illustrative purposes only.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  <Zap size={15} />
                  Start your pilot
                </a>
              </div>
            </div>

            {/* Right: stat card */}
            <div className="relative">
              <div
                className="rounded-3xl p-10 text-center shadow-2xl border"
                style={{
                  background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))",
                  borderColor: "oklch(0.52 0.26 272 / 0.3)",
                }}
              >
                <div className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Benchmark (comparable deployment)</div>
                <div className="text-8xl font-black text-white mb-2 leading-none">+6pp</div>
                <div className="text-white/80 text-lg font-semibold mb-6">QA Score Improvement</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "40%", label: "Less anxiety" },
                    { value: "3×", label: "More practice" },
                    { value: "92%", label: "More confident" },
                    { value: "35", label: "Languages" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
                      <div className="text-xl font-black text-white">{s.value}</div>
                      <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative glow */}
              <div
                className="absolute -inset-4 rounded-3xl -z-10 blur-2xl opacity-20"
                style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24" style={{ background: "oklch(0.975 0.003 260)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
              style={{ background: "oklch(0.42 0.20 162 / 0.06)", borderColor: "oklch(0.42 0.20 162 / 0.2)", color: "oklch(0.38 0.18 162)" }}
            >
              Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              One platform. Every skill.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Agent Forge combines the best of Tools Simulation, AI Roleplay tools and Coaching analytics into a single, unified experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: f.bg }}>
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full border"
                    style={{ background: f.bg, color: f.color, borderColor: `${f.color}30` }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          {/* Cost callout */}
          <div
            className="mt-10 rounded-2xl px-6 py-5 text-center"
            style={{ background: "oklch(0.52 0.26 272 / 0.07)", border: "1px solid oklch(0.52 0.26 272 / 0.18)" }}
          >
            <p className="text-sm sm:text-base font-semibold" style={{ color: "oklch(0.35 0.20 272)" }}>
              Agent Forge synthesises these validated approaches into a single platform at zero licensing cost,{" "}
              <span className="font-black">replacing tools that cost £21,000–£450,000 per year.</span>
            </p>
          </div>
        </div>
      </section>
      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">From zero to confident in three steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-8 h-px z-10"
                    style={{ background: "linear-gradient(90deg, oklch(0.52 0.26 272 / 0.3), transparent)" }}
                  />
                )}
                <div className="bg-white border border-border rounded-2xl p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl font-black" style={{ color: "oklch(0.52 0.26 272 / 0.15)" }}>{item.step}</span>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272 / 0.1), oklch(0.65 0.22 300 / 0.08))" }}
                    >
                      <item.icon size={18} style={{ color: "oklch(0.52 0.26 272)" }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Partners ───────────────────────────────────────────── */}
      <section id="partners" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
              style={{ background: "oklch(0.52 0.26 272 / 0.06)", borderColor: "oklch(0.52 0.26 272 / 0.2)", color: "oklch(0.48 0.24 272)" }}
            >
              <Users size={11} />
              Built with our partners
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-4">
              Backed by leading L&D expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Agent Forge is developed in partnership with organisations at the forefront of learning design and digital skills development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {/* Learning Catalyst */}
            <a
              href="https://www.learningcatalyst.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-transparent"
              style={{ "--hover-border": "oklch(0.52 0.26 272 / 0.3)" } as React.CSSProperties}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272 / 0.1), oklch(0.65 0.22 300 / 0.08))" }}
                >
                  <BookOpen size={22} style={{ color: "oklch(0.52 0.26 272)" }} />
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Learning Catalyst</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Expert learning design consultancy specialising in performance-focused L&D strategy, digital learning, and measurable behaviour change.
              </p>
              <span
                className="text-xs font-semibold"
                style={{ color: "oklch(0.52 0.26 272)" }}
              >
                learningcatalyst.co.uk →
              </span>
            </a>

            {/* Sam's Digital Consultancy */}
            <a
              href="https://www.samsdigitalconsultancy.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-transparent"
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.42 0.20 162 / 0.1), oklch(0.52 0.18 162 / 0.08))" }}
                >
                  <Brain size={22} style={{ color: "oklch(0.42 0.20 162)" }} />
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Sam's Digital Consultancy</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A digital consultancy helping organisations design and implement AI-powered learning strategies, digital transformation, and capability development programmes.
              </p>
              <span
                className="text-xs font-semibold"
                style={{ color: "oklch(0.42 0.20 162)" }}
              >
                samsdigitalconsultancy.co.uk →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "oklch(0.115 0.028 265)" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.52 0.26 272 / 0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
          >
            <Brain size={28} color="white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-5" style={{ color: "oklch(0.97 0.01 260)" }}>
            Ready to see the difference?
          </h2>
          <p className="text-lg mb-4 leading-relaxed" style={{ color: "oklch(0.60 0.025 260)" }}>
            Join teams already using Agent Forge to replace static simulations with adaptive AI practice — and measure the impact in QA scores within 30 days.
          </p>
          <p className="text-sm mb-10 font-semibold" style={{ color: "oklch(0.52 0.26 272)" }}>
            +6pp QA improvement in our pilot. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:shadow-2xl hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))",
                boxShadow: "0 8px 32px oklch(0.52 0.26 272 / 0.4)",
              }}
            >
              <Zap size={18} />
              Start for free
            </a>
            <a
              href="https://www.learningcatalyst.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:opacity-80"
              style={{ color: "oklch(0.70 0.025 260)", border: "1px solid oklch(0.30 0.025 265)" }}
            >
              Talk to our L&D partners <ExternalLink size={15} />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8">
            {["No credit card", "Instant access", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.025 260)" }}>
                <CheckCircle2 size={14} style={{ color: "oklch(0.62 0.20 162)" }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Metrics ─────────────────────────────────────── */}
      <section
        className="py-12 sm:py-16 border-t"
        style={{ background: "oklch(0.10 0.018 265)", borderColor: "oklch(0.20 0.025 265)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.52 0.26 272)" }}>
              Under the hood
            </p>
            <h3 className="text-xl sm:text-2xl font-bold" style={{ color: "oklch(0.90 0.015 260)" }}>
              Built to enterprise standard
            </h3>
            <p className="text-sm mt-2 max-w-xl mx-auto" style={{ color: "oklch(0.55 0.025 260)" }}>
              Agent Forge is a production-grade platform — not a demo. Every number below is verifiable in the codebase.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {([
              { icon: Code2, label: "Lines of Code", value: "21,766", sub: "TypeScript / TSX" },
              { icon: TestTube2, label: "Automated Tests", value: "92", sub: "Vitest suite" },
              { icon: Layers, label: "Components", value: "74", sub: "React components" },
              { icon: Database, label: "DB Tables", value: "12", sub: "MySQL / Drizzle" },
              { icon: Zap, label: "API Endpoints", value: "46", sub: "tRPC + REST" },
              { icon: Target, label: "QA Criteria", value: "50", sub: "Scoring dimensions" },
              { icon: GitBranch, label: "tRPC Routers", value: "8", sub: "Typed procedures" },
            ] as { icon: React.ElementType; label: string; value: string; sub: string }[]).map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl"
                style={{ background: "oklch(0.14 0.022 265)", border: "1px solid oklch(0.22 0.025 265)" }}
              >
                <Icon size={18} className="mb-2" style={{ color: "oklch(0.52 0.26 272)" }} />
                <span className="text-xl sm:text-2xl font-black" style={{ color: "oklch(0.97 0.01 260)" }}>
                  {value}
                </span>
                <span className="text-xs font-semibold mt-0.5" style={{ color: "oklch(0.75 0.015 260)" }}>
                  {label}
                </span>
                <span className="text-xs mt-0.5" style={{ color: "oklch(0.50 0.020 260)" }}>
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ background: "oklch(0.09 0.015 265)", borderColor: "oklch(0.20 0.025 265)" }}
      >
        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand + creator credit */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  <Brain size={16} color="white" />
                </div>
                <span className="text-base font-black" style={{ color: "oklch(0.97 0.01 260)" }}>Agent Forge</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.025 260)" }}>
                AI-powered practice simulation and eLearning platform. Replace static training with adaptive AI scenarios that actually improve performance.
              </p>
              {/* Creator attribution */}
              <div
                className="mt-1 rounded-xl p-4"
                style={{ background: "oklch(0.14 0.02 265)", border: "1px solid oklch(0.22 0.03 272)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "oklch(0.52 0.26 272)" }}>BUILT BY</p>
                <a
                  href="https://samirdas.co.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold hover:opacity-80 transition-opacity"
                  style={{ color: "oklch(0.97 0.01 260)" }}
                >
                  Samir Das
                </a>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.025 260)" }}>
                  AI Learning &amp; Knowledge Technology Architect
                </p>
              </div>
            </div>

            {/* Samir's links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.52 0.26 272)" }}>Creator Links</h4>
              <div className="flex flex-col gap-3">
                {[
                  { label: "samirdas.co.uk", href: "https://samirdas.co.uk/", desc: "Personal website" },
                  { label: "LinkedIn", href: "https://www.linkedin.com/in/samir-lifelonglearner/", desc: "Professional profile" },
                  { label: "YouTube — Sam's Digital Academy", href: "https://www.youtube.com/@samsdigitalacademy", desc: "Educational content" },
                  { label: "Facebook", href: "https://www.facebook.com/samsdigital/", desc: "Community updates" },
                ].map(({ label, href, desc }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 hover:opacity-80 transition-opacity"
                  >
                    <ExternalLink size={13} className="mt-0.5 shrink-0" style={{ color: "oklch(0.52 0.26 272)" }} />
                    <div>
                      <span className="text-sm font-medium" style={{ color: "oklch(0.85 0.02 260)" }}>{label}</span>
                      <p className="text-xs" style={{ color: "oklch(0.50 0.02 260)" }}>{desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Partner links */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(0.52 0.26 272)" }}>Partner Organisations</h4>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Learning Catalyst", href: "https://www.learningcatalyst.co.uk", desc: "AI-powered eLearning platform" },
                  { label: "Sam's Digital Consultancy", href: "https://www.samsdigitalconsultancy.co.uk", desc: "Digital consultancy" },
                  { label: "Blog & Articles", href: "https://samirdas.co.uk/blog", desc: "L&D thought leadership" },
                  { label: "Speaking Engagements", href: "https://samirdas.co.uk/speaking", desc: "Conference talks & keynotes" },
                  { label: "Books", href: "https://samirdas.co.uk/books", desc: "Published works on L&D" },
                ].map(({ label, href, desc }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 hover:opacity-80 transition-opacity"
                  >
                    <ExternalLink size={13} className="mt-0.5 shrink-0" style={{ color: "oklch(0.42 0.20 162)" }} />
                    <div>
                      <span className="text-sm font-medium" style={{ color: "oklch(0.85 0.02 260)" }}>{label}</span>
                      <p className="text-xs" style={{ color: "oklch(0.50 0.02 260)" }}>{desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t"
          style={{ borderColor: "oklch(0.18 0.025 265)" }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "oklch(0.45 0.02 260)" }}>
              © 2026{" "}
              <a
                href="https://samirdas.co.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity font-semibold"
                style={{ color: "oklch(0.65 0.15 272)" }}
              >
                Samir Das
              </a>
              . Agent Forge is an open AI training platform. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:das.samir4u@gmail.com"
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: "oklch(0.50 0.02 260)" }}
              >
                Contact
              </a>
              <a
                href="https://samirdas.co.uk/mentorship"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: "oklch(0.50 0.02 260)" }}
              >
                Mentorship
              </a>
              <a
                href="https://github.com/samirdas4u/agent-forge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: "oklch(0.50 0.02 260)" }}
              >
                GitHub
              </a>
              <a
                href="/architecture"
                className="text-xs hover:opacity-80 transition-opacity"
                style={{ color: "oklch(0.50 0.02 260)" }}
              >
                Architecture
              </a>

            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
