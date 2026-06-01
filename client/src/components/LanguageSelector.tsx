import { useState, useMemo } from "react";
import { Globe, Search, ChevronDown, Video, MessageSquare } from "lucide-react";
import { LANGUAGES, type Language } from "../../../shared/languages";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  /** If true, only show Tier 1 languages (video-compatible) */
  videoOnly?: boolean;
  /** Channel context — affects which disclaimer to show */
  channel?: "chat" | "email" | "phone" | "video";
  className?: string;
}

export function LanguageSelector({
  value,
  onChange,
  videoOnly = false,
  channel,
  className = "",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const available = videoOnly ? LANGUAGES.filter((l) => l.tier === 1) : LANGUAGES;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return available;
    return available.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search, available]);

  const selected = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background hover:bg-muted transition-colors text-sm font-medium w-full"
      >
        <Globe size={15} className="text-muted-foreground flex-shrink-0" />
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="flex-1 text-left truncate">{selected.name}</span>
        {selected.tier === 1 && channel === "video" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex-shrink-0">
            Video ✓
          </span>
        )}
        <ChevronDown size={14} className={`text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                <Search size={13} className="text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search languages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Channel disclaimer */}
            {!videoOnly && (
              <div className="px-3 py-2 border-b border-border bg-muted/40">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={11} />
                    Chat / Email / Phone: <strong className="text-foreground">35 languages</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Video size={11} />
                    Video: <strong className="text-foreground">17 languages</strong>
                  </span>
                </div>
              </div>
            )}

            {/* Language list */}
            <div className="max-h-64 overflow-y-auto">
              {/* Tier 1 group */}
              {!videoOnly && (
                <div className="px-3 pt-2 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    All channels incl. Video (17)
                  </p>
                </div>
              )}
              {filtered
                .filter((l) => l.tier === 1)
                .map((lang) => (
                  <LanguageOption
                    key={lang.code}
                    lang={lang}
                    selected={value === lang.code}
                    onSelect={(code) => { onChange(code); setOpen(false); setSearch(""); }}
                    showVideoTag
                  />
                ))}

              {/* Tier 2 group — only when not videoOnly */}
              {!videoOnly && filtered.filter((l) => l.tier === 2).length > 0 && (
                <>
                  <div className="px-3 pt-3 pb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Chat / Email / Phone only (18)
                    </p>
                  </div>
                  {filtered
                    .filter((l) => l.tier === 2)
                    .map((lang) => (
                      <LanguageOption
                        key={lang.code}
                        lang={lang}
                        selected={value === lang.code}
                        onSelect={(code) => { onChange(code); setOpen(false); setSearch(""); }}
                      />
                    ))}
                </>
              )}

              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No languages match "{search}"
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LanguageOption({
  lang,
  selected,
  onSelect,
  showVideoTag,
}: {
  lang: Language;
  selected: boolean;
  onSelect: (code: string) => void;
  showVideoTag?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lang.code)}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted transition-colors text-left ${
        selected ? "bg-primary/8 font-semibold" : ""
      }`}
    >
      <span className="text-xl leading-none w-7 text-center flex-shrink-0">{lang.flag}</span>
      <span className="flex-1 min-w-0">
        <span className="block truncate">{lang.name}</span>
        <span className="block text-[11px] text-muted-foreground truncate">{lang.nativeName}</span>
      </span>
      {showVideoTag && lang.tier === 1 && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium flex-shrink-0 border border-emerald-200">
          Video
        </span>
      )}
      {selected && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
    </button>
  );
}
