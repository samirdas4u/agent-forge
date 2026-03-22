import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BarChart3, BookOpen, Clock, MessageSquare, Play, Star, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

function ScoreRing({ score, size = 60 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
    </svg>
  );
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

  const completedWalkthroughs = walkthroughCompletions?.filter((w) => w.completion.isCompleted).length ?? 0;
  const recentSessions = sessions?.slice(0, 5) ?? [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">// dashboard</div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] ?? "Agent"}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your practice performance overview.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Sessions Completed",
            value: analyticsLoading ? "—" : analytics?.totalSessions ?? 0,
            icon: MessageSquare,
            color: "var(--cyan)",
          },
          {
            label: "Average Score",
            value: analyticsLoading ? "—" : analytics?.totalSessions ? `${Math.round(analytics.avgScore)}` : "—",
            icon: Star,
            color: "var(--pink)",
            suffix: analytics?.totalSessions ? "/100" : "",
          },
          {
            label: "Walkthroughs Done",
            value: completedWalkthroughs,
            icon: BookOpen,
            color: "var(--cyan)",
          },
          {
            label: "Total Practice Time",
            value: sessions
              ? Math.round((sessions.reduce((sum, s) => sum + (s.session.durationSeconds ?? 0), 0)) / 60)
              : 0,
            icon: Clock,
            color: "var(--pink)",
            suffix: " min",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: stat.color + "15" }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold mono">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="md:col-span-2 bg-white rounded-lg border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Recent Sessions</h2>
            <Link href="/scenarios">
              <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-1">
                <Play className="w-3 h-3" /> New Session
              </span>
            </Link>
          </div>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
              <Link href="/scenarios">
                <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium cursor-pointer" style={{ color: "var(--cyan)" }}>
                  <Play className="w-3.5 h-3.5" /> Start your first session
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((row) => (
                <div key={row.session.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {row.session.overallScore != null ? (
                      <ScoreRing score={row.session.overallScore} size={40} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{row.scenarioTitle ?? "Unknown Scenario"}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="mono text-xs text-muted-foreground capitalize">{row.scenarioCategory ?? ""}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="mono text-xs text-muted-foreground">
                        {format(new Date(row.session.startedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.session.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.session.status === "active"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {row.session.status}
                    </span>
                    {row.session.status === "completed" && (
                      <Link href={`/session/${row.session.id}/result`}>
                        <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">Review →</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-lg border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">By Category</h2>
          </div>
          {analyticsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
            </div>
          ) : Object.keys(analytics?.categoryBreakdown ?? {}).length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Complete sessions to see breakdown</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(analytics!.categoryBreakdown).map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="mono text-muted-foreground">{Math.round(data.avgScore)}/100</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${data.avgScore}%`, background: "var(--cyan)" }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{data.count} session{data.count !== 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <Link href="/analytics">
              <span className="text-xs font-medium cursor-pointer hover:underline" style={{ color: "var(--cyan)" }}>
                View full analytics →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/scenarios", icon: Play, label: "Start Simulation", desc: "Practice a conversation scenario", color: "var(--cyan)" },
          { href: "/walkthroughs", icon: BookOpen, label: "Tool Walkthrough", desc: "Learn a software workflow", color: "var(--pink)" },
          { href: "/analytics", icon: BarChart3, label: "View Analytics", desc: "Review your performance data", color: "var(--cyan)" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-border hover:shadow-sm hover:border-foreground/20 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: action.color + "15" }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div>
                  <div className="font-semibold text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.desc}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
