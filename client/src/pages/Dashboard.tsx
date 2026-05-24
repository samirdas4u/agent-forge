import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, BarChart3, BookOpen, Brain, Clock, Flame, MessageSquare, Play, Star, Target, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "oklch(0.42 0.20 162)" : score >= 60 ? "oklch(0.52 0.26 272)" : "oklch(0.72 0.18 75)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="oklch(0.91 0.012 260)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: sessions, isLoading: sessionsLoading } = trpc.sessions.list.useQuery();
  const { data: walkthroughCompletions } = trpc.walkthroughs.myCompletions.useQuery();
  const { data: scenarios } = trpc.scenarios.list.useQuery({});

  const completedWalkthroughs = walkthroughCompletions?.filter((w: any) => w.completion?.isCompleted).length ?? 0;
  const recentSessions = sessions?.slice(0, 5) ?? [];
  const streakDays = (user as any)?.streakDays ?? 0;
  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    {
      label: "Sessions Completed",
      value: analyticsLoading ? "—" : (analytics?.totalSessions ?? 0),
      icon: MessageSquare,
      color: "oklch(0.52 0.26 272)",
      bg: "oklch(0.52 0.26 272 / 0.08)",
      topBar: "linear-gradient(90deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))",
      delta: "All time",
    },
    {
      label: "Average Score",
      value: analyticsLoading ? "—" : (analytics?.totalSessions ? `${Math.round(analytics.avgScore)}%` : "—"),
      icon: Star,
      color: "oklch(0.72 0.18 75)",
      bg: "oklch(0.72 0.18 75 / 0.08)",
      topBar: "linear-gradient(90deg, oklch(0.72 0.18 75), oklch(0.82 0.16 75))",
      delta: "Out of 100",
    },
    {
      label: "Practice Streak",
      value: `${streakDays}d`,
      icon: Flame,
      color: "oklch(0.62 0.20 27)",
      bg: "oklch(0.62 0.20 27 / 0.08)",
      topBar: "linear-gradient(90deg, oklch(0.62 0.20 27), oklch(0.72 0.18 47))",
      delta: streakDays > 0 ? "🔥 Keep going!" : "Start today",
    },
    {
      label: "Walkthroughs Done",
      value: completedWalkthroughs,
      icon: BookOpen,
      color: "oklch(0.42 0.20 162)",
      bg: "oklch(0.42 0.20 162 / 0.08)",
      topBar: "linear-gradient(90deg, oklch(0.42 0.20 162), oklch(0.62 0.18 162))",
      delta: "Completed",
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              {greeting}, {firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics?.totalSessions
                ? `You've completed ${analytics.totalSessions} sessions. Keep the momentum going!`
                : "Welcome to Agent Forge. Start your first practice session below."}
            </p>
          </div>
          <Link
            href="/simulate"
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", boxShadow: "0 4px 16px oklch(0.52 0.26 272 / 0.3)" }}
          >
            <Zap size={15} /> New Session
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white border border-border rounded-2xl p-5 relative overflow-hidden"
              style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: kpi.topBar }} />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: kpi.bg }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <div className="text-2xl font-black text-foreground mb-0.5">{kpi.value}</div>
              <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
              <div className="text-[11px] mt-1.5 font-semibold" style={{ color: kpi.color }}>{kpi.delta}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Recent Sessions */}
          <div className="lg:col-span-2 bg-white border border-border rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock size={15} style={{ color: "oklch(0.52 0.26 272)" }} />
                <h2 className="font-bold text-sm text-foreground">Recent Sessions</h2>
              </div>
              <Link
                href="/analytics"
                className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "oklch(0.52 0.26 272)" }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {sessionsLoading ? (
              <div className="p-5 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl shimmer" />)}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.52 0.26 272 / 0.08)" }}>
                  <Brain size={24} style={{ color: "oklch(0.52 0.26 272)" }} />
                </div>
                <p className="font-semibold text-foreground mb-1">No sessions yet</p>
                <p className="text-sm text-muted-foreground mb-5">Start your first simulation to see results here.</p>
                <Link
                  href="/simulate"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
                >
                  <Play size={14} /> Start a session
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentSessions.map((row: any) => {
                  const score = row.session?.overallScore ?? null;
                  const scoreColor = score == null ? null : score >= 80 ? "oklch(0.42 0.20 162)" : score >= 60 ? "oklch(0.52 0.26 272)" : "oklch(0.72 0.18 75)";
                  const scoreBg = score == null ? null : score >= 80 ? "oklch(0.95 0.07 162)" : score >= 60 ? "oklch(0.95 0.06 272)" : "oklch(0.97 0.06 80)";
                  const scoreLabel = score == null ? "In progress" : score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Fair";
                  return (
                    <Link
                      key={row.session.id}
                      href={`/session/${row.session.id}/result`}
                      className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <ScoreRing score={score ?? 0} size={40} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-black text-foreground">{score ?? "—"}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{row.scenarioTitle ?? "Practice Session"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {row.session?.messageCount ?? 0} exchanges · {format(new Date(row.session.startedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: scoreBg ?? "oklch(0.97 0.006 260)", color: scoreColor ?? "oklch(0.52 0.025 260)" }}
                        >
                          {scoreLabel}
                        </span>
                        <ArrowRight size={13} className="text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Target size={14} style={{ color: "oklch(0.52 0.26 272)" }} />
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2.5">
                <Link
                  href="/simulate"
                  className="flex items-center gap-3 p-3.5 rounded-xl text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", boxShadow: "0 4px 16px oklch(0.52 0.26 272 / 0.25)" }}
                >
                  <MessageSquare size={16} />
                  <div>
                    <p className="text-sm font-bold">Start Simulation</p>
                    <p className="text-[11px] opacity-80">Practice a conversation</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto opacity-70" />
                </Link>
                <Link
                  href="/walkthroughs"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.42 0.20 162 / 0.1)" }}>
                    <BookOpen size={15} style={{ color: "oklch(0.42 0.20 162)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tool Walkthrough</p>
                    <p className="text-[11px] text-muted-foreground">Learn a workflow</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-muted-foreground" />
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.52 0.18 75 / 0.1)" }}>
                    <BarChart3 size={15} style={{ color: "oklch(0.52 0.18 75)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">View Analytics</p>
                    <p className="text-[11px] text-muted-foreground">Track your progress</p>
                  </div>
                  <ArrowRight size={14} className="ml-auto text-muted-foreground" />
                </Link>
              </div>
            </div>

            {/* Suggested scenarios */}
            {scenarios && scenarios.length > 0 && (
              <div className="bg-white border border-border rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}>
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <TrendingUp size={14} style={{ color: "oklch(0.42 0.20 162)" }} />
                    Suggested Scenarios
                  </h2>
                </div>
                <div className="p-3 space-y-1">
                  {scenarios.slice(0, 3).map((sc: any) => (
                    <Link
                      key={sc.id}
                      href={`/simulate/${sc.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.52 0.26 272 / 0.08)" }}>
                        <MessageSquare size={13} style={{ color: "oklch(0.52 0.26 272)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{sc.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{sc.difficulty}</p>
                      </div>
                      <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
