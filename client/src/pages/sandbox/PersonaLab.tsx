import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bot,
  ChevronDown,
  ChevronRight,
  Edit2,
  FlaskConical,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sliders,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface PersonaForm {
  name: string;
  description: string;
  systemPrompt: string;
  tone: string;
  difficulty: string;
  temperature: number;
  tags: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const TONE_OPTIONS = ["professional", "casual", "aggressive", "friendly", "skeptical", "enthusiastic"];
const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced", "expert"];

const TONE_COLORS: Record<string, string> = {
  professional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  casual: "bg-green-500/10 text-green-400 border-green-500/20",
  aggressive: "bg-red-500/10 text-red-400 border-red-500/20",
  friendly: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  skeptical: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  enthusiastic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function PersonaLab() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sandboxIdFromUrl = params.get("sandbox") ? parseInt(params.get("sandbox")!) : null;

  const [selectedSandboxId, setSelectedSandboxId] = useState<number | null>(sandboxIdFromUrl);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewPersonaId, setPreviewPersonaId] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [form, setForm] = useState<PersonaForm>({
    name: "", description: "", systemPrompt: "", tone: "professional",
    difficulty: "intermediate", temperature: 0.7, tags: "",
  });

  const utils = trpc.useUtils();
  const { data: sandboxes = [] } = trpc.sandbox.instances.list.useQuery();
  const { data: personas = [], isLoading } = trpc.sandbox.personas.list.useQuery(
    { sandboxId: selectedSandboxId! },
    { enabled: !!selectedSandboxId }
  );

  const createMutation = trpc.sandbox.personas.create.useMutation({
    onSuccess: () => { utils.sandbox.personas.list.invalidate(); setCreateOpen(false); resetForm(); toast.success("Persona created"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.sandbox.personas.delete.useMutation({
    onSuccess: () => { utils.sandbox.personas.list.invalidate(); toast.success("Persona deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const previewMutation = trpc.sandbox.aiTester.run.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", description: "", systemPrompt: "", tone: "professional", difficulty: "intermediate", temperature: 0.7, tags: "" });

  const handleSendPreview = () => {
    if (!chatInput.trim() || !previewPersonaId) return;
    const persona = personas.find((p: any) => p.id === previewPersonaId);
    if (!persona) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    previewMutation.mutate({
      sandboxId: selectedSandboxId!,
      systemPrompt: (persona as any).systemPrompt,
      userMessage: userMsg,
      history: chatHistory,
      temperature: (persona as any).temperature ?? 0.7,
    });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Persona Lab</h1>
                  <p className="text-sm text-slate-400">Build, test, and refine custom AI personas before publishing</p>
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Plus className="w-4 h-4" />
                  New Persona
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {!selectedSandboxId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Sandbox</h3>
              <p className="text-slate-400 text-sm max-w-sm">Choose a sandbox to manage and test AI personas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Persona list / Create form */}
              <div>
                {createOpen ? (
                  <div className="rounded-2xl bg-[#111318] border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-base font-bold text-white">Create Persona</h2>
                      <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); resetForm(); }} className="bg-transparent border-white/10 text-slate-400 hover:bg-white/[0.06] h-7 text-xs">
                        Cancel
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Persona Name</label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Skeptical Enterprise Buyer" className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Description</label>
                        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this persona's role" className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">System Prompt</label>
                        <Textarea value={form.systemPrompt} onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))} placeholder="You are a skeptical VP of Sales at a mid-sized SaaS company. You have a tight budget and are evaluating multiple vendors..." rows={4} className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 resize-none text-sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tone</label>
                          <Select value={form.tone} onValueChange={v => setForm(f => ({ ...f, tone: v }))}>
                            <SelectTrigger className="bg-white/[0.04] border-white/10 text-slate-300 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                              {TONE_OPTIONS.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Difficulty</label>
                          <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                            <SelectTrigger className="bg-white/[0.04] border-white/10 text-slate-300 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                              {DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-400">Temperature</label>
                          <span className="text-xs font-mono text-purple-400">{form.temperature.toFixed(1)}</span>
                        </div>
                        <Slider value={[form.temperature]} onValueChange={([v]) => setForm(f => ({ ...f, temperature: v }))} min={0} max={2} step={0.1} className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-500" />
                        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                          <span>Focused</span><span>Balanced</span><span>Creative</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tags (comma-separated)</label>
                        <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="e.g. sales, enterprise, objections" className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 text-sm" />
                      </div>
                      <Button
                        onClick={() => createMutation.mutate({
                          sandboxId: selectedSandboxId!,
                          name: form.name,
                          role: form.description,
                          systemPrompt: form.systemPrompt,
                          tone: form.tone as any,
                          temperature: form.temperature,
                        })}
                        disabled={!form.name.trim() || !form.systemPrompt.trim() || createMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold"
                      >
                        {createMutation.isPending ? "Creating..." : "Create Persona"}
                      </Button>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/[0.03] animate-pulse" />)}
                  </div>
                ) : personas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-white/10">
                    <Bot className="w-10 h-10 text-slate-600 mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">No personas yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Create your first AI persona to test against.</p>
                    <Button onClick={() => setCreateOpen(true)} className="bg-purple-600 hover:bg-purple-500 text-white gap-2 text-sm">
                      <Plus className="w-3.5 h-3.5" /> Create Persona
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {personas.map((persona: any) => (
                      <div
                        key={persona.id}
                        onClick={() => { setPreviewPersonaId(persona.id); setChatHistory([]); }}
                        className={cn(
                          "rounded-xl border p-4 cursor-pointer transition-all duration-200",
                          previewPersonaId === persona.id
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-[#111318] border-white/[0.06] hover:border-white/10"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{persona.name}</span>
                              {persona.tone && (
                                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize", TONE_COLORS[persona.tone] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
                                  {persona.tone}
                                </span>
                              )}
                              {persona.difficulty && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 capitalize">
                                  {persona.difficulty}
                                </span>
                              )}
                            </div>
                            {persona.description && <p className="text-xs text-slate-400 line-clamp-2">{persona.description}</p>}
                            {persona.tags && persona.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {persona.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); deleteMutation.mutate({ id: persona.id }); }}
                            className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Chat preview */}
              <div className="rounded-2xl bg-[#111318] border border-white/[0.06] flex flex-col h-[600px]">
                {!previewPersonaId ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare className="w-10 h-10 text-slate-600 mb-3" />
                    <h3 className="text-base font-semibold text-white mb-1">Select a persona to preview</h3>
                    <p className="text-slate-500 text-sm">Click any persona on the left to start a live chat test.</p>
                  </div>
                ) : (
                  <>
                    {/* Chat header */}
                    <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {personas.find((p: any) => p.id === previewPersonaId)?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">Live preview — changes not saved</div>
                      </div>
                      <button onClick={() => setChatHistory([])} className="ml-auto text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Reset
                      </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <p className="text-slate-600 text-sm">Send a message to start testing this persona</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, i) => (
                          <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                            {msg.role === "assistant" && (
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="w-3 h-3 text-purple-400" />
                              </div>
                            )}
                            <div className={cn(
                              "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                              msg.role === "user"
                                ? "bg-violet-600 text-white"
                                : "bg-white/[0.06] text-slate-200"
                            )}>
                              {msg.content}
                            </div>
                            {msg.role === "user" && (
                              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="w-3 h-3 text-violet-400" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {previewMutation.isPending && (
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Bot className="w-3 h-3 text-purple-400" />
                          </div>
                          <div className="bg-white/[0.06] rounded-xl px-3 py-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/[0.06]">
                      <div className="flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSendPreview()}
                          placeholder="Type a test message..."
                          className="flex-1 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-purple-500/50 text-sm"
                        />
                        <Button
                          onClick={handleSendPreview}
                          disabled={!chatInput.trim() || previewMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-500 text-white"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
