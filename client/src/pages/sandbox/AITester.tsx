import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  FlaskConical,
  Layers,
  MessageSquare,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  Timer,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DebugResult {
  response: string;
  score: number;
  feedback: string;
  dimensions: Record<string, number>;
  debug: {
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    model: string;
    systemPromptLength: number;
    temperature: number;
  };
  rawPrompt: string;
  rawResponse: string;
}

export default function AITester() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sandboxIdFromUrl = params.get("sandbox") ? parseInt(params.get("sandbox")!) : null;

  const [selectedSandboxId, setSelectedSandboxId] = useState<number | null>(sandboxIdFromUrl);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [testMessage, setTestMessage] = useState("Hi, I'm interested in your product but I'm not sure if it's right for me.");
  const [result, setResult] = useState<DebugResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("response");

  const { data: sandboxes = [] } = trpc.sandbox.instances.list.useQuery();
  const { data: scenarios = [] } = trpc.scenarios.list.useQuery();

  const runTestMutation = trpc.sandbox.aiTester.run.useMutation({
    onSuccess: (data: any) => {
      // Map the server response to our DebugResult shape
      const mapped: DebugResult = {
        response: data.response,
        score: data.scores?.overall ?? 0,
        feedback: data.scores?.reasoning ?? "",
        dimensions: {
          clarity: data.scores?.clarity ?? 0,
          empathy: data.scores?.relevance ?? 0,
          objection_handling: data.scores?.professionalism ?? 0,
          product_knowledge: data.scores?.helpfulness ?? 0,
          closing: data.scores?.overall ?? 0,
        },
        debug: {
          promptTokens: data.tokenUsage?.prompt_tokens ?? 0,
          completionTokens: data.tokenUsage?.completion_tokens ?? 0,
          latencyMs: data.latencyMs ?? 0,
          model: data.model ?? "default",
          systemPromptLength: 0,
          temperature: 0.7,
        },
        rawPrompt: Array.isArray(data.rawPrompt) ? JSON.stringify(data.rawPrompt, null, 2) : String(data.rawPrompt),
        rawResponse: JSON.stringify(data, null, 2),
      };
      setResult(mapped);
      toast.success("Debug run complete");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const DIMENSION_COLORS: Record<string, string> = {
    clarity: "bg-blue-500",
    empathy: "bg-pink-500",
    objection_handling: "bg-orange-500",
    product_knowledge: "bg-violet-500",
    closing: "bg-emerald-500",
  };

  const DIMENSION_LABELS: Record<string, string> = {
    clarity: "Clarity",
    empathy: "Empathy",
    objection_handling: "Objection Handling",
    product_knowledge: "Product Knowledge",
    closing: "Closing",
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">AI Behaviour Tester</h1>
                  <p className="text-sm text-slate-400">Debug AI responses, inspect prompts, and analyse scoring in real time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedSandboxId?.toString() ?? ""} onValueChange={v => setSelectedSandboxId(parseInt(v))}>
                  <SelectTrigger className="w-52 bg-white/[0.04] border-white/10 text-slate-200 text-sm">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                      <SelectValue placeholder="Select sandbox..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                    {sandboxes.map(sb => (
                      <SelectItem key={sb.id} value={sb.id.toString()}>{sb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Panel */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#111318] border border-white/[0.06] p-5">
                <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-violet-400" />
                  Test Configuration
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Scenario</label>
                    <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                      <SelectTrigger className="bg-white/[0.04] border-white/10 text-slate-200 text-sm">
                        <SelectValue placeholder="Choose a scenario to test against..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                        {scenarios.map((sc: any) => (
                          <SelectItem key={sc.id} value={sc.id.toString()}>{sc.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Test Message</label>
                    <Textarea
                      value={testMessage}
                      onChange={e => setTestMessage(e.target.value)}
                      rows={4}
                      placeholder="Enter the user message to test..."
                      className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 resize-none font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      const scenario = scenarios.find((s: any) => s.id.toString() === selectedScenarioId);
                      runTestMutation.mutate({
                        sandboxId: selectedSandboxId ?? 0,
                        systemPrompt: (scenario as any)?.systemPrompt ?? "You are a helpful AI assistant.",
                        userMessage: testMessage,
                      });
                    }}
                    disabled={!selectedScenarioId || !testMessage.trim() || runTestMutation.isPending}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold gap-2 shadow-lg shadow-violet-500/20"
                  >
                    {runTestMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running debug test...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run Debug Test
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick presets */}
              <div className="rounded-2xl bg-[#111318] border border-white/[0.06] p-5">
                <h2 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Quick Test Presets</h2>
                <div className="space-y-2">
                  {[
                    { label: "Objection: Too expensive", msg: "This is way too expensive for what it offers. I've seen cheaper alternatives." },
                    { label: "Confused prospect", msg: "I'm not really sure what you're selling. Can you explain it again?" },
                    { label: "Ready to buy", msg: "This sounds great! What are the next steps to get started?" },
                    { label: "Competitor mention", msg: "We're already using a competitor product and it works fine for us." },
                    { label: "Decision maker absent", msg: "I'd need to check with my manager before making any decisions." },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setTestMessage(preset.msg)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-violet-500/20 transition-all group"
                    >
                      <div className="text-xs font-medium text-slate-300 group-hover:text-violet-300 mb-0.5">{preset.label}</div>
                      <div className="text-[11px] text-slate-500 truncate">{preset.msg}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Results Panel */}
            <div className="space-y-4">
              {!result && !runTestMutation.isPending && (
                <div className="rounded-2xl bg-[#111318] border border-white/[0.06] flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Run a test to see results</h3>
                  <p className="text-slate-400 text-sm max-w-xs">Select a scenario, enter a message, and hit Run to see the AI's response with full debug output.</p>
                </div>
              )}

              {runTestMutation.isPending && (
                <div className="rounded-2xl bg-[#111318] border border-violet-500/20 flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 animate-pulse">
                    <Brain className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Running AI debug test...</h3>
                  <p className="text-slate-400 text-sm">Invoking LLM, scoring response, and collecting metrics</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Metrics bar */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Score", value: `${result.score}/100`, icon: TrendingUp, color: "text-emerald-400" },
                      { label: "Latency", value: `${result.debug.latencyMs}ms`, icon: Timer, color: "text-blue-400" },
                      { label: "Tokens", value: `${result.debug.promptTokens + result.debug.completionTokens}`, icon: Cpu, color: "text-violet-400" },
                      { label: "Model", value: result.debug.model.split("-").slice(0, 2).join("-"), icon: Bot, color: "text-orange-400" },
                    ].map(metric => {
                      const Icon = metric.icon;
                      return (
                        <div key={metric.label} className="rounded-xl bg-[#111318] border border-white/[0.06] p-3 text-center">
                          <Icon className={cn("w-4 h-4 mx-auto mb-1", metric.color)} />
                          <div className={cn("text-sm font-bold font-mono", metric.color)}>{metric.value}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wide">{metric.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Score dimensions */}
                  <div className="rounded-2xl bg-[#111318] border border-white/[0.06] p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" /> Scoring Dimensions
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(result.dimensions).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-300">{DIMENSION_LABELS[key] ?? key}</span>
                            <span className="text-xs font-mono font-bold text-white">{val}/100</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06]">
                            <div
                              className={cn("h-full rounded-full transition-all duration-700", DIMENSION_COLORS[key] ?? "bg-violet-500")}
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabs: Response / Prompt / Raw */}
                  <div className="rounded-2xl bg-[#111318] border border-white/[0.06] overflow-hidden">
                    <Tabs defaultValue="response">
                      <TabsList className="w-full bg-white/[0.03] border-b border-white/[0.06] rounded-none h-10">
                        <TabsTrigger value="response" className="flex-1 text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white text-slate-400">
                          <MessageSquare className="w-3 h-3 mr-1.5" /> Response
                        </TabsTrigger>
                        <TabsTrigger value="feedback" className="flex-1 text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white text-slate-400">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Feedback
                        </TabsTrigger>
                        <TabsTrigger value="prompt" className="flex-1 text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white text-slate-400">
                          <Code2 className="w-3 h-3 mr-1.5" /> Raw Prompt
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="flex-1 text-xs data-[state=active]:bg-white/[0.06] data-[state=active]:text-white text-slate-400">
                          <Terminal className="w-3 h-3 mr-1.5" /> Raw JSON
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="response" className="p-4 m-0">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed">{result.response}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="feedback" className="p-4 m-0">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-sm text-slate-200 leading-relaxed">{result.feedback}</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="prompt" className="m-0">
                        <pre className="p-4 text-[11px] font-mono text-slate-300 leading-relaxed overflow-auto max-h-64 whitespace-pre-wrap">
                          {result.rawPrompt}
                        </pre>
                      </TabsContent>

                      <TabsContent value="raw" className="m-0">
                        <pre className="p-4 text-[11px] font-mono text-emerald-400 leading-relaxed overflow-auto max-h-64 whitespace-pre-wrap">
                          {JSON.stringify({ debug: result.debug, dimensions: result.dimensions, score: result.score }, null, 2)}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
