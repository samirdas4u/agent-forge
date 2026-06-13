import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import {
  Bot, Cpu, Gauge, Lightbulb, Layers, Activity, AlertTriangle,
  BookOpen, TrendingUp, BarChart2, Sparkles, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── Engineering Footer ───────────────────────────────────────────────────────
const ENG_METRICS = [
  { icon: "code",    label: "Lines of Code",     value: "21,766" },
  { icon: "pencil",  label: "Automated Tests",   value: "92" },
  { icon: "layers",  label: "Components",        value: "74" },
  { icon: "db",      label: "DB Tables",         value: "8" },
  { icon: "api",     label: "API Endpoints",     value: "46" },
  { icon: "shield",  label: "QA Criteria",       value: "50" },
  { icon: "book",    label: "Scenarios",         value: "16" },
  { icon: "router",  label: "tRPC Routers",      value: "7" },
];

function EngineeringFooter() {
  return (
    <div className="mt-12 border-t border-gray-200 pt-6 pb-4">
      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
        <span className="font-mono">&lt;/&gt;</span> Engineering
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
        {ENG_METRICS.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-gray-900">{m.value}</span>
            <span className="text-xs text-gray-500">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
        <span>Agent Forge — For internal training purposes only · Zero license cost</span>
        <span>
          For anything, feel free to reach out to{" "}
          <a href="mailto:das.samir4u@gmail.com" className="text-blue-600 hover:underline font-medium">
            Samir Das (das.samir4u@gmail.com)
          </a>
        </span>
      </div>
    </div>
  );
}

// ─── Agent Status Dot ─────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  return (
    <span className={cn(
      "w-2 h-2 rounded-full flex-shrink-0",
      status === "active" ? "bg-green-400" : status === "error" ? "bg-red-400" : "bg-gray-300"
    )} />
  );
}

// ─── Agent Icon Map ───────────────────────────────────────────────────────────
const AGENT_ICONS: Record<string, React.ElementType> = {
  simulation: Bot,
  coaching: Lightbulb,
  evaluation: Gauge,
  planning: Layers,
  orchestrator: Cpu,
};
const AGENT_COLORS: Record<string, string> = {
  simulation: "text-violet-500 bg-violet-50",
  coaching: "text-amber-500 bg-amber-50",
  evaluation: "text-emerald-500 bg-emerald-50",
  planning: "text-blue-500 bg-blue-50",
  orchestrator: "text-rose-500 bg-rose-50",
};

type WindowOption = "24h" | "7d" | "30d" | "all";

export default function AgenticDashboard() {
  const [eventWindow, setEventWindow] = useState<WindowOption>("7d");

  const { data: agentHealth = [], isLoading: loadingHealth } = trpc.agentic.agentHealth.useQuery();
  const { data: metrics, isLoading: loadingMetrics } = trpc.agentic.activityMetrics.useQuery();
  const { data: events = [], isLoading: loadingEvents } = trpc.agentic.agentEvents.useQuery({ window: eventWindow });
  const { data: learningPaths = [] } = trpc.agentic.learningPaths.useQuery();
  const { data: coaching } = trpc.agentic.coachingEffectiveness.useQuery();
  const { data: atRiskRaw } = trpc.agentic.atRiskLearners.useQuery(undefined, {
    retry: false,
  } as Parameters<typeof trpc.agentic.atRiskLearners.useQuery>[1]);
  const atRisk = (atRiskRaw as Array<{ userId: number; userName: string; riskReason: string; lastSessionDaysAgo: number; avgScore: number }> | undefined) ?? [];
  const { data: distribution = [] } = trpc.agentic.eventDistribution.useQuery({ window: eventWindow });

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-600" />
              <h1 className="text-xl font-bold text-gray-900">Agentic Dashboard</h1>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 uppercase tracking-wider border border-violet-200">
              AI Orchestrator
            </span>
          </div>

          {/* Agent System Health */}
          <div className="mb-2">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Agent System Health</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loadingHealth
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-24" />
                  ))
                : agentHealth.map((agent) => {
                    const Icon = AGENT_ICONS[agent.id] ?? Bot;
                    const colorClass = AGENT_COLORS[agent.id] ?? "text-gray-500 bg-gray-50";
                    return (
                      <div key={agent.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colorClass)}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <StatusDot status={agent.status} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">{agent.name}</p>
                          <p className="text-xs text-gray-400">{agent.events24h} events (24h)</p>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3 mb-6">
            {[
              { label: "Events (24h)", value: metrics?.events24h ?? 0, icon: Activity },
              { label: "Learning Paths", value: metrics?.learningPaths ?? 0, icon: BookOpen },
              { label: "Predictions", value: metrics?.predictions ?? 0, icon: TrendingUp },
              { label: "Coaching Nudges", value: metrics?.coachingNudges ?? 0, icon: Lightbulb },
              { label: "Difficulty Adjustments", value: metrics?.difficultyAdjustments ?? 0, icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Agent Activity Log */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-sm font-semibold text-gray-800">Agent Activity Log</h2>
                <div className="flex items-center gap-1">
                  {(["24h", "7d", "30d", "all"] as WindowOption[]).map((w) => (
                    <button
                      key={w}
                      onClick={() => setEventWindow(w)}
                      className={cn(
                        "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                        eventWindow === w
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {loadingEvents ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw className="w-5 h-5 text-gray-300 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Bot className="w-10 h-10 text-gray-200 mb-2" />
                  <p className="text-sm font-medium text-gray-500">No agent events yet</p>
                  <p className="text-xs text-gray-400 mt-1">Events will appear as agents take autonomous actions</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {events.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{ev.description}</p>
                        <p className="text-[10px] text-gray-400">{ev.agentName} · {new Date(ev.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">

              {/* At-Risk Learners */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-gray-800">At-Risk Learners</h2>
                </div>
                {atRisk.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No at-risk learners detected</p>
                ) : (
                  <div className="space-y-2">
                    {atRisk.map((l) => (
                      <div key={l.userId} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-800">{l.userName}</p>
                          <p className="text-[10px] text-gray-400">{l.riskReason}</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {l.avgScore}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Coaching Effectiveness */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-gray-800">Coaching Effectiveness</h2>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Total Nudges", value: coaching?.totalNudges ?? 0 },
                    { label: "Viewed Rate",  value: `${coaching?.viewedRate ?? 0}%` },
                    { label: "Helpful Rate", value: `${coaching?.helpfulRate ?? 0}%`, green: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={cn("font-semibold", row.green ? "text-emerald-600" : "text-gray-800")}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Paths */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-800">Learning Paths</h2>
                </div>
                {learningPaths.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No learning paths active</p>
                ) : (
                  <div className="space-y-2">
                    {learningPaths.map((lp) => (
                      <div key={lp.id} className="rounded-lg border border-gray-100 p-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-medium text-gray-800 leading-snug">{lp.userName}</p>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            active
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-1">{lp.title}</p>
                        <p className="text-[10px] text-gray-400">{lp.scenariosCompleted}/{lp.scenariosTotal} scenarios</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Event Distribution Chart */}
          <div className="mt-4 bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800">Event Distribution</h2>
            </div>
            {distribution.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                No event data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <EngineeringFooter />
        </div>
      </div>
    </AppLayout>
  );
}
