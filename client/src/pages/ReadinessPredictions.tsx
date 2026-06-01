import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AppLayout from "@/components/AppLayout";
import { Gauge, Sparkles, AlertTriangle, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Engineering Footer ───────────────────────────────────────────────────────
const ENG_METRICS = [
  { label: "Lines of Code",   value: "21,766" },
  { label: "Automated Tests", value: "92" },
  { label: "Components",      value: "74" },
  { label: "DB Tables",       value: "8" },
  { label: "API Endpoints",   value: "46" },
  { label: "QA Criteria",     value: "50" },
  { label: "Scenarios",       value: "16" },
  { label: "tRPC Routers",    value: "7" },
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

// ─── Readiness colour helper ──────────────────────────────────────────────────
function readinessColor(label: string) {
  if (label === "Production Ready") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (label === "Nearly Ready")     return "text-blue-600 bg-blue-50 border-blue-200";
  if (label === "Developing")       return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function readinessBarColor(label: string) {
  if (label === "Production Ready") return "bg-emerald-500";
  if (label === "Nearly Ready")     return "bg-blue-500";
  if (label === "Developing")       return "bg-amber-500";
  return "bg-red-500";
}

// ─── Prediction Result Card ───────────────────────────────────────────────────
interface PredictionResult {
  readinessScore: number;
  readinessLabel: string;
  estimatedDaysToReady: number;
  riskFactors: string[];
  interventions: string[];
  summary: string;
  avgScore: number;
  sessions: number;
  generatedAt: number;
}

function PredictionCard({ prediction }: { prediction: PredictionResult }) {
  const colorClass = readinessColor(prediction.readinessLabel);
  const barColor = readinessBarColor(prediction.readinessLabel);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Score ring area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        <div className="flex flex-col items-center gap-2">
          <div className={cn("w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center", colorClass)}>
            <span className="text-2xl font-bold">{prediction.readinessScore}</span>
            <span className="text-[10px] font-medium">/ 100</span>
          </div>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", colorClass)}>
            {prediction.readinessLabel}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 mb-3">{prediction.summary}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5">Avg Score</p>
              <p className="font-bold text-gray-800">{prediction.avgScore}/100</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5">Sessions</p>
              <p className="font-bold text-gray-800">{prediction.sessions}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5">
              <p className="text-gray-400 mb-0.5">Days to Ready</p>
              <p className="font-bold text-gray-800">
                {prediction.estimatedDaysToReady === 0 ? "Ready now" : `~${prediction.estimatedDaysToReady}d`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
          <span>Readiness Progress</span>
          <span>{prediction.readinessScore}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", barColor)}
            style={{ width: `${prediction.readinessScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Risk Factors */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs font-semibold text-gray-700">Risk Factors</p>
          </div>
          <ul className="space-y-1.5">
            {prediction.riskFactors.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Interventions */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-xs font-semibold text-gray-700">Recommended Actions</p>
          </div>
          <ul className="space-y-1.5">
            {prediction.interventions.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 mt-4">
        Generated {new Date(prediction.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadinessPredictions() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [predError, setPredError] = useState<string | null>(null);

  const { data: myReadiness } = trpc.agentic.myReadiness.useQuery();
  const { data: teamReadinessRaw } = trpc.agentic.teamReadiness.useQuery(undefined, { retry: false });
  const teamReadiness = (teamReadinessRaw as Array<{
    userId: number; userName: string; avgScore: number; sessions: number; readinessLabel: string;
  }> | undefined) ?? [];

  const predictMutation = trpc.agentic.predictReadiness.useMutation({
    onSuccess: (data) => {
      setPrediction(data as PredictionResult);
      setPredError(null);
    },
    onError: (err) => {
      setPredError(err.message);
    },
  });

  const hasEnoughData = myReadiness && "ready" in myReadiness && myReadiness.ready;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Readiness Predictions</h1>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider border border-emerald-200">
              AI Powered
            </span>
          </div>

          {/* Predictive Readiness Engine Banner */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900">Predictive Readiness Engine</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-xl">
                The Evaluation Agent analyses your training history, QA scores, and learning velocity to predict
                when you will be production-ready. It identifies risk factors and recommends interventions.
              </p>
            </div>
            <button
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending || !hasEnoughData}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0",
                hasEnoughData
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {predictMutation.isPending ? "Analysing…" : "Predict My Readiness"}
            </button>
          </div>

          {/* Error */}
          {predError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-sm text-red-700">
              {predError}
            </div>
          )}

          {/* Prediction Result or Empty State */}
          {prediction ? (
            <PredictionCard prediction={prediction} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center mb-4">
              <Gauge className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-semibold text-gray-700">No Prediction Yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                {hasEnoughData
                  ? 'Click "Predict My Readiness" to get your AI assessment.'
                  : `Complete at least 2 training sessions, then click "Predict My Readiness" to get your AI assessment.`}
              </p>
              {myReadiness && !hasEnoughData && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  {(myReadiness as { sessions: number }).sessions} / 2 sessions completed
                </div>
              )}
            </div>
          )}

          {/* Team Readiness Overview */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Team Readiness Overview</p>
            </div>

            {teamReadiness.length === 0 ? (
              <p className="text-sm text-gray-400">No predictions generated yet.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Learner</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Sessions</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Avg Score</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamReadiness.map((member) => (
                        <tr key={member.userId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">{member.userName}</td>
                          <td className="px-4 py-3 text-gray-500">{member.sessions}</td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">{member.avgScore}/100</td>
                          <td className="px-4 py-3">
                            <span className={cn("px-2 py-0.5 rounded-full font-semibold border text-[10px]", readinessColor(member.readinessLabel))}>
                              {member.readinessLabel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <EngineeringFooter />
        </div>
      </div>
    </AppLayout>
  );
}
