import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Brain, Clock, MessageSquare, Mic, Play, Search, Sparkles, Target, Users, Zap } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const CATEGORIES = ["all", "sales", "customer_service", "interview", "negotiation", "presentation"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Categories", sales: "Sales", customer_service: "Customer Service",
  interview: "Interview", negotiation: "Negotiation", presentation: "Presentation",
};

const DIFF_LABELS: Record<string, string> = {
  all: "All Levels", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
};

const CATEGORY_STYLES: Record<string, { color: string; bg: string; gradient: string }> = {
  sales:            { color: "oklch(0.52 0.26 272)", bg: "oklch(0.52 0.26 272 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" },
  customer_service: { color: "oklch(0.42 0.20 162)", bg: "oklch(0.42 0.20 162 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.42 0.20 162), oklch(0.62 0.18 162))" },
  interview:        { color: "oklch(0.62 0.22 300)", bg: "oklch(0.62 0.22 300 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.62 0.22 300), oklch(0.72 0.20 320))" },
  negotiation:      { color: "oklch(0.52 0.18 75)",  bg: "oklch(0.52 0.18 75 / 0.08)",  gradient: "linear-gradient(135deg, oklch(0.52 0.18 75), oklch(0.72 0.18 75))" },
  presentation:     { color: "oklch(0.58 0.22 27)",  bg: "oklch(0.58 0.22 27 / 0.08)",  gradient: "linear-gradient(135deg, oklch(0.58 0.22 27), oklch(0.72 0.18 47))" },
};

const DIFF_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  beginner:     { label: "Beginner",     bg: "oklch(0.95 0.07 162)", color: "oklch(0.35 0.14 162)" },
  intermediate: { label: "Intermediate", bg: "oklch(0.97 0.07 80)",  color: "oklch(0.42 0.16 70)"  },
  advanced:     { label: "Advanced",     bg: "oklch(0.97 0.05 27)",  color: "oklch(0.48 0.20 27)"  },
};

export default function Scenarios() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const { data: scenarios, isLoading } = trpc.scenarios.list.useQuery(
    { category: category !== "all" ? category : undefined, difficulty: difficulty !== "all" ? difficulty as any : undefined },
    { staleTime: 60_000 }
  );

  const createSession = trpc.sessions.create.useMutation({
    onSuccess: (data) => navigate(`/simulate/${data.sessionId}`),
    onError: () => toast.error("Failed to start session. Please try again."),
  });

  const filtered = scenarios?.filter((s) =>
    search === "" || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Conversation Simulations</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a scenario and practise with a realistic AI persona. Scored in real time.
            </p>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{ background: "oklch(0.52 0.26 272 / 0.06)", borderColor: "oklch(0.52 0.26 272 / 0.2)", color: "oklch(0.48 0.24 272)" }}
          >
            <Sparkles size={12} /> AI-Powered
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "oklch(0.52 0.26 272 / 0.3)" } as React.CSSProperties}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={category === c
                  ? { background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", color: "white", boxShadow: "0 2px 8px oklch(0.52 0.26 272 / 0.3)" }
                  : { background: "white", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
                }
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-border text-foreground focus:outline-none"
            >
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFF_LABELS[d]}</option>)}
            </select>
          </div>
        </div>

        {!isLoading && (
          <p className="text-xs text-muted-foreground font-medium">
            {filtered.length} scenario{filtered.length !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white border border-border rounded-2xl h-64 shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.52 0.26 272 / 0.08)" }}>
              <Brain size={28} style={{ color: "oklch(0.52 0.26 272)" }} />
            </div>
            <p className="font-bold text-foreground mb-2">No scenarios found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((scenario) => {
              const catStyle = CATEGORY_STYLES[scenario.category] ?? CATEGORY_STYLES.sales;
              const diffStyle = DIFF_STYLES[scenario.difficulty] ?? DIFF_STYLES.beginner;
              return (
                <div
                  key={scenario.id}
                  className="group bg-white border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ background: catStyle.gradient }} />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon + badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: catStyle.bg }}>
                        <MessageSquare size={20} style={{ color: catStyle.color }} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: diffStyle.bg, color: diffStyle.color }}
                        >
                          {diffStyle.label}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2.5 py-1 rounded-full capitalize"
                          style={{ background: catStyle.bg, color: catStyle.color }}
                        >
                          {CATEGORY_LABELS[scenario.category]}
                        </span>
                      </div>
                    </div>

                    {/* Title + description */}
                    <h3 className="font-bold text-base text-foreground mb-2 leading-snug">{scenario.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">
                      {scenario.description ?? "Practice this scenario with an AI persona and get real-time feedback."}
                    </p>

                    {/* AI Persona */}
                    {scenario.aiPersona && (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl mb-4" style={{ background: "oklch(0.975 0.003 260)" }}>
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: catStyle.gradient }}
                        >
                          {scenario.aiPersona[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground">AI Persona</div>
                          <div className="text-xs font-semibold text-foreground truncate">{scenario.aiPersona}</div>
                        </div>
                        <Users size={12} className="text-muted-foreground shrink-0 ml-auto" />
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock size={11} /> {scenario.estimatedMinutes}m</span>
                      <span className="flex items-center gap-1"><Mic size={11} /> Voice ready</span>
                      <span className="flex items-center gap-1"><Target size={11} /> 5 dimensions</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => createSession.mutate({ scenarioId: scenario.id })}
                      disabled={createSession.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                      style={{ background: catStyle.gradient }}
                    >
                      {createSession.isPending ? (
                        <><Zap size={14} className="animate-spin" /> Starting...</>
                      ) : (
                        <><Play size={14} /> Start Practice <ArrowRight size={13} className="ml-auto opacity-70" /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
