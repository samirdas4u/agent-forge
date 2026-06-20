import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  ArrowRight, Brain, ChevronDown, ChevronRight, Folder, FolderOpen,
  Mail, MessageSquare, Mic, Phone, Play, Plus, Search, SlidersHorizontal, Zap
} from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

// ── Constants ──────────────────────────────────────────────────
const CATEGORIES = ["all", "sales", "customer_service", "interview", "negotiation", "presentation"];
const CHANNELS = ["all", "text", "email", "phone"] as const;
type ChannelFilter = typeof CHANNELS[number];
const CHANNEL_FILTER_LABELS: Record<ChannelFilter, string> = {
  all: "All channels", text: "Chat", email: "Email", phone: "Phone",
};
const CHANNEL_FILTER_ICONS: Record<ChannelFilter, React.ReactNode> = {
  all: null,
  text: <MessageSquare size={12} />,
  email: <Mail size={12} />,
  phone: <Phone size={12} />,
};
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All", sales: "Sales", customer_service: "Customer Service",
  interview: "Interview", negotiation: "Negotiation", presentation: "Presentation",
};

const DIFF_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  beginner:     { label: "Easy",   bg: "oklch(0.95 0.07 162)", color: "oklch(0.35 0.14 162)" },
  intermediate: { label: "Medium", bg: "oklch(0.97 0.07 80)",  color: "oklch(0.42 0.16 70)"  },
  advanced:     { label: "Hard",   bg: "oklch(0.97 0.05 27)",  color: "oklch(0.48 0.20 27)"  },
};

const CHANNEL_META: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string }> = {
  text:  { icon: <MessageSquare size={11} />, label: "Chat",  bg: "oklch(0.95 0.04 264)", color: "oklch(0.45 0.18 264)" },
  voice: { icon: <Mic size={11} />,           label: "Voice", bg: "oklch(0.95 0.05 162)", color: "oklch(0.38 0.14 162)" },
  email: { icon: <Mail size={11} />,          label: "Email", bg: "oklch(0.97 0.04 75)",  color: "oklch(0.45 0.14 60)"  },
  phone: { icon: <Phone size={11} />,         label: "Phone", bg: "oklch(0.97 0.04 27)",  color: "oklch(0.48 0.18 27)"  },
};

