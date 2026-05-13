import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronRight,
  Info, Lightbulb, List, Monitor, X, Zap
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

interface Props { walkthroughId: number; }

type WalkthroughStep = {
  id: number;
  title: string;
  description: string;
  instruction?: string;
  hint?: string;
  action?: "click" | "type" | "observe" | "navigate" | "action";
  targetElement?: string;
  inputValue?: string;
};

const STEP_ICONS: Record<string, string> = {
  click: "🖱️",
  type: "⌨️",
  navigate: "🔗",
  observe: "👁️",
  action: "⚡",
};

export default function WalkthroughPlayer({ walkthroughId }: Props) {
  const [, navigate] = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showStepList, setShowStepList] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionId, setCompletionId] = useState<number | null>(null);

  const { data: walkthrough, isLoading } = trpc.walkthroughs.get.useQuery({ id: walkthroughId });

  const startProgress = trpc.walkthroughs.startOrGetProgress.useMutation({
    onSuccess: (data: any) => {
      setCompletionId(data.id);
      const existing: number[] = (data.completedSteps as number[]) ?? [];
      setCompletedSteps(new Set(existing));
    },
  });

  const updateProgress = trpc.walkthroughs.updateProgress.useMutation();

  useEffect(() => {
    startProgress.mutate({ walkthroughId });
  }, [walkthroughId]);

  const steps: WalkthroughStep[] = walkthrough
    ? (Array.isArray(walkthrough.steps) ? walkthrough.steps as WalkthroughStep[] : JSON.parse(walkthrough.steps as string))
    : [];

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStepIndex);
    setCompletedSteps(newCompleted);

    const isLast = currentStepIndex === totalSteps - 1;

    if (completionId) {
      updateProgress.mutate({
        completionId,
        completedSteps: Array.from(newCompleted),
        isCompleted: isLast,
      });
    }

    if (isLast) {
      setShowCelebration(true);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };

  const handleJumpTo = (idx: number) => {
    setCurrentStepIndex(idx);
    setShowStepList(false);
  };

  if (isLoading || startProgress.isPending) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.62 0.18 47)" }}>
              <Zap size={15} color="white" className="animate-pulse" />
            </div>
            <span className="text-sm text-muted-foreground font-medium">Loading walkthrough...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!walkthrough || steps.length === 0) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">Walkthrough not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout fullscreen>
      <div className="flex h-full overflow-hidden" style={{ background: "oklch(0.985 0.002 264)" }}>

        {/* ── LEFT PANEL: Step list ── */}
        <div
          className={`${showStepList ? "flex" : "hidden"} lg:flex w-72 xl:w-80 flex-col border-r border-border bg-white shrink-0 overflow-hidden`}
        >
          <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Walkthrough</div>
              <h2 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{walkthrough.title}</h2>
            </div>
            <button className="lg:hidden p-1.5 rounded-lg hover:bg-gray-50" onClick={() => setShowStepList(false)}>
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-medium text-foreground">{completedSteps.size} of {totalSteps} steps</span>
              <span className="font-bold" style={{ color: "oklch(0.62 0.18 47)" }}>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "oklch(0.62 0.18 47)" }} />
            </div>
          </div>

          {/* Step list */}
          <div className="flex-1 overflow-y-auto py-2">
            {steps.map((step, idx) => {
              const isDone = completedSteps.has(idx);
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleJumpTo(idx)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  style={isCurrent ? { background: "oklch(0.97 0.05 47 / 0.5)" } : {}}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={
                      isDone
                        ? { background: "oklch(0.62 0.18 47)", color: "white" }
                        : isCurrent
                        ? { background: "oklch(0.97 0.06 47)", color: "oklch(0.62 0.18 47)", border: "2px solid oklch(0.62 0.18 47)" }
                        : { background: "oklch(0.95 0.005 264)", color: "oklch(0.52 0.03 264)" }
                    }
                  >
                    {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold leading-snug" style={{ color: isCurrent ? "oklch(0.35 0.1 47)" : "oklch(0.25 0.02 264)" }}>
                      {step.title}
                    </div>
                    {step.action && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                        {STEP_ICONS[step.action] ?? "•"} {step.action}
                      </div>
                    )}
                  </div>
                  {isCurrent && <ChevronRight size={12} style={{ color: "oklch(0.62 0.18 47)", flexShrink: 0, marginTop: 4 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CENTER: Main content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
            <button onClick={() => navigate("/walkthroughs")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{walkthrough.title}</div>
              <div className="text-xs text-muted-foreground">Step {currentStepIndex + 1} of {totalSteps}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "oklch(0.97 0.06 47 / 0.5)", color: "oklch(0.45 0.14 47)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.62 0.18 47)" }} />
                {Math.round(progress)}% complete
              </div>
              <button className="lg:hidden p-1.5 rounded-lg border border-border" onClick={() => setShowStepList(true)}>
                <List size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start gap-6">
            {/* Simulated browser window */}
            <div className="w-full max-w-3xl bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border" style={{ background: "oklch(0.97 0.005 264)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-white border border-border rounded-md px-3 py-1 text-xs text-muted-foreground font-mono">
                    {(walkthrough as any).targetUrl || "app.example.com/dashboard"}
                  </div>
                </div>
                <Monitor size={13} className="text-muted-foreground" />
              </div>

              {/* Spotlight area */}
              <div className="relative min-h-56 p-6" style={{ background: "oklch(0.985 0.002 264)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "oklch(0.1 0.02 264 / 0.3)", zIndex: 1 }} />
                <div className="relative z-10 mx-auto" style={{ maxWidth: 480 }}>
                  <div className="bg-white rounded-xl border-2 p-5 shadow-lg" style={{ borderColor: "oklch(0.62 0.18 47)" }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                      {currentStep?.action === "click" ? "Element to click" :
                       currentStep?.action === "type" ? "Input field" :
                       currentStep?.action === "navigate" ? "Navigation element" :
                       "UI Element"}
                    </div>
                    {currentStep?.action === "type" ? (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-foreground">{currentStep?.targetElement || "Text Field"}</div>
                        <div className="w-full px-3 py-2.5 rounded-lg border-2 border-dashed text-xs text-muted-foreground" style={{ borderColor: "oklch(0.62 0.18 47)", background: "oklch(0.97 0.05 47 / 0.3)" }}>
                          {currentStep?.inputValue ? `Type: "${currentStep.inputValue}"` : "Click here and type your input..."}
                        </div>
                      </div>
                    ) : (
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "oklch(0.62 0.18 47)" }}>
                        {STEP_ICONS[currentStep?.action ?? "action"] ?? "⚡"} {currentStep?.targetElement || "Click this element"}
                      </button>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full animate-ping absolute" style={{ background: "oklch(0.62 0.18 47 / 0.4)" }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.62 0.18 47)" }} />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: "oklch(0.45 0.14 47)" }}>Highlighted element</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Whatfix-style tooltip card */}
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border" style={{ background: "oklch(0.97 0.05 47 / 0.3)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base" style={{ background: "oklch(0.62 0.18 47)", color: "white" }}>
                    {STEP_ICONS[currentStep?.action ?? "action"] ?? "⚡"}
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {currentStepIndex + 1} of {totalSteps}</div>
                    <h3 className="text-sm font-bold text-foreground mt-0.5">{currentStep?.title}</h3>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide" style={{ background: "oklch(0.97 0.06 47 / 0.5)", color: "oklch(0.45 0.14 47)" }}>
                    {currentStep?.action ?? "action"}
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">{currentStep?.description}</p>
                  {currentStep?.instruction && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentStep.instruction}</p>
                  )}

                  {currentStep?.targetElement && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "oklch(0.97 0.005 264)" }}>
                      <Info size={13} style={{ color: "oklch(0.51 0.23 264)", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Target Element</div>
                        <code className="text-xs font-mono" style={{ color: "oklch(0.51 0.23 264)" }}>{currentStep.targetElement}</code>
                      </div>
                    </div>
                  )}

                  {currentStep?.hint && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "oklch(0.97 0.05 47 / 0.3)" }}>
                      <Lightbulb size={13} style={{ color: "oklch(0.62 0.18 47)", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Hint</div>
                        <p className="text-xs leading-relaxed" style={{ color: "oklch(0.35 0.1 47)" }}>{currentStep.hint}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
                  <button
                    onClick={handlePrev}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    <ArrowLeft size={12} /> Previous
                  </button>

                  {/* Step dots */}
                  <div className="flex-1 flex items-center justify-center gap-1.5">
                    {steps.slice(0, Math.min(totalSteps, 10)).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleJumpTo(idx)}
                        className="rounded-full transition-all duration-200"
                        style={{
                          width: idx === currentStepIndex ? 20 : 6,
                          height: 6,
                          background: completedSteps.has(idx) || idx === currentStepIndex
                            ? "oklch(0.62 0.18 47)"
                            : "oklch(0.88 0.005 264)",
                        }}
                      />
                    ))}
                    {totalSteps > 10 && <span className="text-[10px] text-muted-foreground">+{totalSteps - 10}</span>}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={updateProgress.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: "oklch(0.62 0.18 47)" }}
                  >
                    {currentStepIndex === totalSteps - 1 ? (
                      <><CheckCircle2 size={12} /> Complete</>
                    ) : (
                      <>Next <ArrowRight size={12} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Walkthrough Complete!</h3>
            <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
              You've completed <strong>{walkthrough.title}</strong>.
            </p>
            <p className="text-xs text-muted-foreground mb-6">All {totalSteps} steps finished.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/walkthroughs")} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors">
                Browse More
              </button>
              <button onClick={() => navigate("/dashboard")} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ background: "oklch(0.62 0.18 47)" }}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
