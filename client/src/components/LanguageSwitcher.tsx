import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  /** compact = icon + code only (for sidebar); full = flag + name (for nav/dropdown) */
  variant?: "compact" | "full";
  className?: string;
}

export default function LanguageSwitcher({ variant = "full", className = "" }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    // Set dir on root for RTL support
    const isRtl = SUPPORTED_LANGUAGES.find((l) => l.code === code)?.rtl ?? false;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = code;
    setOpen(false);
  };

  // Sync dir on mount
  useEffect(() => {
    const isRtl = current?.rtl ?? false;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, []);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-border bg-white hover:bg-gray-50 transition-colors"
        aria-label="Change language"
      >
        <Globe size={13} className="text-muted-foreground shrink-0" />
        {variant === "compact" ? (
          <span className="text-foreground uppercase">{current.code}</span>
        ) : (
          <span className="text-foreground">{current.flag} {current.label}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div className="absolute z-50 mt-1 end-0 w-44 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors text-start ${
                  lang.code === i18n.language ? "bg-gray-50 font-semibold text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
                {lang.code === i18n.language && (
                  <span className="ms-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
