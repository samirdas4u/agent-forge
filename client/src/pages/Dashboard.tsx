import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowRight, BarChart3, BookOpen, Clock, MessageSquare, Play, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import AppLayout from "@/components/AppLayout";

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Excellent</span>;
  if (score >= 70) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">Good</span>;
  if (score >= 50) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Fair</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">Poor</span>;
}

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales", customer_service: "Customer Service", interview: "Interview",
  negotiation: "Negotiation", presentation: "Presentation",
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analytics, isLoading: analyticsLoading } = trpc.analytics.dashboard.useQuery();
  const { data: sessions, isLoading: sessionsLoading } = trpc.sessions.list.useQuery();
  const { data: walkthroughCompletions } = trpc.walkthroughs.myCompletions.useQuery();
  const { data: scenarios } = trpc.scenarios.list.useQuery({});

  const completedWalkthroughs = walkthroughCompletions?.filter((w: any) => w.completion?.isCompleted).length ?? 0;
  const recentSessions = sessions?.slice(0, 5) ?? [];
  const totalMinutes = sessions
    ? Math.round((sessions.reduce((sum: number, s: any) => sum + (s.session.durationSeconds ?? 0), 0)) / 60)
    : 0;

  const kpis = [
    {
      label: "Sessions Completed",
      value: analyticsLoading ? "—" : (analytics?.totalSessions ?? 0),
      icon: MessageSquare,
      color: "oklch(0.51 0.23 264)",
      bg: "oklch(0.95 0.05 264)",
      delta: "All time",
    },
    {
      label: "Avg QA Score",
      value: analyticsLoading ? "—" : (analytics?.totalSessions ? Math.round(analytics.avgScore) : "—"),
      icon: BarChart3,
      color: "oklch(0.45 0.14 160)",
      bg: "oklch(0.96 0.06 160)",
      delta: "Out of 100",
    },
    {
      label: "Practice Time",
      value: totalMinutes,
      icon: Clock,
      color: "oklch(0.62 0.18 47)",
      bg: "oklch(0.97 0.05 47)",
      delta: "Minutes total",
    },
    {
      label: "Walkthroughs Done",
      value: completedWalkthroughs,
      icon: BookOpen,
      color: "oklch(0.55 0.18 300)",
      bg: "oklch(0.96 0.04 300)",
      delta: "Completed",
    },
  ];

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="bg-white border-b border-border px-6 py-5 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                {user?.name?.split(" ")[0] || "there"} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Here's your practice overview.</p>
            </div>
            <Link href="/simulate">
              <button
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                <Play size={14} /> Start Practice
              </button>
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-border p-5 card-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                    <kpi.icon size={16} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-foreground tracking-tight mb-0.5">{kpi.value}</div>
                <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                <div className="mt-1.5 text-xs font-medium" style={{ color: kpi.color }}>{kpi.delta}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent sessions */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-foreground">Recent Sessions</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your latest practice sessions</p>
                </div>
                <Link href="/analytics">
                  <button className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: "oklch(0.51 0.23 264)" }}>
                    View all <ArrowRight size={12} />
                  </button>
                </Link>
              </div>

              {sessionsLoading ? (
                <div className="p-5 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "oklch(0.95 0.05 264)" }}>
                    <MessageSquare size={20} style={{ color: "oklch(0.51 0.23 264)" }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">No sessions yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Start your first simulation to see results here.</p>
                  <Link href="/simulate">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "oklch(0.51 0.23 264)" }}>
                      <Play size={12} /> Start now
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentSessions.map((row: any) => (
                    <Link key={row.session.id} href={`/session/${row.session.id}/result`}>
                      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.95 0.05 264)" }}>
                          <MessageSquare size={15} style={{ color: "oklch(0.51 0.23 264)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{row.scenarioTitle ?? "Practice Session"}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize" style={{ background: "oklch(0.95 0.05 264)", color: "oklch(0.51 0.23 264)" }}>
                              {(row.scenarioCategory ?? "general").replace("_", " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(row.session.startedAt), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {row.session.overallScore != null ? (
                            <>
                              <span className="text-lg font-extrabold text-foreground">{row.session.overallScore}</span>
                              <ScoreBadge score={row.session.overallScore} />
                            </>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">In progress</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Quick start */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-bold text-foreground">Quick Start</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Jump into a scenario</p>
                </div>
                <div className="divide-y divide-border">
                  {scenarios?.slice(0, 3).map((scenario: any) => (
                    <Link key={scenario.id} href={`/simulate/${scenario.id}`}>
                      <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.95 0.05 264)" }}>
                          <MessageSquare size={12} style={{ color: "oklch(0.51 0.23 264)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{scenario.title}</div>
                          <div className="text-[10px] text-muted-foreground capitalize">{scenario.difficulty}</div>
                        </div>
                        <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))}
                  {(!scenarios || scenarios.length === 0) && (
                    <div className="px-5 py-4 text-xs text-muted-foreground text-center">Loading scenarios...</div>
                  )}
                </div>
              </div>

              {/* Walkthrough CTA */}
              <div className="rounded-2xl p-4 border" style={{ background: "oklch(0.97 0.05 47 / 0.5)", borderColor: "oklch(0.9 0.06 47)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} style={{ color: "oklch(0.62 0.18 47)" }} />
                  <span className="text-xs font-bold text-foreground">Tool Walkthroughs</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                  Learn software workflows with interactive guided tours.
                </p>
                <Link href="/walkthroughs">
                  <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "oklch(0.62 0.18 47)" }}>
                    Browse Walkthroughs <ArrowRight size={11} />
                  </button>
                </Link>
              </div>

              {/* Category breakdown */}
              {analytics && Object.keys(analytics.categoryBreakdown ?? {}).length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={14} style={{ color: "oklch(0.51 0.23 264)" }} />
                    <h2 className="text-sm font-bold text-foreground">By Category</h2>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(analytics.categoryBreakdown).map(([cat, data]: [string, any]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-foreground">{CATEGORY_LABELS[cat] ?? cat}</span>
                          <span className="text-muted-foreground font-semibold">{Math.round(data.avgScore)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${data.avgScore}%`, background: "oklch(0.51 0.23 264)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress banner */}
          {analytics && analytics.totalSessions > 0 && (
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "oklch(0.95 0.05 264)", border: "1px solid oklch(0.88 0.08 264)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.51 0.23 264)" }}>
                <Zap size={18} color="white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  Your average score is{" "}
                  <span style={{ color: "oklch(0.51 0.23 264)" }}>{Math.round(analytics.avgScore)}/100</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Keep practising daily to improve your scores.</p>
              </div>
              <Link href="/analytics">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white shrink-0 transition-opacity hover:opacity-90" style={{ background: "oklch(0.51 0.23 264)" }}>
                  View Analytics <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
