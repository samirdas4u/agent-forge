import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const CATEGORIES = ["all", "CRM", "Support", "HR", "Marketing"];

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  CRM:       { bg: "oklch(0.95 0.04 240)", color: "oklch(0.4 0.18 240)" },
  Support:   { bg: "oklch(0.95 0.05 300)", color: "oklch(0.4 0.18 300)" },
  HR:        { bg: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" },
  Marketing: { bg: "oklch(0.97 0.04 350)", color: "oklch(0.45 0.14 350)" },
};

const DIFF_STYLES: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" },
  intermediate: { bg: "oklch(0.97 0.06 80)",  color: "oklch(0.45 0.14 60)" },
  advanced:     { bg: "oklch(0.97 0.04 25)",  color: "oklch(0.5 0.18 25)" },
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

  const completionMap = new Map(completions?.map((c: any) => [c.completion.walkthroughId, c.completion]));
  const completedCount = completions?.filter((c: any) => c.completion.isCompleted).length ?? 0;
  const inProgressCount = completions?.filter((c: any) => !c.completion.isCompleted && (c.completion.completedSteps as number[])?.length > 0).length ?? 0;

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Page header */}
        <div className="bg-white border-b border-border px-6 py-5 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Tool Walkthroughs</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Master software workflows through interactive step-by-step guided tours.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Stats row */}
          {completions && completions.length > 0 && (
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" }}>
                <CheckCircle2 size={13} />
                {completedCount} completed
              </div>
              {inProgressCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "oklch(0.97 0.06 80)", color: "oklch(0.45 0.14 60)" }}>
                  <Sparkles size={13} />
                  {inProgressCount} in progress
                </div>
              )}
            </div>
          )}

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-2 text-xs font-semibold rounded-lg border transition-all"
                style={category === cat ? {
                  background: "oklch(0.62 0.18 47)",
                  color: "white",
                  borderColor: "oklch(0.62 0.18 47)",
                } : {
                  background: "white",
                  color: "oklch(0.52 0.03 264)",
                  borderColor: "oklch(0.91 0.012 264)",
                }}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!isLoading && (
            <p className="text-xs text-muted-foreground mb-4 font-medium">
              {walkthroughs?.length ?? 0} walkthrough{walkthroughs?.length !== 1 ? "s" : ""} available
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-56 bg-white rounded-2xl border border-border animate-pulse" />)}
            </div>
          ) : !walkthroughs?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.97 0.06 47 / 0.5)" }}>
                <BookOpen size={22} style={{ color: "oklch(0.62 0.18 47)" }} />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No walkthroughs found</p>
              <p className="text-xs text-muted-foreground">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {walkthroughs.map((wt: any) => {
                const completion = completionMap.get(wt.id);
                const completedSteps = (completion?.completedSteps as number[] | null) ?? [];
                const totalSteps = (wt.steps as any[]).length;
                const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
                const isCompleted = completion?.isCompleted ?? false;
                const inProgress = !isCompleted && completedSteps.length > 0;
                const catStyle = CATEGORY_STYLES[wt.category] ?? { bg: "oklch(0.97 0.06 47 / 0.5)", color: "oklch(0.62 0.18 47)" };
                const diffStyle = DIFF_STYLES[wt.difficulty] ?? { bg: "oklch(0.97 0.06 80)", color: "oklch(0.45 0.14 60)" };

                return (
                  <div key={wt.id} className="bg-white rounded-2xl border border-border overflow-hidden card-lift flex flex-col">
                    {/* Completed banner */}
                    {isCompleted && (
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold" style={{ background: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" }}>
                        <CheckCircle2 size={12} />
                        Completed
                      </div>
                    )}
                    {inProgress && !isCompleted && (
                      <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold" style={{ background: "oklch(0.97 0.06 80)", color: "oklch(0.45 0.14 60)" }}>
                        <Sparkles size={12} />
                        In Progress — {progress}%
                      </div>
                    )}

                    <div className="px-5 pt-5 pb-4 flex-1 flex flex-col">
                      {/* Tags row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {wt.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: catStyle.bg, color: catStyle.color }}>
                              {wt.category}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide" style={{ background: diffStyle.bg, color: diffStyle.color }}>
                            {wt.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock size={11} />
                          <span>{wt.estimatedMinutes}m</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-foreground mb-1.5 leading-snug">{wt.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{wt.description}</p>

                      {/* Steps count */}
                      <div className="flex items-center gap-1.5 mb-3">
                        <BookOpen size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{totalSteps} steps</span>
                      </div>

                      {/* Progress bar (in progress) */}
                      {inProgress && (
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-muted-foreground">{completedSteps.length} of {totalSteps} done</span>
                            <span className="font-bold" style={{ color: "oklch(0.62 0.18 47)" }}>{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "oklch(0.62 0.18 47)" }} />
                          </div>
                        </div>
                      )}

                      <div className="mt-auto">
                        <button
                          onClick={() => startWalkthrough.mutate({ walkthroughId: wt.id })}
                          disabled={startWalkthrough.isPending}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={isCompleted
                            ? { background: "oklch(0.97 0.005 264)", color: "oklch(0.52 0.03 264)", border: "1px solid oklch(0.91 0.012 264)" }
                            : { background: "oklch(0.62 0.18 47)", color: "white" }
                          }
                        >
                          {isCompleted ? (
                            <><ArrowRight size={12} /> Redo Walkthrough</>
                          ) : inProgress ? (
                            <><Play size={12} /> Continue</>
                          ) : (
                            <><Play size={12} /> Start Walkthrough</>
                          )}
                        </button>
                      </div>
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
