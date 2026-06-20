import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video, Mic, Clock, Star, ChevronRight, Briefcase, GraduationCap, Stethoscope, Code2, Users } from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  graduate: <GraduationCap className="w-5 h-5" />,
  tech: <Code2 className="w-5 h-5" />,
  healthcare: <Stethoscope className="w-5 h-5" />,
  general: <Briefcase className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  graduate: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  tech: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  healthcare: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  general: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-400",
  advanced: "bg-red-500/10 text-red-400",
};

export default function InterviewPractice() {
  const [, navigate] = useLocation();
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [starting, setStarting] = useState(false);

  const { data: personas, isLoading } = trpc.interview.listPersonas.useQuery();
  const createSession = trpc.interview.createSession.useMutation();

  const filtered = personas?.filter(
    (p) => categoryFilter === "all" || p.category === categoryFilter
  ) ?? [];

  const selectedPersona = personas?.find((p) => p.id === selectedPersonaId);

  const handleStart = async () => {
    if (!selectedPersonaId) return;
    setStarting(true);
    try {
      const session = await createSession.mutateAsync({
        personaId: selectedPersonaId,
        candidateName: candidateName || undefined,
        jobTitle: jobTitle || undefined,
      });
      navigate(
        `/interview/session/${session.conversationId}?url=${encodeURIComponent(session.conversationUrl)}&persona=${selectedPersonaId}&jobTitle=${encodeURIComponent(jobTitle || "")}&candidateName=${encodeURIComponent(candidateName || "")}`
      );
    } catch (e: any) {
      console.error(e);
      toast.error("Could not start the interview. Please try again.");
      setStarting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <Video className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Video Interview Practice</h1>
              <p className="text-sm text-muted-foreground">Practice with a real AI interviewer — face-to-face, just like the real thing</p>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <Video className="w-3 h-3" /> Live video AI avatar
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <Mic className="w-3 h-3" /> Voice conversation
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <Clock className="w-3 h-3" /> 25 min/month free
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              <Star className="w-3 h-3" /> UK-focused scenarios
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Persona selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {["all", "graduate", "tech", "healthcare", "general"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 text-muted-foreground border-border/50 hover:border-border"
                  }`}
                >
                  {cat !== "all" && CATEGORY_ICONS[cat]}
                  {cat === "all" ? "All Roles" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Persona cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className={`text-left p-4 rounded-xl border transition-all space-y-3 ${
                      selectedPersonaId === persona.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border/50 bg-card hover:border-border hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.replicaName}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-foreground leading-tight">{persona.replicaName}</div>
                        <div className="text-xs text-muted-foreground">{persona.role}</div>
                        <div className="text-xs text-muted-foreground">{persona.company}</div>
                      </div>
                      {selectedPersonaId === persona.id && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{persona.description}</p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[persona.category]}`}>
                        {persona.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[persona.difficulty]}`}>
                        {persona.difficulty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Setup panel */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Interview Setup</CardTitle>
                <CardDescription className="text-xs">Personalise your session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Your Name (optional)</label>
                  <Input
                    placeholder="e.g. Alex Johnson"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Role You Are Applying For (optional)</label>
                  <Input
                    placeholder="e.g. Software Engineer at HSBC"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="text-sm h-9"
                  />
                  <p className="text-xs text-muted-foreground">The AI will tailor questions to this role</p>
                </div>

                {selectedPersona ? (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <img src={selectedPersona.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-xs font-semibold">{selectedPersona.replicaName}</div>
                        <div className="text-xs text-muted-foreground">{selectedPersona.role}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedPersona.description}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-dashed border-border/50 text-center">
                    <Users className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Select an interviewer to begin</p>
                  </div>
                )}

                <Button
                  onClick={handleStart}
                  disabled={!selectedPersonaId || starting}
                  className="w-full gap-2"
                  size="sm"
                >
                  {starting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting session...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      Start Video Interview
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Your browser will ask for camera and microphone access.</p>
                  <p className="text-amber-400/80">Free tier: 25 min/month total</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips card */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  "Use headphones to prevent echo",
                  "Sit in a well-lit, quiet room",
                  "Speak clearly and at a natural pace",
                  "Use the STAR method for answers",
                  "Make eye contact with the camera",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