const LANG_DISPLAY: Record<string, { flag: string; label: string }> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.code, { flag: l.flag, label: l.label }])
);

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ── Scenario row ──────────────────────────────────────────────
function ScenarioRow({ scenario, onStart, isPending }: {
  scenario: any;
  onStart: (id: number) => void;
  isPending: boolean;
}) {
  const { i18n } = useTranslation();
  const diffStyle = DIFF_STYLES[scenario.difficulty] ?? DIFF_STYLES.beginner;
  const channel = scenario.channel ?? "text";
  const channelMeta = CHANNEL_META[channel] ?? CHANNEL_META.text;
  const langInfo = scenario.languageLock ? LANG_DISPLAY[scenario.languageLock] : null;
  const uiLang = LANG_DISPLAY[i18n.language];
  const personaInitial = scenario.aiPersona?.[0]?.toUpperCase() ?? "A";
  const personaName = scenario.aiPersona?.split(",")[0] ?? "AI Persona";

  return (
    <div
      className="group flex sm:grid sm:grid-cols-[2fr_100px_90px_130px_160px_100px] gap-3 sm:gap-4 items-center px-4 sm:px-6 py-3.5 transition-colors cursor-pointer bg-white hover:bg-[oklch(0.97_0.008_264)]"
      onClick={() => onStart(scenario.id)}
    >
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-snug transition-colors" style={{ color: 'oklch(0.12 0.025 260)' }} onMouseEnter={e => (e.currentTarget.style.color='oklch(0.51 0.23 264)')} onMouseLeave={e => (e.currentTarget.style.color='oklch(0.12 0.025 260)')}>
          {scenario.title}
        </p>
        {/* Mobile-only meta */}
        <div className="flex items-center gap-2 mt-0.5 sm:hidden flex-wrap">
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: channelMeta.bg, color: channelMeta.color }}
          >
            {channelMeta.icon}{channelMeta.label}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: diffStyle.bg, color: diffStyle.color }}
          >
            {diffStyle.label}
          </span>
          {(langInfo ?? uiLang) && (
            <span className="text-[11px]">{(langInfo ?? uiLang)?.flag}</span>
          )}
        </div>
      </div>

      {/* Channel badge — desktop */}
      <div className="hidden sm:flex items-center">
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md"
          style={{ background: channelMeta.bg, color: channelMeta.color }}
        >
          {channelMeta.icon}
          {channelMeta.label}
        </span>
      </div>

      {/* Difficulty — desktop */}
      <div className="hidden sm:flex items-center">
        <span
          className="text-[11px] font-bold px-2 py-1 rounded-md"
          style={{ background: diffStyle.bg, color: diffStyle.color }}
        >
          {diffStyle.label}
        </span>
      </div>

      {/* Language — desktop */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-base leading-none">
          {langInfo ? langInfo.flag : (uiLang?.flag ?? "🌐")}
        </span>
        <span className="text-xs truncate" style={{ color: 'oklch(0.50 0.025 260)' }}>
          {langInfo ? langInfo.label : (uiLang?.label ?? "English")}
        </span>
      </div>

      {/* AI Persona — desktop */}
      <div className="hidden sm:flex items-center gap-2">
        {scenario.personaAvatarUrl ? (
          <img
            src={scenario.personaAvatarUrl}
            alt={personaName}
            className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "oklch(0.51 0.23 264)" }}
          >
            {personaInitial}
          </div>
        )}
        <span className="text-xs font-medium truncate" style={{ color: 'oklch(0.25 0.025 260)' }}>{personaName}</span>
      </div>

      {/* Created + Start button — desktop */}
      <div className="hidden sm:flex items-center justify-end gap-3">
        <span className="text-xs whitespace-nowrap" style={{ color: 'oklch(0.55 0.025 260)' }}>
          {timeAgo(scenario.createdAt)}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onStart(scenario.id); }}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
          style={{ background: "oklch(0.51 0.23 264)" }}
        >
          <Play size={11} />
          Start
        </button>
      </div>

      {/* Mobile: arrow */}
      <ArrowRight size={14} className="sm:hidden shrink-0 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
    </div>
  );
}

