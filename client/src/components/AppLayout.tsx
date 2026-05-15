import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Bot,
  ChevronRight,
  Cpu,
  FlaskConical,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Layers,
  LogOut,
  MessageSquare,
  Microscope,
  ScrollText,
  Settings,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface AppLayoutProps {
  children: React.ReactNode;
  fullscreen?: boolean;
}

const TRAINING_NAV = [
  { href: "/dashboard",    label: "Dashboard",       icon: LayoutDashboard },
  { href: "/simulate",     label: "Simulate",        icon: MessageSquare },
  { href: "/walkthroughs", label: "Walkthroughs",    icon: Layers },
  { href: "/courses",      label: "Courses",         icon: BookOpen },
  { href: "/analytics",    label: "Analytics",       icon: BarChart3 },
  { href: "/leaderboard",  label: "Leaderboard",     icon: Trophy },
];

const SANDBOX_NAV = [
  { href: "/sandbox",           label: "Sandbox Hub",   icon: Cpu },
  { href: "/sandbox/flags",     label: "Feature Flags", icon: Zap },
  { href: "/sandbox/ai-tester", label: "AI Tester",     icon: Microscope },
  { href: "/sandbox/tests",     label: "Test Runner",   icon: Terminal },
  { href: "/sandbox/personas",  label: "Persona Lab",   icon: Bot },
  { href: "/sandbox/events",    label: "Event Log",     icon: ScrollText },
];

export default function AppLayout({ children, fullscreen }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState<"training" | "sandbox">(() =>
    location.startsWith("/sandbox") ? "sandbox" : "training"
  );

  const { data: myStats } = trpc.leaderboard.myStreak.useQuery(undefined, { enabled: isAuthenticated });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs text-slate-500 font-mono tracking-wider">LOADING AGENT FORGE</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Forge</h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            AI-powered practice simulation and engineering sandbox for world-class teams.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            <Sparkles className="w-4 h-4" />
            Sign in to continue
          </a>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/sandbox"
      ? location === "/sandbox"
      : location === href || location.startsWith(href + "/");

  const navItems = activeSection === "training" ? TRAINING_NAV : SANDBOX_NAV;
  const accentClass = activeSection === "training"
    ? "bg-violet-500/10 text-violet-200 border-l-2 border-violet-400"
    : "bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-400";

  const sidebar = (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[#111318] border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">Agent Forge</div>
            <div className="text-[10px] text-slate-600 font-mono">AI Practice Platform</div>
          </div>
        </Link>
      </div>

      {/* Pillar Switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0d0f14]">
          <button
            onClick={() => setActiveSection("training")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all",
              activeSection === "training"
                ? "bg-violet-500/15 text-violet-300 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Training
          </button>
          <button
            onClick={() => setActiveSection("sandbox")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all",
              activeSection === "sandbox"
                ? "bg-emerald-500/15 text-emerald-300 shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Sandbox
          </button>
        </div>
      </div>

      {/* Section header */}
      <div className="px-4 pt-4 pb-1">
        <div className={cn(
          "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
          activeSection === "training" ? "text-violet-500" : "text-emerald-500"
        )}>
          {activeSection === "training"
            ? <><GraduationCap className="w-3 h-3" /> Training</>
            : <><FlaskConical className="w-3 h-3" /> Product Sandbox</>
          }
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? cn(accentClass, "pl-[10px]")
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-40" />}
            </Link>
          );
        })}

        {/* Admin section */}
        {user?.role === "admin" && activeSection === "training" && (
          <>
            <div className="pt-4 pb-1 px-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-600">
                <Shield className="w-3 h-3" /> Admin
              </div>
            </div>
            {[
              { href: "/admin/scenarios", label: "Scenario Builder", icon: Settings },
              { href: "/admin/users",     label: "User Management",  icon: Users },
            ].map(item => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-orange-500/10 text-orange-200 border-l-2 border-orange-400 pl-[10px]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Streak + User */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {myStats && myStats.streakDays > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-orange-300">{myStats.streakDays} day streak</div>
              <div className="text-[10px] text-orange-600">Keep it up!</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group cursor-default">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {(user?.name ?? "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.name ?? "User"}</div>
            <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
          </div>
          <button
            onClick={() => logout()}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-500 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  if (fullscreen) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0d0f14]">
        <div className="hidden md:flex shrink-0">{sidebar}</div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0f14]">
      <div className="hidden md:flex shrink-0">{sidebar}</div>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
