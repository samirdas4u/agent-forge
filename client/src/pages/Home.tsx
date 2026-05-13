import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Mic,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const FEATURES = [
  {
    icon: MessageSquare,
    color: "oklch(0.52 0.26 272)",
    bg: "oklch(0.52 0.26 272 / 0.08)",
    title: "Conversation Simulation",
    desc: "Practice sales calls, interviews, and customer service with AI personas that respond like real humans. Get scored in real time.",
    tag: "Like Solidroad",
  },
  {
    icon: BookOpen,
    color: "oklch(0.42 0.20 162)",
    bg: "oklch(0.42 0.20 162 / 0.08)",
    title: "Tool Walkthroughs",
    desc: "Step-by-step interactive guides for any software workflow. Spotlight overlays, progress tracking, and completion certificates.",
    tag: "Like Whatfix",
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
];

const STATS = [
  { value: "6+", label: "Built-in Scenarios" },
  { value: "5", label: "Scoring Dimensions" },
  { value: "4", label: "Tool Walkthroughs" },
  { value: "∞", label: "Practice Sessions" },
];

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Sales Manager",
    text: "Agent Forge replaced our Solidroad subscription. The AI personas are incredibly realistic and the feedback is actionable.",
    rating: 5,
  },
  {
    name: "James T.",
    role: "L&D Director",
    text: "The walkthrough module is exactly what we needed. Our onboarding time dropped by 40% in the first month.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Customer Success Lead",
    text: "The voice input feature is a game changer. Reps actually practice speaking, not just typing.",
    rating: 5,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
            >
              <Brain size={16} color="white" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Agent Forge</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <a
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  Go to Dashboard <ArrowRight size={14} />
                </a>
              </Link>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </a>
                <a
                  href={getLoginUrl()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  Get started free <ArrowRight size={14} />
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background mesh */}
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

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border" style={{ background: "oklch(0.52 0.26 272 / 0.06)", borderColor: "oklch(0.52 0.26 272 / 0.2)", color: "oklch(0.48 0.24 272)" }}>
            <Sparkles size={12} />
            AI-Powered Practice Platform · Solidroad + Whatfix in One
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 leading-[1.05]">
            Master any skill with{" "}
            <span style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              AI simulation
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Practice real conversations with AI personas. Learn software workflows with interactive walkthroughs.
            Get scored, improve, and track your progress — all in one platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <a
              href={getLoginUrl()}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", boxShadow: "0 8px 32px oklch(0.52 0.26 272 / 0.35)" }}
            >
              <Zap size={18} />
              Start practising free
            </a>
            <Link href="/walkthroughs">
              <a className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-foreground border border-border hover:bg-muted transition-all">
                View walkthroughs <ChevronRight size={16} />
              </a>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl font-black text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border" style={{ background: "oklch(0.42 0.20 162 / 0.06)", borderColor: "oklch(0.42 0.20 162 / 0.2)", color: "oklch(0.38 0.18 162)" }}>
              Everything you need
            </div>
            <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">
              One platform. Every skill.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Agent Forge combines the best of Solidroad, Whatfix, and coaching analytics into a single, unified experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:border-transparent"
                style={{ "--hover-shadow": `0 12px 40px ${f.color}20` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: f.bg }}>
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full border" style={{ background: f.bg, color: f.color, borderColor: `${f.color}30` }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold text-base text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section className="py-24" style={{ background: "oklch(0.975 0.003 260)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">From zero to confident in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Target, title: "Choose a scenario", desc: "Pick from sales calls, interviews, customer service, negotiations, or build your own custom scenario." },
              { step: "02", icon: MessageSquare, title: "Practice with AI", desc: "Engage in a realistic conversation with an AI persona. Use text or voice. Get live coaching feedback as you go." },
              { step: "03", icon: BarChart3, title: "Review & improve", desc: "See your score breakdown across 5 dimensions. Replay your session, identify patterns, and track your growth over time." },
            ].map((item, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-px z-10" style={{ background: "linear-gradient(90deg, oklch(0.52 0.26 272 / 0.3), transparent)" }} />
                )}
                <div className="bg-white border border-border rounded-2xl p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl font-black" style={{ color: "oklch(0.52 0.26 272 / 0.15)" }}>{item.step}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272 / 0.1), oklch(0.65 0.22 300 / 0.08))" }}>
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

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black tracking-tight text-foreground mb-4">Loved by learners</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="oklch(0.72 0.18 75)" style={{ color: "oklch(0.72 0.18 75)" }} />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5 font-medium">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: "oklch(0.115 0.028 265)" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.52 0.26 272 / 0.15) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}>
            <Brain size={28} color="white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5" style={{ color: "oklch(0.97 0.01 260)" }}>
            Ready to forge your skills?
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: "oklch(0.60 0.025 260)" }}>
            Join thousands of professionals who practice smarter with Agent Forge.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={getLoginUrl()}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:shadow-2xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", boxShadow: "0 8px 32px oklch(0.52 0.26 272 / 0.4)" }}
            >
              <Zap size={18} />
              Start for free
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            {["No credit card", "Instant access", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.55 0.025 260)" }}>
                <CheckCircle2 size={14} style={{ color: "oklch(0.62 0.20 162)" }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}>
              <Brain size={12} color="white" />
            </div>
            <span className="text-sm font-bold text-foreground">Agent Forge</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Agent Forge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
