import { trpc } from "@/lib/trpc";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line, ReferenceLine
} from "recharts";
import { BarChart3, BookOpen, MessageSquare, Play, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import AppLayout from "@/components/AppLayout";

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales", customer_service: "Customer Svc", interview: "Interview",
  negotiation: "Negotiation", presentation: "Presentation",
};

const SCORE_DIMENSIONS = [
  { key: "clarityScore", label: "Clarity" },
  { key: "empathyScore", label: "Empathy" },
  { key: "persuasivenessScore", label: "Persuasiveness" },
  { key: "objectionHandlingScore", label: "Obj. Handling" },
  { key: "professionalismScore", label: "Professionalism" },
] as const;

const INDIGO = "oklch(0.51 0.23 264)";
const ORANGE = "oklch(0.62 0.18 47)";
const GREEN  = "oklch(0.45 0.14 160)";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-lg text-xs">
      <div className="font-bold text-foreground mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.analytics.dashboard.useQuery();
  const { data: sessions } = trpc.sessions.list.useQuery();

  const completedSessions = sessions?.filter((s: any) => s.session.status === "completed") ?? [];

  const radarData = SCORE_DIMENSIONS.map(({ key, label }) => {
    const avg = completedSessions.length > 0
      ? completedSessions.reduce((sum: number, s: any) => sum + ((s.session as any)[key] ?? 0), 0) / completedSessions.length
      : 0;
    return { dimension: label, score: Math.round(avg), fullMark: 100 };
  });

  const trendData = completedSessions
    .slice(0, 12)
    .reverse()
    .map((s: any, idx: number) => ({
      session: `#${idx + 1}`,
      score: Math.round(s.session.overallScore ?? 0),
      date: format(new Date(s.session.startedAt), "MMM d"),
    }));

  const categoryData = Object.entries(analytics?.categoryBreakdown ?? {}).map(([cat, data]: [string, any]) => ({
    category: CATEGORY_LABELS[cat] ?? cat,
    avgScore: Math.round(data.avgScore),
    sessions: data.count,
  }));

  const avgScore = analytics?.totalSessions
    ? Math.round(analytics.avgScore)
    : 0;

  const hasData = completedSessions.length > 0;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 sm:px-6 py-4 sm:py-5 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold text-foreground">Performance Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Detailed breakdown of your practice performance over time.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.05 264)" }}>
                <BarChart3 size={22} style={{ color: INDIGO }} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No data yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">Complete practice sessions to see your analytics here.</p>
              <Link href="/simulate">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: INDIGO }}>
                  <Play size={14} /> Start Practising
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Sessions Completed", value: analytics?.totalSessions ?? 0, icon: MessageSquare, color: INDIGO, bg: "oklch(0.95 0.05 264)" },
                  { label: "Average Score", value: `${avgScore}/100`, icon: BarChart3, color: GREEN, bg: "oklch(0.96 0.06 160)" },
                  { label: "Best Score", value: completedSessions.length > 0 ? Math.max(...completedSessions.map((s: any) => s.session.overallScore ?? 0)) : "—", icon: TrendingUp, color: ORANGE, bg: "oklch(0.97 0.05 47)" },
                  { label: "Categories Practiced", value: Object.keys(analytics?.categoryBreakdown ?? {}).length, icon: BookOpen, color: "oklch(0.55 0.18 300)", bg: "oklch(0.96 0.04 300)" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white rounded-2xl border border-border p-5 card-lift">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: kpi.bg }}>
                      <kpi.icon size={16} style={{ color: kpi.color }} />
                    </div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight mb-0.5">{kpi.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{kpi.label}</div>
                  </div>
                ))}
              </div>

              {/* Score trend + Radar */}
              <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Score trend */}
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-foreground">Score Trend</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Overall score across your last {trendData.length} sessions</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.005 264)" />
                      <XAxis dataKey="session" tick={{ fontSize: 10, fill: "oklch(0.52 0.03 264)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.52 0.03 264)" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={70} stroke="oklch(0.88 0.005 264)" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Score"
                        stroke={INDIGO}
                        strokeWidth={2.5}
                        dot={{ fill: INDIGO, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: INDIGO }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar chart */}
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-foreground">Skill Radar</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Average score across all 5 dimensions</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                      <PolarGrid stroke="oklch(0.93 0.005 264)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "oklch(0.52 0.03 264)" }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke={INDIGO}
                        fill={INDIGO}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category breakdown */}
              {categoryData.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-foreground">Performance by Category</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Average score per practice category</p>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.005 264)" />
                      <XAxis dataKey="category" tick={{ fontSize: 10, fill: "oklch(0.52 0.03 264)" }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "oklch(0.52 0.03 264)" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avgScore" name="Avg Score" fill={INDIGO} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Dimension breakdown table */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="text-sm font-bold text-foreground">Dimension Averages</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Your average score in each evaluation dimension</p>
                </div>
                <div className="divide-y divide-border">
                  {SCORE_DIMENSIONS.map(({ key, label }) => {
                    const avg = completedSessions.length > 0
                      ? Math.round(completedSessions.reduce((sum: number, s: any) => sum + ((s.session as any)[key] ?? 0), 0) / completedSessions.length)
                      : 0;
                    const color = avg >= 80 ? GREEN : avg >= 60 ? ORANGE : "oklch(0.58 0.22 27)";
                    return (
                      <div key={key} className="flex items-center gap-2 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5">
                        <div className="w-24 sm:w-32 text-xs font-semibold text-foreground shrink-0">{label}</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${avg}%`, background: color }} />
                        </div>
                        <div className="w-8 sm:w-10 text-right text-sm font-extrabold shrink-0" style={{ color }}>{avg}</div>
                        <div
                          className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            background: avg >= 80 ? "oklch(0.96 0.06 160)" : avg >= 60 ? "oklch(0.97 0.06 80)" : "oklch(0.97 0.04 25)",
                            color: avg >= 80 ? "oklch(0.38 0.12 160)" : avg >= 60 ? "oklch(0.45 0.14 60)" : "oklch(0.5 0.18 25)",
                          }}
                        >
                          {avg >= 80 ? "Strong" : avg >= 60 ? "Good" : avg >= 40 ? "Fair" : "Weak"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent sessions table */}
              <div className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Session History</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">All completed practice sessions</p>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {completedSessions.slice(0, 10).map((row: any) => (
                    <Link key={row.session.id} href={`/session/${row.session.id}/result`}>
                      <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.95 0.05 264)" }}>
                          <MessageSquare size={14} style={{ color: INDIGO }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">{row.scenarioTitle ?? "Practice Session"}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize" style={{ background: "oklch(0.95 0.05 264)", color: INDIGO }}>
                              {(row.scenarioCategory ?? "general").replace("_", " ")}
                            </span>
                            <span className="text-xs text-muted-foreground">{format(new Date(row.session.startedAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xl font-extrabold text-foreground">{row.session.overallScore ?? "—"}</div>
                          <div className="text-[10px] text-muted-foreground">/ 100</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
