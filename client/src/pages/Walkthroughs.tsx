import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Play, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

const CATEGORIES = ["all", "CRM", "Support", "HR", "Marketing"];

const CATEGORY_STYLES: Record<string, { color: string; bg: string; gradient: string }> = {
  CRM:       { color: "oklch(0.52 0.26 272)", bg: "oklch(0.52 0.26 272 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" },
  Support:   { color: "oklch(0.42 0.20 162)", bg: "oklch(0.42 0.20 162 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.42 0.20 162), oklch(0.62 0.18 162))" },
  HR:        { color: "oklch(0.62 0.22 300)", bg: "oklch(0.62 0.22 300 / 0.08)", gradient: "linear-gradient(135deg, oklch(0.62 0.22 300), oklch(0.72 0.20 320))" },
  Marketing: { color: "oklch(0.58 0.22 27)",  bg: "oklch(0.58 0.22 27 / 0.08)",  gradient: "linear-gradient(135deg, oklch(0.58 0.22 27), oklch(0.72 0.18 47))" },
};

const DIFF_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  beginner:     { label: "Beginner",     bg: "oklch(0.95 0.07 162)", color: "oklch(0.35 0.14 162)" },
  intermediate: { label: "Intermediate", bg: "oklch(0.97 0.07 80)",  color: "oklch(0.42 0.16 70)"  },
  advanced:     { label: "Advanced",     bg: "oklch(0.97 0.05 27)",  color: "oklch(0.48 0.20 27)"  },
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
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">Tool Walkthroughs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Master software workflows through interactive step-by-step guided tours.
            </p>
          </div>
          {/* Progress summary */}
          {completions && completions.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.95 0.07 162)", color: "oklch(0.35 0.14 162)" }}>
                <CheckCircle2 size={12} /> {completedCount} done
              </div>
              {inProgressCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.97 0.07 80)", color: "oklch(0.42 0.16 70)" }}>
                  <Sparkles size={12} /> {inProgressCount} in progress
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={category === cat
                ? { background: "linear-gradient(135deg, oklch(0.58 0.22 27), oklch(0.72 0.18 47))", color: "white", boxShadow: "0 2px 8px oklch(0.58 0.22 27 / 0.3)" }
                : { background: "white", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
              }
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>

        {!isLoading && (
          <p className="text-xs text-muted-foreground font-medium">
            {walkthroughs?.length ?? 0} walkthrough{walkthroughs?.length !== 1 ? "s" : ""} available
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="bg-white border border-border rounded-2xl h-64 shimmer" />)}
          </div>
        ) : !walkthroughs?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.58 0.22 27 / 0.08)" }}>
              <BookOpen size={28} style={{ color: "oklch(0.58 0.22 27)" }} />
            </div>
            <p className="font-bold text-foreground mb-2">No walkthroughs found</p>
            <p className="text-sm text-muted-foreground">Try selecting a different category.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {walkthroughs.map((wt: any) => {
              const completion = completionMap.get(wt.id);
              const completedSteps = (completion?.completedSteps as number[] | null) ?? [];
              const totalSteps = (wt.steps as any[]).length;
              const progress = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
              const isCompleted = completion?.isCompleted ?? false;
              const inProgress = !isCompleted && completedSteps.length > 0;
              const catStyle = CATEGORY_STYLES[wt.category] ?? CATEGORY_STYLES.CRM;
              const diffStyle = DIFF_STYLES[wt.difficulty] ?? DIFF_STYLES.beginner;

              return (
                <div
                  key={wt.id}
                  className="group bg-white border border-border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  style={{ boxShadow: "0 1px 4px oklch(0 0 0 / 0.04)" }}
                >
                  {/* Top accent */}
                  <div className="h-1 w-full" style={{ background: catStyle.gradient }} />

                  {/* Status banner */}
                  {isCompleted && (
                    <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold" style={{ background: "oklch(0.95 0.07 162)", color: "oklch(0.35 0.14 162)" }}>
                      <CheckCircle2 size={12} /> Completed
                    </div>
                  )}
                  {inProgress && !isCompleted && (
                    <div className="flex items-center justify-between px-5 py-2 text-xs font-semibold" style={{ background: "oklch(0.97 0.07 80)", color: "oklch(0.42 0.16 70)" }}>
                      <span className="flex items-center gap-1.5"><Sparkles size={12} /> In Progress</span>
                      <span className="font-black">{progress}%</span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon + badges */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: catStyle.bg }}>
                        <BookOpen size={20} style={{ color: catStyle.color }} />
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: diffStyle.bg, color: diffStyle.color }}>
                          {diffStyle.label}
                        </span>
                        {wt.category && (
                          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: catStyle.bg, color: catStyle.color }}>
                            {wt.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-foreground mb-2 leading-snug">{wt.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-1">{wt.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Clock size={11} /> {wt.estimatedMinutes}m</span>
                      <span className="flex items-center gap-1"><Target size={11} /> {totalSteps} steps</span>
                    </div>

                    {/* Progress bar */}
                    {inProgress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] mb-1.5">
                          <span className="text-muted-foreground">{completedSteps.length} of {totalSteps} completed</span>
                          <span className="font-bold" style={{ color: catStyle.color }}>{progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "oklch(0.91 0.012 260)" }}>
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: catStyle.gradient }} />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => startWalkthrough.mutate({ walkthroughId: wt.id })}
                      disabled={startWalkthrough.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:shadow-md disabled:opacity-50"
                      style={isCompleted
                        ? { background: "white", color: catStyle.color, border: `1.5px solid ${catStyle.color}` }
                        : { background: catStyle.gradient, color: "white" }
                      }
                    >
                      {startWalkthrough.isPending ? (
                        <><Zap size={14} className="animate-spin" /> Starting...</>
                      ) : isCompleted ? (
                        <><ArrowRight size={14} /> Redo Walkthrough</>
                      ) : inProgress ? (
                        <><Play size={14} /> Continue</>
                      ) : (
                        <><Play size={14} /> Start Walkthrough</>
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
