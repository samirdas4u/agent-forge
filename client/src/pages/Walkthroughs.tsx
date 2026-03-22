import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, CheckCircle, Clock, Play } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["all", "CRM", "Support", "HR", "Marketing"];

const CATEGORY_COLORS: Record<string, string> = {
  CRM: "bg-blue-50 text-blue-700 border-blue-200",
  Support: "bg-purple-50 text-purple-700 border-purple-200",
  HR: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Marketing: "bg-pink-50 text-pink-700 border-pink-200",
};

export default function Walkthroughs() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState("all");

  const { data: walkthroughs, isLoading } = trpc.walkthroughs.list.useQuery(
    { category: category !== "all" ? category : undefined },
    { staleTime: 60_000 }
  );
  const { data: completions } = trpc.walkthroughs.myCompletions.useQuery();

  const startWalkthrough = trpc.walkthroughs.startOrGetProgress.useMutation({
    onSuccess: (_, variables) => navigate(`/walkthroughs/${variables.walkthroughId}`),
    onError: () => toast.error("Failed to start walkthrough."),
  });

  const completionMap = new Map(completions?.map((c) => [c.completion.walkthroughId, c.completion]));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="mono text-xs text-muted-foreground mb-1 uppercase tracking-widest">// walkthrough_library</div>
        <h1 className="text-2xl font-bold">Tool Walkthroughs</h1>
        <p className="text-muted-foreground text-sm mt-1">Master software workflows through interactive step-by-step guided tours.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
              category === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-white border-border hover:bg-muted"
            }`}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-white rounded-lg border border-border animate-pulse" />
          ))}
        </div>
      ) : !walkthroughs?.length ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No walkthroughs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walkthroughs.map((wt) => {
            const completion = completionMap.get(wt.id);
            const completedSteps = (completion?.completedSteps as number[] | null) ?? [];
            const totalSteps = (wt.steps as any[]).length;
            const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
            const isCompleted = completion?.isCompleted ?? false;

            return (
              <div key={wt.id} className="bg-white rounded-lg border border-border p-5 hover:shadow-md hover:border-foreground/20 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    {wt.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${CATEGORY_COLORS[wt.category] ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {wt.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${wt.difficulty}`}>
                      {wt.difficulty.charAt(0).toUpperCase() + wt.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    <span className="mono">{wt.estimatedMinutes}m</span>
                  </div>
                </div>

                <h3 className="font-bold text-base mb-2">{wt.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">{wt.description}</p>

                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="mono text-xs text-muted-foreground">{totalSteps} steps</span>
                  {isCompleted && (
                    <div className="flex items-center gap-1 ml-auto">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">Completed</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {!isCompleted && completion && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="mono font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, background: "var(--cyan)" }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => startWalkthrough.mutate({ walkthroughId: wt.id })}
                  disabled={startWalkthrough.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: isCompleted ? "var(--muted)" : "var(--foreground)", color: isCompleted ? "var(--muted-foreground)" : "var(--background)" }}
                >
                  <Play className="w-4 h-4" />
                  {isCompleted ? "Redo Walkthrough" : completion ? "Continue" : "Start Walkthrough"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
