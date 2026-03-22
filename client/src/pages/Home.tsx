import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { BarChart3, BookOpen, ChevronRight, Cpu, MessageSquare, Play, Star, Zap } from "lucide-react";
import { Link } from "wouter";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Conversation Simulation",
    desc: "Practice sales calls, customer service, and interviews with realistic AI personas that respond dynamically to your approach.",
    color: "var(--cyan)",
  },
  {
    icon: Zap,
    title: "Real-Time Feedback",
    desc: "Receive instant scoring and coaching on clarity, empathy, persuasiveness, and professionalism as you practice.",
    color: "var(--pink)",
  },
  {
    icon: BookOpen,
    title: "Tool Walkthroughs",
    desc: "Master software workflows through interactive step-by-step guided tours of CRM, HR, support, and marketing tools.",
    color: "var(--cyan)",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Track your improvement over time with detailed breakdowns of strengths, areas for growth, and session history.",
    color: "var(--pink)",
  },
];

const SCENARIOS = [
  { label: "Cold Call: SaaS Demo", cat: "Sales", diff: "Beginner" },
  { label: "Angry Customer De-escalation", cat: "Support", diff: "Intermediate" },
  { label: "Technical Job Interview", cat: "Interview", diff: "Intermediate" },
  { label: "Salary Negotiation", cat: "Negotiation", diff: "Advanced" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen blueprint-bg overflow-x-hidden">
      {/* Decorative wireframe shapes */}
      <div className="fixed top-20 right-10 w-64 h-64 wireframe-circle pointer-events-none" />
      <div className="fixed top-40 right-40 w-32 h-32 wireframe-circle pointer-events-none" />
      <div className="fixed bottom-20 left-10 w-48 h-48 wireframe-rect pointer-events-none" />
      <div className="fixed bottom-40 left-60 w-24 h-24 wireframe-circle pointer-events-none" />

      {/* Decorative formula labels */}
      <div className="fixed top-32 left-8 mono text-xs text-muted-foreground opacity-30 pointer-events-none select-none">
        f(x) = σ(Wx + b)
      </div>
      <div className="fixed top-1/2 right-8 mono text-xs text-muted-foreground opacity-30 pointer-events-none select-none rotate-90">
        ∇L = ∂E/∂w
      </div>
      <div className="fixed bottom-32 right-24 mono text-xs text-muted-foreground opacity-30 pointer-events-none select-none">
        P(A|B) = P(B|A)·P(A)/P(B)
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--cyan)" }}>
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">AGENT FORGE</div>
              <div className="mono text-xs text-muted-foreground">AI Practice Engine</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#scenarios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Scenarios</a>
            {!loading && (
              isAuthenticated ? (
                <Link href="/dashboard">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer">
                    <LayoutDashboardIcon />
                    Dashboard
                  </span>
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity"
                >
                  Sign In
                </a>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white/80 mb-6">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--cyan)" }} />
              <span className="mono text-xs text-muted-foreground">AI-Powered Practice Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6 text-foreground">
              Forge Your
              <br />
              <span style={{ color: "var(--cyan)" }}>Professional</span>
              <br />
              Edge
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Practice real-world conversations and software workflows with AI simulation. Get instant feedback, track progress, and build skills that transfer directly to your work.
            </p>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link href="/scenarios">
                  <span className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm cursor-pointer transition-all hover:opacity-90" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    <Play className="w-4 h-4" />
                    Start Practicing
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}
                >
                  <Play className="w-4 h-4" />
                  Get Started Free
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm border border-border bg-white hover:bg-muted transition-colors"
              >
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border">
              {[
                { value: "6+", label: "Scenario Types" },
                { value: "4+", label: "Tool Walkthroughs" },
                { value: "5", label: "Scoring Dimensions" },
                { value: "∞", label: "Practice Sessions" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold mono">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-16 md:py-24 bg-white/60 backdrop-blur-sm border-y border-border">
        <div className="container">
          <div className="mb-12">
            <div className="mono text-xs text-muted-foreground mb-2 uppercase tracking-widest">// capabilities</div>
            <h2 className="text-3xl md:text-4xl font-bold">Built for Serious Practice</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-lg border border-border bg-white hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center mb-4" style={{ background: f.color + "20", border: `1px solid ${f.color}40` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scenarios preview */}
      <section id="scenarios" className="relative z-10 py-16 md:py-24">
        <div className="container">
          <div className="mb-12">
            <div className="mono text-xs text-muted-foreground mb-2 uppercase tracking-widest">// scenario_library</div>
            <h2 className="text-3xl md:text-4xl font-bold">Practice Real Situations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {SCENARIOS.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-white hover:border-foreground/20 transition-colors">
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "var(--muted)" }}>
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-sm">{s.label}</div>
                  <div className="flex gap-2 mt-1">
                    <span className="mono text-xs text-muted-foreground">{s.cat}</span>
                    <span className="mono text-xs text-muted-foreground">·</span>
                    <span className="mono text-xs text-muted-foreground">{s.diff}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link href="/scenarios">
                <span className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline" style={{ color: "var(--cyan)" }}>
                  Browse all scenarios <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ) : (
              <a href={getLoginUrl()} className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: "var(--cyan)" }}>
                Sign in to access all scenarios <ChevronRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 md:py-24 bg-foreground text-background">
        <div className="container text-center">
          <div className="mono text-xs mb-4 uppercase tracking-widest opacity-50">// start_session()</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-background/70 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Join Agent Forge and start building the communication skills and software fluency that set professionals apart.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm cursor-pointer transition-all hover:opacity-90" style={{ background: "var(--cyan)", color: "white" }}>
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          ) : (
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: "var(--cyan)", color: "white" }}
            >
              Start for Free <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 bg-white/60">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: "var(--cyan)" }} />
            <span className="font-bold text-sm">AGENT FORGE</span>
          </div>
          <div className="mono text-xs text-muted-foreground">
            © 2026 Agent Forge · AI Practice Platform
          </div>
        </div>
      </footer>
    </div>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
