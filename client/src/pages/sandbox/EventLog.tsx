import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FlaskConical,
  Info,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SEVERITY_CONFIG = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  debug: { icon: Bug, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", dot: "bg-purple-400" },
};

const EVENT_TYPE_ICONS: Record<string, any> = {
  "sandbox.created": Zap,
  "sandbox.reset": RefreshCw,
  "flag.created": CheckCircle2,
  "flag.updated": Activity,
  "test.created": Bug,
  "test.run": Activity,
  "ai_tester.run": Zap,
  "persona.created": CheckCircle2,
};

export default function EventLog() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sandboxIdFromUrl = params.get("sandbox") ? parseInt(params.get("sandbox")!) : null;

  const [selectedSandboxId, setSelectedSandboxId] = useState<number | null>(sandboxIdFromUrl);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [limit, setLimit] = useState(50);

  const utils = trpc.useUtils();
  const { data: sandboxes = [] } = trpc.sandbox.instances.list.useQuery();
  const { data: events = [], isLoading, isFetching } = trpc.sandbox.events.list.useQuery(
    {
      sandboxId: selectedSandboxId!,
      limit,
      severity: severityFilter !== "all" ? severityFilter as any : undefined,
    },
    { enabled: !!selectedSandboxId, refetchInterval: 10000 }
  );

  const filteredEvents = events.filter((e: any) =>
    !searchQuery ||
    e.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(e.payload).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const severityCounts = events.reduce((acc: Record<string, number>, e: any) => {
    acc[e.severity] = (acc[e.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#0d0f14] text-white">
        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#111318]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Event Log</h1>
                  <p className="text-sm text-slate-400">Full audit trail of every action in your sandbox environment</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Select value={selectedSandboxId?.toString() ?? ""} onValueChange={v => setSelectedSandboxId(parseInt(v))}>
                  <SelectTrigger className="w-40 sm:w-52 bg-white/[0.04] border-white/10 text-slate-200 text-sm">
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
                  variant="outline"
                  size="sm"
                  onClick={() => utils.sandbox.events.list.invalidate()}
                  disabled={isFetching}
                  className="bg-transparent border-white/10 text-slate-400 hover:bg-white/[0.06] gap-2"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isFetching && "animate-spin")} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {!selectedSandboxId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center mb-6">
                <Activity className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Sandbox</h3>
              <p className="text-slate-400 text-sm max-w-sm">Choose a sandbox to view its event log and audit trail.</p>
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
                {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={severity}
                      onClick={() => setSeverityFilter(severityFilter === severity ? "all" : severity)}
                      className={cn(
                        "rounded-xl p-3 border text-left transition-all duration-200",
                        severityFilter === severity ? config.bg : "bg-[#111318] border-white/[0.06] hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                        <span className={cn("text-xs font-semibold capitalize", config.color)}>{severity}</span>
                      </div>
                      <div className="text-xl font-bold text-white">{severityCounts[severity] ?? 0}</div>
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-600 text-sm h-9"
                  />
                </div>
                <Select value={limit.toString()} onValueChange={v => setLimit(parseInt(v))}>
                  <SelectTrigger className="w-32 bg-white/[0.04] border-white/10 text-slate-300 text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-white/10 text-slate-200">
                    <SelectItem value="25">Last 25</SelectItem>
                    <SelectItem value="50">Last 50</SelectItem>
                    <SelectItem value="100">Last 100</SelectItem>
                    <SelectItem value="200">Last 200</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-xs text-slate-500">
                  {filteredEvents.length} events
                </div>
              </div>

              {/* Event list */}
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />)}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-white/10">
                  <Activity className="w-10 h-10 text-slate-600 mb-3" />
                  <h3 className="text-base font-bold text-white mb-1">No events found</h3>
                  <p className="text-slate-500 text-sm">Events will appear here as actions are performed in this sandbox.</p>
                </div>
              ) : (
                <div className="rounded-2xl bg-[#111318] border border-white/[0.06] overflow-hidden">
                  {/* Table header — desktop only */}
                  <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-16">Severity</span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Event</span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">User</span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide w-36">Time</span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-white/[0.04]">
                    {filteredEvents.map((event: any) => {
                      const sev = SEVERITY_CONFIG[event.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info;
                      const SevIcon = sev.icon;
                      const EventIcon = EVENT_TYPE_ICONS[event.eventType] ?? Activity;
                      const isExpanded = expandedEvent === event.id;

                      return (
                        <div key={event.id}>
                          {/* Desktop row */}
                          <div
                            className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors items-center"
                            onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          >
                            <div className="w-16 flex items-center">
                              <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize", sev.bg, sev.color)}>
                                <SevIcon className="w-2.5 h-2.5" />
                                {event.severity}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <EventIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span className="text-sm font-mono text-slate-200 truncate">{event.eventType}</span>
                              {event.payload && Object.keys(event.payload).length > 0 && (
                                <span className="text-[10px] text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded font-mono truncate max-w-[200px]">
                                  {JSON.stringify(event.payload).slice(0, 60)}...
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 w-20 text-right">
                              {event.userId ? `User #${event.userId}` : "System"}
                            </div>
                            <div className="flex items-center gap-2 w-36 justify-end">
                              <span className="text-xs text-slate-500 font-mono">
                                {new Date(event.createdAt).toLocaleTimeString()}
                              </span>
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                            </div>
                          </div>
                          {/* Mobile card row */}
                          <div
                            className="sm:hidden flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
                            onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                          >
                            <span className={cn("flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize shrink-0 mt-0.5", sev.bg, sev.color)}>
                              <SevIcon className="w-2.5 h-2.5" />
                              {event.severity}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <EventIcon className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="text-xs font-mono text-slate-200 truncate">{event.eventType}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(event.createdAt).toLocaleString()} · {event.userId ? `User #${event.userId}` : "System"}
                              </div>
                            </div>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-600 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                          </div>

                          {/* Expanded payload */}
                          {isExpanded && (
                            <div className="px-4 pb-3 bg-white/[0.01]">
                              <div className="rounded-xl bg-[#0d0f14] border border-white/[0.06] p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span className="text-[11px] text-slate-500">
                                    {new Date(event.createdAt).toLocaleString()} · Event ID #{event.id}
                                  </span>
                                </div>
                                <pre className="text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(event.payload, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
