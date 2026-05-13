import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, MessageSquare, Play, Zap } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    icon: MessageSquare,
    color: "oklch(0.51 0.23 264)",
    bg: "oklch(0.95 0.05 264)",
    title: "Conversation Simulation",
    desc: "Practice sales calls, customer service, interviews, and negotiations with a realistic AI persona that responds naturally and challenges you.",
    tag: "Like Solidroad",
  },
  {
    icon: BookOpen,
    color: "oklch(0.62 0.18 47)",
    bg: "oklch(0.97 0.05 47)",
    title: "Tool Walkthroughs",
    desc: "Step-by-step interactive guided tours of software workflows — CRM pipelines, support systems, onboarding flows — with spotlight overlays.",
    tag: "Like Whatfix",
  },
  {
    icon: BarChart3,
    color: "oklch(0.45 0.14 160)",
    bg: "oklch(0.96 0.06 160)",
    title: "Performance Analytics",
    desc: "Track your scores across 5 dimensions — clarity, empathy, persuasiveness, objection handling, and professionalism — with trend charts.",
    tag: "Real-time Feedback",
  },
];

const STATS = [
  { value: "89", label: "Active Learners" },
  { value: "1,247", label: "Sessions Completed" },
  { value: "82%", label: "Avg QA Score" },
  { value: "35+", label: "Languages Supported" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Choose a scenario", desc: "Pick from 24+ real-world scenarios across sales, support, interviews, and negotiations." },
  { step: "02", title: "Practice with AI", desc: "Engage in a realistic conversation with an AI persona. Get real-time coaching hints as you type." },
  { step: "03", title: "Review your score", desc: "See a detailed breakdown of your performance across 5 dimensions with actionable feedback." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.51 0.23 264)" }}
            >
              <Zap size={15} color="white" />
            </div>
            <span className="font-bold text-sm text-foreground tracking-tight">Agent Forge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "oklch(0.51 0.23 264)" }}
                >
                  Go to Dashboard <ArrowRight size={14} />
                </button>
              </Link>
            ) : (
              <a
                href={getLoginUrl()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                Sign in
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero-gradient pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "oklch(0.95 0.05 264)",
              color: "oklch(0.38 0.18 264)",
              border: "1px solid oklch(0.88 0.08 264)",
            }}
          >
            <Zap size={11} />
            AI-Powered Practice Simulation Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Practice like it's{" "}
            <span style={{ color: "oklch(0.51 0.23 264)" }}>real.</span>
            <br />
            Perform like it's{" "}
            <span style={{ color: "oklch(0.51 0.23 264)" }}>second nature.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Agent Forge combines AI conversation simulation (like Solidroad) and interactive tool walkthroughs (like Whatfix) in one platform — built for support teams, sales reps, and L&D professionals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/simulate">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                    style={{ background: "oklch(0.51 0.23 264)" }}
                  >
                    <Play size={15} />
                    Start a Simulation
                  </button>
                </Link>
                <Link href="/walkthroughs">
                  <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-foreground bg-white border border-border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <BookOpen size={15} />
                    Browse Walkthroughs
                  </button>
                </Link>
              </>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  style={{ background: "oklch(0.51 0.23 264)" }}
                >
                  <Play size={15} />
                  Get started free
                </a>
                <a
                  href="#features"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-foreground bg-white border border-border shadow-sm transition-all hover:shadow-md"
                >
                  See how it works <ArrowRight size={14} />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="bg-white rounded-2xl border border-border shadow-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border overflow-hidden">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-5 px-4">
                <span className="text-3xl font-extrabold text-foreground tracking-tight">{s.value}</span>
                <span className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.51 0.23 264)" }}>
              Platform Capabilities
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Everything you need to train at scale
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Two simulation modes, one platform. Replace multiple commercial tools with a single AI-powered training environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-lift bg-white rounded-2xl border border-border p-6"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg }}
                >
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <div
                  className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3"
                  style={{ background: f.bg, color: f.color }}
                >
                  {f.tag}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Feature detail: Solidroad-style simulation preview */}
          <div className="mt-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.51 0.23 264)" }}>
                Conversation Simulation
              </p>
              <h3 className="text-2xl font-extrabold text-foreground mb-4 leading-tight">
                Practice real conversations with AI personas
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Each simulation features a fully-defined AI persona with a backstory, emotional state, and realistic objections. Get scored on every message across 5 dimensions.
              </p>
              <ul className="space-y-2.5">
                {["Real-time coaching hints as you type", "Per-message scoring across 5 dimensions", "Session recording and replay", "24+ scenarios across sales, support, interviews"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} style={{ color: "oklch(0.45 0.14 160)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Link href="/simulate">
                  <button
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "oklch(0.51 0.23 264)" }}
                  >
                    Try a simulation <ArrowRight size={14} />
                  </button>
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "oklch(0.51 0.23 264)" }}
                >
                  Try a simulation <ArrowRight size={14} />
                </a>
              )}
            </div>

            {/* Mini simulation preview card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">Simulation — Customer Support</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">J</div>
                  <div className="chat-bubble-ai text-xs">
                    Hi, I've been waiting 3 days for my refund and nobody has responded to my emails. This is really frustrating!
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="chat-bubble-user text-xs">
                    I completely understand your frustration, and I sincerely apologize for the delay. Let me look into your case right now and get this resolved for you today.
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">Y</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">J</div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl" style={{ background: "oklch(0.96 0.008 264)" }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-border" style={{ background: "oklch(0.97 0.005 264)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">Message Score</span>
                  <span className="text-xs font-bold" style={{ color: "oklch(0.45 0.14 160)" }}>92/100</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "92%", background: "oklch(0.51 0.23 264)" }} />
                </div>
                <div className="flex gap-3 mt-2">
                  {["Empathy", "Clarity", "Resolution"].map((d) => (
                    <span key={d} className="text-[10px] text-muted-foreground">{d} ✓</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature detail: Whatfix-style walkthrough preview */}
          <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
            {/* Mini walkthrough preview */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden order-2 md:order-1">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs text-muted-foreground font-medium">CRM Walkthrough — Step 3 of 8</span>
              </div>
              <div className="relative p-4">
                {/* Simulated app UI */}
                <div className="bg-gray-50 rounded-xl border border-border p-4 opacity-40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-20 h-3 bg-gray-300 rounded" />
                    <div className="w-12 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-8 bg-gray-200 rounded" />
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div
                      className="h-8 w-24 rounded flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: "oklch(0.72 0.19 47)", border: "2px solid oklch(0.51 0.23 264)", boxShadow: "0 0 0 3px oklch(0.51 0.23 264 / 0.2)" }}
                    >
                      + New Lead
                    </div>
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                </div>

                {/* Tooltip card */}
                <div className="walkthrough-tooltip" style={{ position: "relative", marginTop: 12, inset: "auto" }}>
                  <div className="walkthrough-tooltip-accent" />
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "oklch(0.51 0.23 264)" }}>
                    Step 3 of 8
                  </div>
                  <div className="text-sm font-bold text-foreground mb-1">Add a New Lead</div>
                  <div className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Click the <strong>+ New Lead</strong> button to open the lead creation form. Fill in the contact details and assign to a pipeline stage.
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className={`step-dot ${i === 3 ? "active" : i < 3 ? "done" : ""}`} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs text-muted-foreground px-3 py-1.5 rounded-lg border border-border hover:bg-gray-50 transition-colors">Back</button>
                      <button
                        className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                        style={{ background: "oklch(0.51 0.23 264)" }}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.62 0.18 47)" }}>
                Tool Walkthroughs
              </p>
              <h3 className="text-2xl font-extrabold text-foreground mb-4 leading-tight">
                Interactive guided tours for any workflow
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Spotlight-style step-by-step walkthroughs guide users through software processes with contextual tooltips, progress indicators, and completion tracking.
              </p>
              <ul className="space-y-2.5">
                {["Spotlight overlay with highlighted target elements", "Step counter and dot progress indicator", "Back/Next navigation with keyboard support", "Completion tracking and progress saved"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={15} style={{ color: "oklch(0.45 0.14 160)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              {isAuthenticated ? (
                <Link href="/walkthroughs">
                  <button
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "oklch(0.62 0.18 47)" }}
                  >
                    Browse walkthroughs <ArrowRight size={14} />
                  </button>
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "oklch(0.62 0.18 47)" }}
                >
                  Browse walkthroughs <ArrowRight size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 px-6" style={{ background: "oklch(0.985 0.002 264)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "oklch(0.51 0.23 264)" }}>
              How It Works
            </p>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              From zero to confident in 3 steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-white rounded-2xl border border-border p-6">
                <div
                  className="text-4xl font-black mb-4"
                  style={{ color: "oklch(0.91 0.012 264)" }}
                >
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "oklch(0.51 0.23 264)" }}
          >
            <Zap size={24} color="white" />
          </div>
          <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">
            Ready to start practising?
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Join 89 active learners already using Agent Forge to sharpen their communication skills and master software workflows.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                Go to Dashboard <ArrowRight size={15} />
              </button>
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "oklch(0.51 0.23 264)" }}
            >
              Get started — it's free <ArrowRight size={15} />
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "oklch(0.51 0.23 264)" }}>
              <Zap size={11} color="white" />
            </div>
            <span className="text-sm font-bold text-foreground">Agent Forge</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI-powered practice simulation — Communication + Tool Walkthroughs
          </p>
        </div>
      </footer>
    </div>
  );
}