// ── Folder group ──────────────────────────────────────────────
function FolderGroup({ name, scenarios, onStart, isPending }: {
  name: string;
  scenarios: any[];
  onStart: (id: number) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border last:border-b-0">
      {/* Folder header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 sm:px-6 py-2.5 transition-colors text-left" style={{ background: 'oklch(0.965 0.008 264)', borderBottom: '1px solid oklch(0.905 0.012 260)' }}
      >
        {open
          ? <FolderOpen size={14} style={{ color: "oklch(0.51 0.23 264)" }} />
          : <Folder size={14} style={{ color: "oklch(0.51 0.23 264)" }} />
        }
        <span className="text-xs font-bold tracking-wide" style={{ color: 'oklch(0.20 0.025 260)' }}>{name}</span>
        <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.95 0.04 264)", color: "oklch(0.45 0.18 264)" }}>
          {scenarios.length}
        </span>
        <span className="ml-auto">
          {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
        </span>
      </button>
      {/* Rows */}
      {open && (
        <div className="divide-y divide-border/60">
          {scenarios.map((s) => (
            <ScenarioRow key={s.id} scenario={s} onStart={onStart} isPending={isPending} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export default function Scenarios() {
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [language, setLanguage] = useState("all");
  const [folder, setFolder] = useState("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [groupByFolder, setGroupByFolder] = useState(true);
  // practiceLanguage: the language the AI will use in the session (separate from the scenario filter)
  const [practiceLanguage, setPracticeLanguage] = useState("en");

  const { data: scenarios, isLoading } = trpc.scenarios.list.useQuery(
    { category: category !== "all" ? category : undefined, difficulty: difficulty !== "all" ? difficulty as any : undefined },
    { staleTime: 60_000 }
  );

  const createSession = trpc.sessions.create.useMutation({
    onSuccess: (data) => navigate(`/simulate/${data.sessionId}`),
    onError: () => toast.error("Failed to start session. Please try again."),
  });

  // Collect unique folder names
  const folders = useMemo(() => {
    const names = new Set<string>();
    scenarios?.forEach((s: any) => { if (s.folder) names.add(s.folder); });
    return Array.from(names).sort();
  }, [scenarios]);

  const filtered = useMemo(() => {
    return (scenarios ?? []).filter((s: any) => {
      const matchesSearch = search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.aiPersona?.toLowerCase().includes(search.toLowerCase());
      const matchesLanguage = language === "all" ? true
        : language === "none" ? !s.languageLock
        : s.languageLock === language;
      const matchesFolder = folder === "all" ? true
        : folder === "none" ? !s.folder
        : s.folder === folder;
      const matchesChannel = channelFilter === "all" ? true
        : channelFilter === "text" ? (!s.channel || s.channel === "text")
        : s.channel === channelFilter;
      return matchesSearch && matchesLanguage && matchesFolder && matchesChannel;
    });
  }, [scenarios, search, language, folder, channelFilter]);

  // Group by folder when enabled
  const grouped = useMemo(() => {
    if (!groupByFolder || folders.length === 0) return null;
    const map: Record<string, any[]> = {};
    const ungrouped: any[] = [];
    filtered.forEach((s: any) => {
      if (s.folder) {
        if (!map[s.folder]) map[s.folder] = [];
        map[s.folder].push(s);
      } else {
        ungrouped.push(s);
      }
    });
    return { map, ungrouped };
  }, [filtered, groupByFolder, folders]);

  const handleStart = (scenarioId: number) => {
    createSession.mutate({ scenarioId, language: practiceLanguage });
  };

  return (
     <AppLayout>
          <div className="flex-1 flex flex-col min-h-0">

        {/* ── Page header ── */}
        <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b bg-white" style={{ borderColor: 'oklch(0.905 0.012 260)' }}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'oklch(0.12 0.025 260)' }}>Simulations</h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'oklch(0.50 0.025 260)' }}>
                {filtered.length} simulation{filtered.length !== 1 ? "s" : ""} available
                {folders.length > 0 && ` · ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Group by folder toggle */}
              {folders.length > 0 && (
                <button
                  onClick={() => setGroupByFolder((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                  style={groupByFolder
                    ? { background: "oklch(0.95 0.04 264)", borderColor: "oklch(0.85 0.08 264)", color: "oklch(0.45 0.18 264)" }
                    : { background: "transparent", borderColor: "oklch(0.91 0.012 264)", color: "oklch(0.55 0.02 264)" }
                  }
                >
                  <Folder size={13} />
                  <span className="hidden sm:inline">Folders</span>
                </button>
              )}
              <button
                onClick={() => navigate("/admin/scenarios")}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "oklch(0.51 0.23 264)" }}
              >
                <Plus size={14} />
                <span className="hidden sm:inline">New simulation</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Search + filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search simulations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Channel filter chips */}
            <div className="hidden sm:flex items-center gap-1 flex-wrap">
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={channelFilter === ch
                    ? { background: "oklch(0.51 0.23 264)", color: "white" }
                    : { background: "oklch(0.97 0.005 264)", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
                  }
                >
                  {CHANNEL_FILTER_ICONS[ch]}
                  {CHANNEL_FILTER_LABELS[ch]}
                </button>
              ))}
            </div>

            {/* Category pills — desktop */}
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={category === c
                    ? { background: "oklch(0.51 0.23 264)", color: "white" }
                    : { background: "oklch(0.97 0.005 264)", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
                  }
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-2.5 py-2 rounded-lg text-xs font-medium bg-white border border-border text-foreground focus:outline-none"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All levels" : d === "beginner" ? "Easy" : d === "intermediate" ? "Medium" : "Hard"}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2.5 py-2 rounded-lg text-xs font-medium bg-white border border-border text-foreground focus:outline-none"
            >
              <option value="all">🌐 All languages</option>
              <option value="none">Any language</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
              ))}
            </select>

            {/* Folder filter — only shown when folders exist */}
            {folders.length > 0 && (
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="px-2.5 py-2 rounded-lg text-xs font-medium bg-white border border-border text-foreground focus:outline-none"
              >
                <option value="all">📁 All folders</option>
                <option value="none">No folder</option>
                {folders.map((f) => (
                  <option key={f} value={f}>📁 {f}</option>
                ))}
              </select>
            )}

            {/* Practice language selector */}
            <div className="hidden sm:block">
              <LanguageSelector
                value={practiceLanguage}
                onChange={setPracticeLanguage}
                className="w-48"
              />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="sm:hidden p-2 rounded-lg border border-border bg-white"
            >
              <SlidersHorizontal size={14} className="text-muted-foreground" />
            </button>
          </div>

          {/* Mobile filter pills */}
          {showFilters && (
            <div className="flex flex-col gap-2 mt-3 sm:hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-14 shrink-0">Channel</span>
                {CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={channelFilter === ch
                      ? { background: "oklch(0.51 0.23 264)", color: "white" }
                      : { background: "oklch(0.97 0.005 264)", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
                    }
                  >
                    {CHANNEL_FILTER_ICONS[ch]}
                    {CHANNEL_FILTER_LABELS[ch]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-14 shrink-0">Category</span>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={category === c
                      ? { background: "oklch(0.51 0.23 264)", color: "white" }
                      : { background: "oklch(0.97 0.005 264)", color: "oklch(0.40 0.025 260)", border: "1px solid oklch(0.905 0.012 260)" }
                    }
                  >
                    {CATEGORY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile: practice language selector */}
          <div className="sm:hidden mt-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">Practice in</span>
              <LanguageSelector
                value={practiceLanguage}
                onChange={setPracticeLanguage}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.04 264)" }}>
                <Brain size={26} style={{ color: "oklch(0.51 0.23 264)" }} />
              </div>
              <p className="font-bold mb-1" style={{ color: 'oklch(0.12 0.025 260)' }}>No simulations found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          ) : grouped && Object.keys(grouped.map).length > 0 ? (
            /* Folder-grouped view */
            <div>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[2fr_100px_90px_130px_160px_100px] gap-4 px-6 py-2.5 border-b text-[11px] font-bold uppercase tracking-widest" style={{ borderColor: 'oklch(0.905 0.012 260)', background: 'oklch(0.97 0.005 260)', color: 'oklch(0.50 0.025 260)' }}>
                <span>Name</span>
                <span>Scenario</span>
                <span>Difficulty</span>
                <span>Language</span>
                <span>AI Persona</span>
                <span className="text-right">Created</span>
              </div>
              {/* Folder groups */}
              {Object.entries(grouped.map).map(([folderName, items]) => (
                <FolderGroup
                  key={folderName}
                  name={folderName}
                  scenarios={items}
                  onStart={handleStart}
                  isPending={createSession.isPending}
                />
              ))}
              {/* Ungrouped scenarios */}
              {grouped.ungrouped.length > 0 && (
                <FolderGroup
                  name="Other"
                  scenarios={grouped.ungrouped}
                  onStart={handleStart}
                  isPending={createSession.isPending}
                />
              )}
            </div>
          ) : (
            /* Flat list view */
            <>
              <div className="hidden sm:grid grid-cols-[2fr_100px_90px_130px_160px_100px] gap-4 px-6 py-2.5 border-b text-[11px] font-bold uppercase tracking-widest" style={{ borderColor: 'oklch(0.905 0.012 260)', background: 'oklch(0.97 0.005 260)', color: 'oklch(0.50 0.025 260)' }}>
                <span>Name</span>
                <span>Scenario</span>
                <span>Difficulty</span>
                <span>Language</span>
                <span>AI Persona</span>
                <span className="text-right">Created</span>
              </div>
              <div className="divide-y" style={{ borderColor: 'oklch(0.905 0.012 260)' }}>
                {filtered.map((s: any) => (
                  <ScenarioRow key={s.id} scenario={s} onStart={handleStart} isPending={createSession.isPending} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
