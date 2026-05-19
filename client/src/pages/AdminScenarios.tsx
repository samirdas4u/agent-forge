import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, ChevronDown, ChevronRight, Edit2, Eye, EyeOff,
  Layers, Plus, Save, Shield, Trash2, X
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/_core/hooks/useAuth";

const CATEGORIES = ["sales", "customer_service", "interview", "negotiation", "presentation"] as const;
const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  sales: "Sales",
  customer_service: "Customer Service",
  interview: "Interview",
  negotiation: "Negotiation",
  presentation: "Presentation",
};

const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: "oklch(0.95 0.06 160)", color: "oklch(0.38 0.12 160)" },
  intermediate: { bg: "oklch(0.95 0.05 264)", color: "oklch(0.38 0.18 264)" },
  advanced:     { bg: "oklch(0.97 0.06 25)",  color: "oklch(0.45 0.18 25)"  },
};

type ScenarioForm = {
  title: string;
  description: string;
  category: typeof CATEGORIES[number];
  difficulty: typeof DIFFICULTIES[number];
  systemPrompt: string;
  aiPersona: string;
  tags: string;
  estimatedMinutes: number;
};

const EMPTY_FORM: ScenarioForm = {
  title: "",
  description: "",
  category: "sales",
  difficulty: "beginner",
  systemPrompt: "",
  aiPersona: "",
  tags: "",
  estimatedMinutes: 10,
};

