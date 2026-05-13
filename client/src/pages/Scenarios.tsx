import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Clock, MessageSquare, Play, Search, Users } from "lucide-react";
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

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  sales:            { bg: "oklch(0.95 0.04 240)", color: "oklch(0.4 0.18 240)" },
  customer_service: { bg: "oklch(0.95 0.05 300)", color: "oklch(0.4 0.18 300)" },
  interview:        { bg: "oklch(0.95 0.05 200)", color: "oklch(0.4 0.15 200)" },
  negotiation:      { bg: "oklch(0.97 0.06 80)",  color: "oklch(0.45 0.14 60)" },
  presentation:     { bg: "oklch(0.97 0.04 350)", color: "oklch(0.45 0.14 350)" },
};

const DIFF_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" },
  intermediate: { bg: "oklch(0.97 0.06 80)",  color: "oklch(0.45 0.14 60)" },
  advanced:     { bg: "oklch(0.97 0.04 25)",  color: "oklch(0.5 0.18 25)" },
};

export default function Scenarios() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const { data: scenarios, isLoading } = trpc.scenarios.list.useQuery(
    { category: category !== "all" ? category : undefined, difficulty: difficulty !== "all" ? difficulty : undefined },
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
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-border px-6 py-5 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold text-foreground">Conversation Simulations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Choose a scenario and practise with a realistic AI persona. Get scored in real time.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              {/* Category filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border transition-all"
                    style={category === c ? {
                      background: "oklch(0.51 0.23 264)",
                      color: "white",
                      borderColor: "oklch(0.51 0.23 264)",
                    } : {
                      background: "white",
                      color: "oklch(0.52 0.03 264)",
                      borderColor: "oklch(0.91 0.012 264)",
                    }}
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{DIFF_LABELS[d]}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mb-4 font-medium">
              {filtered.length} scenario{filtered.length !== 1 ? "s" : ""} available
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-56 bg-white rounded-2xl border border-border animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.05 264)" }}>
                <MessageSquare size={22} style={{ color: "oklch(0.51 0.23 264)" }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No scenarios found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((scenario) => {
                const catStyle = CATEGORY_COLORS[scenario.category] ?? { bg: "oklch(0.95 0.05 264)", color: "oklch(0.51 0.23 264)" };
                const diffStyle = DIFF_COLORS[scenario.difficulty] ?? { bg: "oklch(0.95 0.05 264)", color: "oklch(0.51 0.23 264)" };
                return (
                  <div
                    key={scenario.id}
                    className="bg-white rounded-2xl border border-border overflow-hidden card-lift flex flex-col"
                  >
                    {/* Card header */}
                    <div className="px-5 pt-5 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                            style={{ background: catStyle.bg, color: catStyle.color }}
                          >
                            {CATEGORY_LABELS[scenario.category]}
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide"
                            style={{ background: diffStyle.bg, color: diffStyle.color }}
                          >
                            {scenario.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock size={11} />
                          <span>{scenario.estimatedMinutes}m</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-foreground mb-1.5 leading-snug">{scenario.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{scenario.description}</p>
                    </div>

                    {/* Persona card */}
                    {scenario.aiPersona && (
                      <div className="mx-5 mb-4 flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "oklch(0.97 0.005 264)" }}>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                        >
                          {scenario.aiPersona[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground font-medium">AI Persona</div>
                          <div className="text-xs font-semibold text-foreground truncate">{scenario.aiPersona}</div>
                        </div>
                        <Users size={13} className="text-muted-foreground shrink-0 ml-auto" />
                      </div>
                    )}

                    {/* Tags */}
                    {(scenario.tags as string[])?.length > 0 && (
                      <div className="flex flex-wrap gap-1 px-5 mb-4">
                        {(scenario.tags as string[]).slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-50 text-muted-foreground border border-border">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="px-5 pb-5 mt-auto">
                      <button
                        onClick={() => createSession.mutate({ scenarioId: scenario.id })}
                        disabled={createSession.isPending}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                      >
                        <Play size={14} />
                        {createSession.isPending ? "Starting..." : "Start Practice"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
