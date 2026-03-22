import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Clock, Filter, MessageSquare, Play, Search } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["all", "sales", "customer_service", "interview", "negotiation", "presentation"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All", sales: "Sales", customer_service: "Customer Service",
  interview: "Interview", negotiation: "Negotiation", presentation: "Presentation",
};

const DIFF_LABELS: Record<string, string> = {
  all: "All Levels", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">// scenario_library</div>
        <h1 className="text-2xl font-bold">Practice Scenarios</h1>
        <p className="text-muted-foreground text-sm mt-1">Choose a scenario to begin your AI-powered practice session.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{DIFF_LABELS[d]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-white rounded-lg border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No scenarios found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((scenario) => (
            <div key={scenario.id} className="bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-foreground/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium cat-${scenario.category}`}>
                    {CATEGORY_LABELS[scenario.category]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${scenario.difficulty}`}>
                    {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="mono">{scenario.estimatedMinutes}m</span>
                </div>
              </div>

              <h3 className="font-bold text-base mb-2 group-hover:text-foreground transition-colors">{scenario.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{scenario.description}</p>

              {scenario.aiPersona && (
                <div className="flex items-center gap-2 mb-4 p-2.5 rounded-md bg-muted/50">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--cyan)", color: "white" }}>
                    {scenario.aiPersona[0]}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">AI Persona: <span className="text-foreground font-medium">{scenario.aiPersona}</span></span>
                </div>
              )}

              {(scenario.tags as string[])?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {(scenario.tags as string[]).map((tag) => (
                    <span key={tag} className="mono text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}

              <button
                onClick={() => createSession.mutate({ scenarioId: scenario.id })}
                disabled={createSession.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--foreground)", color: "var(--background)" }}
              >
                <Play className="w-4 h-4" />
                {createSession.isPending ? "Starting..." : "Start Practice"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
