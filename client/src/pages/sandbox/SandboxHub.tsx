import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  ExternalLink,
  FlaskConical,
  GitBranch,
  Layers,
  MoreHorizontal,
  PauseCircle,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  active: { label: "Active", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  paused: { label: "Paused", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", dot: "bg-yellow-400" },
  archived: { label: "Archived", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" },
};

const ENV_CONFIG = {
  development: { label: "Dev", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  staging: { label: "Staging", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  production: { label: "Production", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
};

export default function SandboxHub() {
  const [, navigate] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", environment: "development" });
  const utils = trpc.useUtils();

  const { data: sandboxes = [], isLoading } = trpc.sandbox.instances.list.useQuery();
  const createMutation = trpc.sandbox.instances.create.useMutation({
    onSuccess: () => {
      utils.sandbox.instances.list.invalidate();
      setCreateOpen(false);
      setForm({ name: "", description: "", environment: "development" });
      toast.success("Sandbox created successfully");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.sandbox.instances.update.useMutation({
    onSuccess: () => { utils.sandbox.instances.list.invalidate(); toast.success("Sandbox archived"); },
  });
  const resetMutation = trpc.sandbox.instances.reset.useMutation({
    onSuccess: () => { utils.sandbox.instances.list.invalidate(); toast.success("Sandbox reset to clean state"); },
  });
  const cloneMutation = trpc.sandbox.instances.clone.useMutation({
    onSuccess: () => { utils.sandbox.instances.list.invalidate(); toast.success("Sandbox cloned"); },
  });

  const copyUrl = (token: string | null) => {
    if (!token) { toast.error("No share token available"); return; }
    const url = `${window.location.origin}/sandbox/preview/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Preview URL copied to clipboard");
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Sandbox Hub</h1>
                <p className="text-sm text-slate-400">Isolated environments for safe pre-launch testing</p>
              </div>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              New Sandbox
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-b border-white/[0.06] bg-[#111318]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-4 sm:gap-8">
            {[
              { label: "Total Sandboxes", value: sandboxes.length, icon: Cpu },
              { label: "Active", value: sandboxes.filter(s => s.status === "active").length, icon: CheckCircle2, color: "text-emerald-400" },
              { label: "Paused", value: sandboxes.filter(s => s.status === "paused").length, icon: PauseCircle, color: "text-yellow-400" },
              { label: "Archived", value: sandboxes.filter(s => s.status === "archived").length, icon: Clock, color: "text-slate-400" },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", stat.color ?? "text-slate-400")} />
                  <span className="text-xs text-slate-500">{stat.label}:</span>
                  <span className="text-sm font-bold text-white">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-52 rounded-2xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : sandboxes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <FlaskConical className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No sandboxes yet</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">
                Create your first isolated sandbox environment to safely test new features before global launch.
              </p>
              <Button onClick={() => setCreateOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white gap-2">
                <Plus className="w-4 h-4" />
                Create First Sandbox
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sandboxes.map(sb => {
                const status = STATUS_CONFIG[sb.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
                const env = ENV_CONFIG[sb.baseTemplate === "blank" ? "development" : sb.baseTemplate === "sales" ? "staging" : "production"] ?? ENV_CONFIG.development;
                return (
                  <div
                    key={sb.id}
                    className="group relative rounded-2xl bg-[#111318] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-200 overflow-hidden"
                  >
                    {/* Top accent */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/40 to-transparent" />

                    <div className="p-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">{sb.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                              <span className={cn("text-[11px] font-medium", status.color)}>{status.label}</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1a1d24] border-white/10 text-slate-200">
                            <DropdownMenuItem onClick={() => navigate(`/sandbox/flags?sandbox=${sb.id}`)} className="gap-2 cursor-pointer hover:bg-white/[0.06]">
                              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Feature Flags
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyUrl(sb.shareToken)} className="gap-2 cursor-pointer hover:bg-white/[0.06]">
                              <Copy className="w-3.5 h-3.5 text-blue-400" /> Copy Preview URL
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => cloneMutation.mutate({ id: sb.id, newName: `${sb.name} (clone)` })} className="gap-2 cursor-pointer hover:bg-white/[0.06]">
                              <GitBranch className="w-3.5 h-3.5 text-violet-400" /> Clone Sandbox
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => resetMutation.mutate({ id: sb.id })} className="gap-2 cursor-pointer hover:bg-white/[0.06] text-yellow-400">
                              <RotateCcw className="w-3.5 h-3.5" /> Reset to Clean State
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem onClick={() => updateMutation.mutate({ id: sb.id, status: "archived" })} className="gap-2 cursor-pointer hover:bg-white/[0.06] text-red-400">
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Description */}
                      {sb.description && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{sb.description}</p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border", env.bg, env.color)}>
                          {env.label}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] border border-white/10 text-slate-400">
                          <Layers className="w-2.5 h-2.5 mr-1" />
                          {sb.baseTemplate}
                        </span>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: "Flags", value: (sb.snapshotData as any)?.flagCount ?? 0, icon: Zap },
                          { label: "Tests", value: (sb.snapshotData as any)?.testCount ?? 0, icon: Play },
                          { label: "Events", value: (sb.snapshotData as any)?.eventCount ?? 0, icon: RefreshCw },
                        ].map(stat => {
                          const Icon = stat.icon;
                          return (
                            <div key={stat.label} className="bg-white/[0.03] rounded-lg p-2 text-center">
                              <Icon className="w-3 h-3 text-slate-500 mx-auto mb-1" />
                              <div className="text-sm font-bold text-white">{stat.value}</div>
                              <div className="text-[10px] text-slate-500">{stat.label}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/sandbox/flags?sandbox=${sb.id}`)}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs gap-1.5 h-8"
                          variant="outline"
                        >
                          <Zap className="w-3 h-3" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => copyUrl(sb.shareToken)}
                          variant="outline"
                          className="bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 border-white/10 text-xs gap-1.5 h-8"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create new card */}
              <button
                onClick={() => setCreateOpen(true)}
                className="rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all duration-200 flex flex-col items-center justify-center gap-3 p-8 text-slate-500 hover:text-emerald-400 min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">New Sandbox</div>
                  <div className="text-xs text-slate-600 mt-0.5">Isolated test environment</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[#111318] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
              Create Sandbox
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Create an isolated environment to safely test new features before global launch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Sandbox Name</label>
              <Input
                placeholder="e.g. v2-scoring-engine, feature/voice-input"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Description</label>
              <Textarea
                placeholder="What are you testing in this sandbox?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Environment</label>
              <div className="grid grid-cols-3 gap-2">
                {(["development", "staging", "production"] as const).map(env => (
                  <button
                    key={env}
                    onClick={() => setForm(f => ({ ...f, environment: env }))}
                    className={cn(
                      "py-2 rounded-lg text-xs font-semibold border transition-all capitalize",
                      form.environment === env
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20"
                    )}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1 bg-transparent border-white/10 text-slate-300 hover:bg-white/[0.06]">
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name.trim() || createMutation.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white"
              >
                {createMutation.isPending ? "Creating..." : "Create Sandbox"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
