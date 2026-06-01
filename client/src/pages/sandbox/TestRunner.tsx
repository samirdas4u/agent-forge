import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  Layers,
  Loader2,
  MessageSquare,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type AssertionType = "contains" | "score_gte" | "score_lte" | "not_contains";

interface Assertion {
  type: AssertionType;
  value: string | number;
}

interface Turn {
  userMessage: string;
  assertions: Assertion[];
}

interface TestScript {
  name: string;
  turns: Turn[];
}

export default function TestRunner() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sandboxIdFromUrl = params.get("sandbox") ? parseInt(params.get("sandbox")!) : null;

  const [selectedSandboxId, setSelectedSandboxId] = useState<number | null>(sandboxIdFromUrl);
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [script, setScript] = useState<TestScript>({
    name: "",
    turns: [{ userMessage: "", assertions: [{ type: "score_gte", value: 60 }] }],
  });

  const utils = trpc.useUtils();
  const { data: sandboxes = [] } = trpc.sandbox.instances.list.useQuery();
  const { data: testRuns = [], isLoading } = trpc.sandbox.tests.list.useQuery(
    { sandboxId: selectedSandboxId! },
    { enabled: !!selectedSandboxId }
  );

  const createMutation = trpc.sandbox.tests.create.useMutation({
    onSuccess: () => {
      utils.sandbox.tests.list.invalidate();
      setCreateOpen(false);
      toast.success("Test script created");
    },
    onError: (e) => toast.error(e.message),
  });

  const runMutation = trpc.sandbox.tests.run.useMutation({
    onSuccess: () => {
      utils.sandbox.tests.list.invalidate();
      toast.success("Test run complete");
    },
    onError: (e) => toast.error(e.message),
  });

  const addTurn = () => setScript(s => ({
    ...s,
    turns: [...s.turns, { userMessage: "", assertions: [{ type: "score_gte", value: 60 }] }],
  }));

  const removeTurn = (i: number) => setScript(s => ({ ...s, turns: s.turns.filter((_, idx) => idx !== i) }));

  const updateTurn = (i: number, field: keyof Turn, value: any) => setScript(s => ({
    ...s,
    turns: s.turns.map((t, idx) => idx === i ? { ...t, [field]: value } : t),
  }));

  const addAssertion = (turnIdx: number) => setScript(s => ({
    ...s,
    turns: s.turns.map((t, idx) => idx === turnIdx
      ? { ...t, assertions: [...t.assertions, { type: "contains" as AssertionType, value: "" }] }
      : t),
  }));

  const removeAssertion = (turnIdx: number, assertIdx: number) => setScript(s => ({
    ...s,
    turns: s.turns.map((t, idx) => idx === turnIdx
      ? { ...t, assertions: t.assertions.filter((_, ai) => ai !== assertIdx) }
      : t),
  }));

  const updateAssertion = (turnIdx: number, assertIdx: number, field: keyof Assertion, value: any) => setScript(s => ({
    ...s,
    turns: s.turns.map((t, idx) => idx === turnIdx
      ? { ...t, assertions: t.assertions.map((a, ai) => ai === assertIdx ? { ...a, [field]: value } : a) }
      : t),
  }));

  const STATUS_CONFIG = {
    pending: { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", icon: Clock, label: "Pending" },
    running: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Loader2, label: "Running" },
    passed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Passed" },
    failed: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle, label: "Failed" },
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Synthetic Test Runner</h1>
                  <p className="text-sm text-slate-400">Script multi-turn conversations and assert expected AI behaviour</p>
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
                <Button
                  onClick={() => setCreateOpen(true)}
                  disabled={!selectedSandboxId}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  New Test Script
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {!selectedSandboxId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Terminal className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Sandbox</h3>
              <p className="text-slate-400 text-sm max-w-sm">Choose a sandbox environment to view and run test scripts.</p>
            </div>
          ) : createOpen ? (
            /* Script Builder */
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Create Test Script</h2>
                <Button variant="outline" onClick={() => setCreateOpen(false)} className="bg-transparent border-white/10 text-slate-400 hover:bg-white/[0.06]">
                  Cancel
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-[#111318] border border-white/[0.06] p-5">
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Script Name</label>
                  <Input
                    placeholder="e.g. Cold call objection handling test"
                    value={script.name}
                    onChange={e => setScript(s => ({ ...s, name: e.target.value }))}
                    className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                  />
                </div>

                {/* Turns */}
                {script.turns.map((turn, turnIdx) => (
                  <div key={turnIdx} className="rounded-2xl bg-[#111318] border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-blue-400">{turnIdx + 1}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-200">Turn {turnIdx + 1}</span>
                      </div>
                      {script.turns.length > 1 && (
                        <button onClick={() => removeTurn(turnIdx)} className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="text-xs font-semibold text-slate-400 mb-1.5 block">User Message</label>
                      <Textarea
                        value={turn.userMessage}
                        onChange={e => updateTurn(turnIdx, "userMessage", e.target.value)}
                        placeholder="What the user says in this turn..."
                        rows={2}
                        className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-blue-500/50 resize-none text-sm"
                      />
                    </div>

                    {/* Assertions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-400">Assertions</label>
                        <button onClick={() => addAssertion(turnIdx)} className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {turn.assertions.map((assertion, assertIdx) => (
                          <div key={assertIdx} className="flex items-center gap-2">
                            <Select
                              value={assertion.type}
                              onValueChange={v => updateAssertion(turnIdx, assertIdx, "type", v)}
                            >
                              <SelectTrigger className="w-44 bg-white/[0.04] border-white/10 text-slate-300 text-xs h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                                <SelectItem value="contains">Response contains</SelectItem>
                                <SelectItem value="not_contains">Response excludes</SelectItem>
                                <SelectItem value="score_gte">Score ≥</SelectItem>
                                <SelectItem value="score_lte">Score ≤</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              value={String(assertion.value)}
                              onChange={e => updateAssertion(turnIdx, assertIdx, "value",
                                assertion.type.startsWith("score") ? parseInt(e.target.value) || 0 : e.target.value
                              )}
                              placeholder={assertion.type.startsWith("score") ? "e.g. 70" : "e.g. pricing"}
                              className="flex-1 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 h-8 text-xs"
                            />
                            {turn.assertions.length > 1 && (
                              <button onClick={() => removeAssertion(turnIdx, assertIdx)} className="p-1 text-slate-600 hover:text-red-400">
                                <Minus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addTurn}
                  className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-blue-500/30 text-slate-500 hover:text-blue-400 text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Turn
                </button>

                <Button
                  onClick={() => createMutation.mutate({ sandboxId: selectedSandboxId!, name: script.name, script: { turns: script.turns } })}
                  disabled={!script.name.trim() || script.turns.some(t => !t.userMessage.trim()) || createMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold"
                >
                  {createMutation.isPending ? "Saving..." : "Save Test Script"}
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          ) : testRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <Terminal className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No test scripts yet</h3>
              <p className="text-slate-400 text-sm mb-4">Create a scripted test to automatically validate AI behaviour.</p>
              <Button onClick={() => setCreateOpen(true)} className="bg-blue-500 hover:bg-blue-400 text-white font-semibold gap-2">
                <Plus className="w-4 h-4" /> Create Test Script
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {testRuns.map(run => {
                const status = STATUS_CONFIG[run.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                const StatusIcon = status.icon;
                const isExpanded = expandedRun === run.id;
                const results = run.results as any[] | null;
                const passCount = results?.filter(r => r.passed).length ?? 0;
                const totalAssertions = results?.reduce((sum: number, r: any) => sum + (r.assertions?.length ?? 0), 0) ?? 0;
                const passedAssertions = results?.reduce((sum: number, r: any) => sum + (r.assertions?.filter((a: any) => a.passed).length ?? 0), 0) ?? 0;

                return (
                  <div key={run.id} className={cn("rounded-xl border transition-all duration-200", status.bg)}>
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                    >
                      <div className="flex items-center gap-4">
                        <StatusIcon className={cn("w-4 h-4 flex-shrink-0", status.color, run.status === "running" && "animate-spin")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-white truncate">{run.name}</span>
                            <span className={cn("text-[11px] font-medium px-1.5 py-0.5 rounded border", status.bg, status.color)}>
                              {status.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {(run.script as any)?.turns?.length ?? 0} turns
                            </span>
                            {results && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                {passedAssertions}/{totalAssertions} assertions passed
                              </span>
                            )}
                            <span>{new Date(run.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {run.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={e => { e.stopPropagation(); runMutation.mutate({ id: run.id, sandboxId: selectedSandboxId! }); }}
                              disabled={runMutation.isPending}
                              className="bg-blue-500 hover:bg-blue-400 text-white gap-1.5 h-7 text-xs"
                            >
                              <Play className="w-3 h-3" /> Run
                            </Button>
                          )}
                          {run.status === "passed" && (
                            <Button
                              size="sm"
                              onClick={e => { e.stopPropagation(); runMutation.mutate({ id: run.id, sandboxId: selectedSandboxId! }); }}
                              disabled={runMutation.isPending}
                              variant="outline"
                              className="bg-transparent border-white/10 text-slate-400 hover:bg-white/[0.06] gap-1.5 h-7 text-xs"
                            >
                              <RefreshCw className="w-3 h-3" /> Re-run
                            </Button>
                          )}
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded results */}
                    {isExpanded && results && (
                      <div className="border-t border-white/[0.06] p-4 space-y-3">
                        {results.map((turnResult: any, i: number) => (
                          <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-blue-400">{i + 1}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-300">Turn {i + 1}</span>
                              {turnResult.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-400 ml-auto" />
                              )}
                            </div>

                            <div className="space-y-2 mb-3">
                              <div className="text-[11px] text-slate-500 uppercase tracking-wide">User</div>
                              <p className="text-xs text-slate-300 font-mono bg-white/[0.03] rounded p-2">{turnResult.userMessage}</p>
                              <div className="text-[11px] text-slate-500 uppercase tracking-wide">AI Response</div>
                              <p className="text-xs text-slate-300 font-mono bg-white/[0.03] rounded p-2">{turnResult.aiResponse}</p>
                            </div>

                            {/* Assertion results */}
                            <div className="space-y-1.5">
                              {turnResult.assertions?.map((a: any, ai: number) => (
                                <div key={ai} className={cn(
                                  "flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg",
                                  a.passed ? "bg-emerald-500/5 text-emerald-300" : "bg-red-500/5 text-red-300"
                                )}>
                                  {a.passed ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> : <XCircle className="w-3 h-3 flex-shrink-0" />}
                                  <span className="font-mono">{a.type}</span>
                                  <span className="text-slate-500">→</span>
                                  <span className="font-mono">{String(a.value)}</span>
                                  {!a.passed && a.reason && (
                                    <span className="text-red-400 ml-auto text-[10px]">{a.reason}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
