import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line } from "recharts";
import { BarChart3, BookOpen, CheckCircle, MessageSquare, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales", customer_service: "Customer Svc", interview: "Interview",
  negotiation: "Negotiation", presentation: "Presentation",
};

const SCORE_DIMENSIONS = [
  { key: "clarityScore", label: "Clarity" },
  { key: "empathyScore", label: "Empathy" },
  { key: "persuasivenessScore", label: "Persuasiveness" },
  { key: "objectionHandlingScore", label: "Objection Handling" },
  { key: "professionalismScore", label: "Professionalism" },
] as const;

export default function Analytics() {
  const { data: analytics, isLoading } = trpc.analytics.dashboard.useQuery();
  const { data: sessions } = trpc.sessions.list.useQuery();

  const completedSessions = sessions?.filter((s) => s.session.status === "completed") ?? [];

  // Build radar chart data from avg dimension scores
  const radarData = SCORE_DIMENSIONS.map(({ key, label }) => {
    const avg = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + ((s.session as any)[key] ?? 0), 0) / completedSessions.length
      : 0;
    return { dimension: label, score: Math.round(avg) };
  });

  // Build trend data (last 10 sessions)
  const trendData = completedSessions
    .slice(0, 10)
    .reverse()
    .map((s, idx) => ({
      session: `S${idx + 1}`,
      score: Math.round(s.session.overallScore ?? 0),
      date: format(new Date(s.session.startedAt), "MMM d"),
    }));

  // Category bar chart
  const categoryData = Object.entries(analytics?.categoryBreakdown ?? {}).map(([cat, data]) => ({
    category: CATEGORY_LABELS[cat] ?? cat,
    avgScore: Math.round(data.avgScore),
    sessions: data.count,
  }));

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 animate-pulse" style={{ color: "var(--cyan)" }} />
          <span className="mono text-sm text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  const hasData = completedSessions.length > 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">// performance_analytics</div>
        <h1 className="text-2xl font-bold">Performance Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Detailed breakdown of your practice performance over time.</p>
      </div>

      {!hasData ? (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Data Yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Complete practice sessions to see your analytics here.</p>
          <Link href="/scenarios">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold cursor-pointer transition-all hover:opacity-90" style={{ background: "var(--foreground)", color: "var(--background)" }}>
              Start Practicing
            </span>
          </Link>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Sessions", value: analytics?.totalSessions ?? 0, icon: MessageSquare, color: "var(--cyan)" },
              { label: "Average Score", value: analytics?.totalSessions ? `${Math.round(analytics.avgScore)}/100` : "—", icon: TrendingUp, color: "var(--pink)" },
              { label: "Best Category", value: Object.entries(analytics?.categoryBreakdown ?? {}).sort((a, b) => b[1].avgScore - a[1].avgScore)[0]?.[0] ? CATEGORY_LABELS[Object.entries(analytics!.categoryBreakdown).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][0]] ?? "—" : "—", icon: CheckCircle, color: "var(--cyan)" },
              { label: "Sessions This Week", value: completedSessions.filter((s) => new Date(s.session.startedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: BarChart3, color: "var(--pink)" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-lg border border-border p-4">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center mb-3" style={{ background: stat.color + "15" }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-bold mono">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Score trend */}
            {trendData.length > 1 && (
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Score Trend</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="session" tick={{ fontSize: 11, fontFamily: "Space Mono" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "Space Mono" }} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, fontFamily: "Space Mono", border: "1px solid #e5e7eb" }}
                      formatter={(val: number) => [`${val}/100`, "Score"]}
                    />
                    <Line
                      type="monotone" dataKey="score" stroke="var(--cyan)"
                      strokeWidth={2} dot={{ fill: "var(--cyan)", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Radar chart */}
            <div className="bg-white rounded-xl border border-border p-5">
              <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Skill Dimensions</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fontFamily: "Space Mono" }} />
                  <Radar
                    name="Score" dataKey="score" stroke="var(--cyan)"
                    fill="var(--cyan)" fillOpacity={0.15} strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12, fontFamily: "Space Mono", border: "1px solid #e5e7eb" }}
                    formatter={(val: number) => [`${val}/100`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-5 mb-6">
              <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Performance by Category</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fontFamily: "Space Mono" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: "Space Mono" }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, fontFamily: "Space Mono", border: "1px solid #e5e7eb" }}
                    formatter={(val: number, name: string) => [name === "avgScore" ? `${val}/100` : val, name === "avgScore" ? "Avg Score" : "Sessions"]}
                  />
                  <Bar dataKey="avgScore" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Dimension breakdown table */}
          <div className="bg-white rounded-xl border border-border p-5 mb-6">
            <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Dimension Averages</div>
            <div className="space-y-3">
              {radarData.map((d) => (
                <div key={d.dimension} className="flex items-center gap-4">
                  <span className="text-sm w-40 flex-shrink-0">{d.dimension}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.score}%`,
                        background: d.score >= 80 ? "#22c55e" : d.score >= 60 ? "#f59e0b" : "#ef4444",
                      }}
                    />
                  </div>
                  <span className="mono text-sm font-bold w-12 text-right">{d.score}/100</span>
                  <span className="text-xs text-muted-foreground w-20">
                    {d.score >= 80 ? "Excellent" : d.score >= 60 ? "Good" : d.score >= 40 ? "Fair" : "Needs Work"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions table */}
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Recent Sessions</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs mono">Scenario</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs mono">Category</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground text-xs mono">Date</th>
                    <th className="text-right py-2 font-medium text-muted-foreground text-xs mono">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {completedSessions.slice(0, 8).map((row) => (
                    <tr key={row.session.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium truncate max-w-[200px]">{row.scenarioTitle ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full cat-${row.scenarioCategory}`}>
                          {CATEGORY_LABELS[row.scenarioCategory ?? ""] ?? row.scenarioCategory}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 mono text-xs text-muted-foreground">
                        {format(new Date(row.session.startedAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className="mono font-bold text-sm"
                          style={{
                            color: (row.session.overallScore ?? 0) >= 80 ? "#22c55e"
                              : (row.session.overallScore ?? 0) >= 60 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {row.session.overallScore != null ? Math.round(row.session.overallScore) : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