function ScenarioFormModal({
  initial,
  onClose,
  onSave,
  isPending,
}: {
  initial: ScenarioForm & { id?: number };
  onClose: () => void;
  onSave: (data: ScenarioForm & { id?: number }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState(initial);

  const set = (key: keyof ScenarioForm, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.systemPrompt.trim()) {
      toast.error("Title and System Prompt are required.");
      return;
    }
    onSave({ ...form, id: initial.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.95 0.05 264)" }}>
              <BookOpen size={15} style={{ color: "oklch(0.51 0.23 264)" }} />
            </div>
            <h2 className="text-base font-bold text-foreground">
              {initial.id ? "Edit Scenario" : "New Scenario"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Scenario Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Cold Call: SaaS Product Demo"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the scenario"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Category + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Persona + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">AI Persona</label>
              <input
                type="text"
                value={form.aiPersona}
                onChange={(e) => set("aiPersona", e.target.value)}
                placeholder="e.g. Sarah Chen, VP of Operations"
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Est. Duration (mins)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.estimatedMinutes}
                onChange={(e) => set("estimatedMinutes", parseInt(e.target.value) || 10)}
                className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Tags <span className="font-normal text-muted-foreground">(comma-separated)</span></label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="e.g. cold-call, saas, b2b"
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              System Prompt <span className="text-red-500">*</span>
              <span className="ml-2 font-normal text-muted-foreground">— This defines the AI's persona and behaviour</span>
            </label>
            <textarea
              value={form.systemPrompt}
              onChange={(e) => set("systemPrompt", e.target.value)}
              placeholder="You are [persona]. You will respond as [description]. Your goals are [goals]. Keep responses [length/style]..."
              rows={7}
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Tip: Describe the persona's role, emotional state, goals, and how they respond to different approaches. Be specific for best results.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "oklch(0.51 0.23 264)" }}
          >
            <Save size={14} />
            {isPending ? "Saving…" : initial.id ? "Save Changes" : "Create Scenario"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminScenarios() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<(ScenarioForm & { id?: number }) | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: scenarios, refetch } = trpc.admin.listScenarios.useQuery(undefined, {
    enabled: true,
  });

  const createMutation = trpc.admin.createScenario.useMutation({
    onSuccess: () => { toast.success("Scenario created!"); refetch(); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateScenario.useMutation({
    onSuccess: () => { toast.success("Scenario updated!"); refetch(); setEditTarget(null); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteScenario.useMutation({
    onSuccess: () => { toast.success("Scenario deactivated."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = (id: number, current: boolean) => {
    updateMutation.mutate({ id, isActive: !current });
  };

  const handleSave = (data: ScenarioForm & { id?: number }) => {
    const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (data.id) {
      updateMutation.mutate({ ...data, id: data.id, tags });
    } else {
      createMutation.mutate({ ...data, tags });
    }
  };

  // Access guard removed — platform is fully public
  if (false) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <button
            onClick={() => navigate("/")}
            className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "oklch(0.51 0.23 264)" }}
          >
            Back to Home
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Page header */}
        <div className="shrink-0 px-6 py-5 border-b border-border bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.95 0.05 264)" }}>
                  <Layers size={12} style={{ color: "oklch(0.51 0.23 264)" }} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Panel</span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Scenario Builder</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Create and manage AI practice scenarios for your team</p>
            </div>
            <button
              onClick={() => { setEditTarget({ ...EMPTY_FORM }); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "oklch(0.51 0.23 264)" }}
            >
              <Plus size={15} />
              New Scenario
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-6 mt-4">
            {(["sales", "customer_service", "interview", "negotiation", "presentation"] as const).map((cat) => {
              const count = scenarios?.filter((s) => s.category === cat).length ?? 0;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-foreground">{count}</span>
                  <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[cat]}</span>
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{scenarios?.length ?? 0}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </div>

        {/* Scenario list */}
        <div className="flex-1 overflow-y-auto p-6">
          {!scenarios ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : scenarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.05 264)" }}>
                <BookOpen size={22} style={{ color: "oklch(0.51 0.23 264)" }} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">No scenarios yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first custom scenario to get started.</p>
              <button
                onClick={() => { setEditTarget({ ...EMPTY_FORM }); setShowForm(true); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                <Plus size={14} className="inline mr-1.5" />Create Scenario
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {scenarios.map((scenario) => {
                const isExpanded = expandedId === scenario.id;
                const diffStyle = DIFFICULTY_COLORS[scenario.difficulty] ?? DIFFICULTY_COLORS.beginner;
                return (
                  <div
                    key={scenario.id}
                    className="bg-white rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-sm"
                    style={{ opacity: scenario.isActive ? 1 : 0.55 }}
                  >
                    {/* Row header */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : scenario.id)}
                    >
                      {/* Category dot */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: DIFFICULTY_COLORS[scenario.difficulty]?.color ?? "oklch(0.51 0.23 264)" }}
                      />

                      {/* Title + meta */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground truncate">{scenario.title}</span>
                          {!scenario.isActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-muted-foreground">Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[scenario.category]}</span>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: diffStyle.bg, color: diffStyle.color }}
                          >
                            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                          </span>
                          {scenario.estimatedMinutes && (
                            <span className="text-xs text-muted-foreground">{scenario.estimatedMinutes} min</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleActive(scenario.id, scenario.isActive)}
                          title={scenario.isActive ? "Deactivate" : "Activate"}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          {scenario.isActive
                            ? <Eye size={14} className="text-muted-foreground" />
                            : <EyeOff size={14} className="text-muted-foreground" />
                          }
                        </button>
                        <button
                          onClick={() => {
                            setEditTarget({
                              id: scenario.id,
                              title: scenario.title,
                              description: scenario.description ?? "",
                              category: scenario.category,
                              difficulty: scenario.difficulty,
                              systemPrompt: scenario.systemPrompt,
                              aiPersona: scenario.aiPersona ?? "",
                              tags: (scenario.tags as string[] | null)?.join(", ") ?? "",
                              estimatedMinutes: scenario.estimatedMinutes ?? 10,
                            });
                            setShowForm(true);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 size={14} className="text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Deactivate this scenario? It will no longer appear for users.")) {
                              deleteMutation.mutate({ id: scenario.id });
                            }
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} style={{ color: "oklch(0.55 0.18 25)" }} />
                        </button>
                      </div>

                      {/* Expand chevron */}
                      <div className="shrink-0 text-muted-foreground">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </div>

                    {/* Expanded: system prompt preview */}
                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-border">
                        <div className="mt-3 space-y-3">
                          {scenario.aiPersona && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">AI Persona</div>
                              <p className="text-xs text-foreground">{scenario.aiPersona}</p>
                            </div>
                          )}
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">System Prompt</div>
                            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-gray-50 rounded-xl p-3 leading-relaxed max-h-40 overflow-y-auto">
                              {scenario.systemPrompt}
                            </pre>
                          </div>
                          {Array.isArray(scenario.tags) && scenario.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {(scenario.tags as string[]).map((tag) => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-muted-foreground font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && editTarget && (
        <ScenarioFormModal
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          onSave={handleSave}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </AppLayout>
  );
}
