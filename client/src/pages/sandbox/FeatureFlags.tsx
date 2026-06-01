import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Cpu,
  FlaskConical,
  Plus,
  Shield,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FeatureFlags() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sandboxIdFromUrl = params.get("sandbox") ? parseInt(params.get("sandbox")!) : null;

  const [selectedSandboxId, setSelectedSandboxId] = useState<number | null>(sandboxIdFromUrl);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ flagKey: "", description: "", rolloutPct: 0, enabled: false });
  const utils = trpc.useUtils();

  const { data: sandboxes = [] } = trpc.sandbox.instances.list.useQuery();
  const { data: flags = [], isLoading } = trpc.sandbox.flags.list.useQuery(
    { sandboxId: selectedSandboxId! },
    { enabled: !!selectedSandboxId }
  );

  const createMutation = trpc.sandbox.flags.create.useMutation({
    onSuccess: () => {
      utils.sandbox.flags.list.invalidate();
      setCreateOpen(false);
      setForm({ flagKey: "", description: "", rolloutPct: 0, enabled: false });
      toast.success("Feature flag created");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.sandbox.flags.update.useMutation({
    onSuccess: () => utils.sandbox.flags.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.sandbox.flags.delete.useMutation({
    onSuccess: () => { utils.sandbox.flags.list.invalidate(); toast.success("Flag deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.sandbox.flags.update.useMutation({
    onSuccess: () => utils.sandbox.flags.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const activeSandbox = sandboxes.find(s => s.id === selectedSandboxId);

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Feature Flags</h1>
                  <p className="text-sm text-slate-400">Toggle features, control rollouts, and manage kill switches</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Sandbox selector */}
                <Select
                  value={selectedSandboxId?.toString() ?? ""}
                  onValueChange={v => setSelectedSandboxId(parseInt(v))}
                >
                  <SelectTrigger className="w-52 bg-white/[0.04] border-white/10 text-slate-200 text-sm">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                      <SelectValue placeholder="Select sandbox..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                    {sandboxes.map(sb => (
                      <SelectItem key={sb.id} value={sb.id.toString()} className="hover:bg-white/[0.06] cursor-pointer">
                        {sb.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setCreateOpen(true)}
                  disabled={!selectedSandboxId}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2 shadow-lg shadow-yellow-500/20"
                >
                  <Plus className="w-4 h-4" />
                  New Flag
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {!selectedSandboxId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-6">
                <Cpu className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Sandbox</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Choose a sandbox environment from the dropdown above to manage its feature flags.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active sandbox info */}
              {activeSandbox && (
                <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-300 font-medium">{activeSandbox.name}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400">{flags.length} flags configured</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-emerald-400">{flags.filter(f => f.enabled).length} active</span>
                </div>
              )}

              {flags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No flags yet</h3>
                  <p className="text-slate-400 text-sm mb-4">Create your first feature flag to control rollouts in this sandbox.</p>
                  <Button onClick={() => setCreateOpen(true)} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-2">
                    <Plus className="w-4 h-4" /> Create Flag
                  </Button>
                </div>
              ) : (
                flags.map(flag => (
                  <div
                    key={flag.id}
                    className={cn(
                      "rounded-xl border transition-all duration-200",
                      flag.killSwitch
                        ? "bg-red-500/5 border-red-500/20"
                        : flag.enabled
                          ? "bg-[#111318] border-emerald-500/20"
                          : "bg-[#111318] border-white/[0.06]"
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Toggle */}
                        <div className="pt-0.5">
                          <Switch
                            checked={flag.enabled && !flag.killSwitch}
                            onCheckedChange={(checked) => toggleMutation.mutate({ id: flag.id, sandboxId: flag.sandboxId, enabled: checked })}
                            disabled={flag.killSwitch}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono font-bold text-white">{flag.flagKey}</code>
                            {flag.killSwitch && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                                <Shield className="w-2.5 h-2.5" /> KILL SWITCH
                              </span>
                            )}
                            {flag.enabled && !flag.killSwitch && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Enabled
                              </span>
                            )}
                            {!flag.enabled && !flag.killSwitch && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-slate-500 border border-white/10">
                                Disabled
                              </span>
                            )}
                          </div>
                          {flag.description && (
                            <p className="text-xs text-slate-400 mb-3">{flag.description}</p>
                          )}

                          {/* Rollout slider */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Sliders className="w-3 h-3" />
                              Rollout
                            </div>
                            <div className="flex-1 max-w-xs">
                              <Slider
                                value={[flag.rolloutPct]}
                                min={0}
                                max={100}
                                step={5}
                                onValueChange={([val]) => updateMutation.mutate({ id: flag.id, sandboxId: flag.sandboxId, rolloutPct: val })}
                                className="[&_[role=slider]]:bg-yellow-400 [&_[role=slider]]:border-yellow-400"
                                disabled={flag.killSwitch}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-yellow-400 w-10 text-right">
                              {flag.rolloutPct}%
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Users className="w-3 h-3" />
                              of users
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateMutation.mutate({ id: flag.id, sandboxId: flag.sandboxId, killSwitch: !flag.killSwitch })}
                            className={cn(
                              "p-1.5 rounded-lg transition-colors text-xs",
                              flag.killSwitch
                                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                                : "text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            )}
                            title={flag.killSwitch ? "Remove kill switch" : "Activate kill switch"}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate({ id: flag.id, sandboxId: flag.sandboxId })}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#111318] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-yellow-400" />
              New Feature Flag
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create a feature flag to control rollouts and test new functionality safely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Flag Key</label>
              <Input
                placeholder="e.g. enable_voice_input, new_scoring_v2"
                value={form.flagKey}
                onChange={e => setForm(f => ({ ...f, flagKey: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-yellow-500/50 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Description</label>
              <Textarea
                placeholder="What does this flag control?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-yellow-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-3 block flex items-center justify-between">
                <span>Initial Rollout</span>
                <span className="font-mono text-yellow-400">{form.rolloutPct}%</span>
              </label>
              <Slider
                value={[form.rolloutPct]}
                min={0}
                max={100}
                step={5}
                onValueChange={([val]) => setForm(f => ({ ...f, rolloutPct: val }))}
                className="[&_[role=slider]]:bg-yellow-400 [&_[role=slider]]:border-yellow-400"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/10">
              <div>
                <div className="text-sm font-medium text-slate-200">Enable immediately</div>
                <div className="text-xs text-slate-500">Flag will be active on creation</div>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={v => setForm(f => ({ ...f, enabled: v }))}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 bg-transparent border-white/10 text-slate-300 hover:bg-white/[0.06]">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate({ sandboxId: selectedSandboxId!, ...form })}
                disabled={!form.flagKey.trim() || createMutation.isPending}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              >
                {createMutation.isPending ? "Creating..." : "Create Flag"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
