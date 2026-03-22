import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, ChevronRight, Cpu, Eye, Lightbulb, MousePointer, Navigation, Type, XCircle } from "lucide-react";
import { toast } from "sonner";
type WalkthroughStep = {
  id: number;
  title: string;
  description: string;
  instruction: string;
  hint?: string;
  imageUrl?: string;
  action?: "click" | "type" | "observe" | "navigate";
};

interface Props { walkthroughId: number; }

const ACTION_ICONS: Record<string, React.ComponentType<any>> = {
  click: MousePointer,
  type: Type,
  observe: Eye,
  navigate: Navigation,
};

const ACTION_LABELS: Record<string, string> = {
  click: "Click Action",
  type: "Type Input",
  observe: "Observe",
  navigate: "Navigate",
};

export default function WalkthroughPlayer({ walkthroughId }: Props) {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [completionId, setCompletionId] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const { data: walkthrough, isLoading } = trpc.walkthroughs.get.useQuery({ id: walkthroughId });

  const startProgress = trpc.walkthroughs.startOrGetProgress.useMutation({
    onSuccess: (data) => {
      setCompletionId(data.id);
      const existing = (data.completedSteps as number[]) ?? [];
      setCompletedSteps(existing);
      if (data.isCompleted) setIsFinished(true);
    },
  });

  const updateProgress = trpc.walkthroughs.updateProgress.useMutation();

  useEffect(() => {
    startProgress.mutate({ walkthroughId });
  }, [walkthroughId]);

  if (isLoading || startProgress.isPending) {
    return (
      <div className="h-full flex items-center justify-center blueprint-bg">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 animate-pulse" style={{ color: "var(--cyan)" }} />
          <span className="mono text-sm text-muted-foreground">Loading walkthrough...</span>
        </div>
      </div>
    );
  }

  if (!walkthrough) return <div className="p-8 text-muted-foreground">Walkthrough not found.</div>;

  const steps = walkthrough.steps as WalkthroughStep[];
  const step = steps[currentStep];
  const totalSteps = steps.length;
  const progress = Math.round(((currentStep) / totalSteps) * 100);
  const isStepCompleted = completedSteps.includes(step?.id ?? -1);

  const markStepComplete = () => {
    if (!step || !completionId) return;
    const newCompleted = completedSteps.includes(step.id) ? completedSteps : [...completedSteps, step.id];
    setCompletedSteps(newCompleted);
    const isLast = currentStep === totalSteps - 1;
    updateProgress.mutate({
      completionId,
      completedSteps: newCompleted,
      isCompleted: isLast && newCompleted.length === totalSteps,
    });
    if (isLast) {
      setIsFinished(true);
    } else {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    }
  };

  if (isFinished) {
    return (
      <div className="h-full flex items-center justify-center blueprint-bg">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full mx-4 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--cyan)" + "20" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "var(--cyan)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Walkthrough Complete!</h2>
          <p className="text-muted-foreground text-sm mb-2">{walkthrough.title}</p>
          <p className="text-muted-foreground text-sm mb-6">
            You completed all {totalSteps} steps. Great work mastering this workflow!
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/walkthroughs")}
              className="flex-1 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Back to Library
            </button>
            <button
              onClick={() => { setCurrentStep(0); setCompletedSteps([]); setIsFinished(false); }}
              className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              Redo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ActionIcon = step?.action ? ACTION_ICONS[step.action] ?? Eye : Eye;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border flex-shrink-0">
        <button
          onClick={() => navigate("/walkthroughs")}
          className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{walkthrough.title}</div>
          <div className="mono text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "var(--cyan)" }}
              />
            </div>
            <span className="mono text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Step list sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r border-border bg-white overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-border">
            <div className="mono text-xs text-muted-foreground uppercase tracking-widest">Steps</div>
          </div>
          <div className="p-2 space-y-1">
            {steps.map((s, idx) => {
              const done = completedSteps.includes(s.id);
              const active = idx === currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => { setCurrentStep(idx); setShowHint(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all ${
                    active ? "bg-muted font-medium" : "hover:bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      done ? "text-white" : active ? "border-2 border-foreground text-foreground" : "border border-border text-muted-foreground"
                    }`}
                    style={done ? { background: "var(--cyan)" } : {}}
                  >
                    {done ? "✓" : idx + 1}
                  </div>
                  <span className="text-xs truncate">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto blueprint-bg">
          <div className="max-w-2xl mx-auto p-6 md:p-8">
            {step && (
              <>
                {/* Step header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--cyan)" }}>
                      {currentStep + 1}
                    </div>
                    {step.action && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-white text-xs font-medium">
                        <ActionIcon className="w-3 h-3" />
                        {ACTION_LABELS[step.action]}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{step.title}</h2>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {/* Instruction card */}
                <div className="bg-white rounded-xl border border-border p-6 mb-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "var(--cyan)" + "20" }}>
                      <Cpu className="w-4 h-4" style={{ color: "var(--cyan)" }} />
                    </div>
                    <div>
                      <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Instruction</div>
                      <p className="text-sm leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                </div>

                {/* Hint */}
                {step.hint && (
                  <div className="mb-4">
                    {!showHint ? (
                      <button
                        onClick={() => setShowHint(true)}
                        className="flex items-center gap-2 text-xs font-medium hover:underline"
                        style={{ color: "var(--pink)" }}
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        Show hint
                      </button>
                    ) : (
                      <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">{step.hint}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Simulated UI area */}
                <div className="bg-white rounded-xl border-2 border-dashed border-border p-8 mb-6 text-center">
                  <div className="mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Simulated Interface</div>
                  <div className="w-full h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ActionIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {step.action === "click" && "Click the indicated element in the real tool"}
                        {step.action === "type" && "Type the specified text in the real tool"}
                        {step.action === "observe" && "Observe and understand the current state"}
                        {step.action === "navigate" && "Navigate to the specified location"}
                        {!step.action && "Follow the instruction above"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setCurrentStep(Math.max(0, currentStep - 1)); setShowHint(false); }}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-sm font-medium hover:bg-muted disabled:opacity-40 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <button
                    onClick={markStepComplete}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}
                  >
                    {isStepCompleted ? (
                      <>
                        <ChevronRight className="w-4 h-4" />
                        {currentStep === totalSteps - 1 ? "Finish" : "Next Step"}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {currentStep === totalSteps - 1 ? "Complete Walkthrough" : "Mark Done & Continue"}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
