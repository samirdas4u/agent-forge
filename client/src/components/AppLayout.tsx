import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  BookOpen,
  Brain,
  ChevronLeft,
  ChevronRight,
  Flame,
  GraduationCap,
  LayoutGrid,
  Layers,
  LogOut,
  MessageSquare,
  Shield,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
  fullscreen?: boolean;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/dashboard",    label: "Dashboard",       icon: LayoutGrid },
      { href: "/simulate",     label: "Conversation Sim", icon: MessageSquare },
      { href: "/walkthroughs", label: "Walkthroughs",    icon: BookOpen },
      { href: "/courses",      label: "Courses",         icon: GraduationCap },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics",   label: "Analytics",   icon: BarChart3 },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
];

export default function AppLayout({ children, fullscreen }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}>
            <Brain size={22} color="white" />
          </div>
          <div className="flex gap-1.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="bg-white border border-border rounded-2xl p-10 shadow-sm max-w-sm w-full mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}>
            <Brain size={24} color="white" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">Welcome to Agent Forge</h2>
          <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
            AI-powered practice simulations for communication mastery and tool walkthroughs.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
          >
            Sign in to continue
          </a>
        </div>
      </div>
    );
  }

  const userInitial = (user?.name || user?.email || "U")[0].toUpperCase();
  const streakDays = (user as any)?.streakDays ?? 0;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className="flex flex-col h-full transition-all duration-200"
      style={{
        width: mobile ? "100%" : collapsed ? 64 : 240,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-3 border-b shrink-0"
        style={{ borderColor: "var(--sidebar-border)", height: 58, minHeight: 58 }}
      >
        <div
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 34, height: 34, background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}
        >
          <Brain size={16} color="white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-none" style={{ color: "oklch(0.95 0.01 260)" }}>
              Agent Forge
            </p>
            <p className="text-[10px] mt-0.5 font-medium" style={{ color: "oklch(0.42 0.02 260)" }}>
              AI Practice Platform
            </p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-md transition-colors"
            style={{ color: "oklch(0.42 0.02 260)" }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}
      </div>

      {/* Streak banner */}
      {streakDays > 0 && (!collapsed || mobile) && (
        <div
          className="mx-3 mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ background: "oklch(0.72 0.18 75 / 0.1)", border: "1px solid oklch(0.72 0.18 75 / 0.18)" }}
        >
          <Flame size={14} style={{ color: "oklch(0.72 0.18 75)" }} />
          <span className="text-xs font-semibold" style={{ color: "oklch(0.80 0.14 75)" }}>
            {streakDays} day streak 🔥
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {(!collapsed || mobile) && (
              <div className="section-label">{section.label}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div
                      className={`nav-item ${isActive ? "active" : ""}`}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      <item.icon size={15} className="shrink-0" />
                      {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                      {isActive && (!collapsed || mobile) && <ChevronRight size={12} className="ml-auto opacity-50" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div>
            {(!collapsed || mobile) && (
              <div className="section-label flex items-center gap-1">
                <Shield size={9} style={{ color: "oklch(0.62 0.18 47)" }} />
                Admin
              </div>
            )}
            <div className="space-y-0.5">
              {[{ href: "/admin/scenarios", label: "Scenario Builder", icon: Layers }].map((item) => {
                const isActive = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div
                      className={`nav-item ${isActive ? "active" : ""}`}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      <item.icon size={15} className="shrink-0" />
                      {(!collapsed || mobile) && <span className="truncate">{item.label}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick start */}
        {(!collapsed || mobile) && (
          <div>
            <div className="section-label">Quick Start</div>
            <Link href="/simulate" onClick={() => setMobileOpen(false)}>
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, oklch(0.52 0.26 272 / 0.18), oklch(0.65 0.22 300 / 0.12))",
                  color: "oklch(0.78 0.18 272)",
                  border: "1px solid oklch(0.52 0.26 272 / 0.22)",
                }}
              >
                <Zap size={13} />
                Start a Simulation
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-2 shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
        {(!collapsed || mobile) ? (
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
            style={{ background: "oklch(0.19 0.035 265)" }}
          >
            <div
              className="flex items-center justify-center rounded-lg text-xs font-bold shrink-0"
              style={{ width: 30, height: 30, background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))", color: "white" }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: "oklch(0.90 0.01 260)" }}>
                {user?.name || "User"}
              </div>
              <div className="text-[10px] truncate" style={{ color: "oklch(0.45 0.02 260)" }}>
                {user?.role === "admin" ? "Admin" : "Learner"}
              </div>
            </div>
            <button onClick={() => logout()} title="Sign out" className="p-1 rounded-lg transition-opacity hover:opacity-70">
              <LogOut size={13} style={{ color: "oklch(0.45 0.02 260)" }} />
            </button>
          </div>
        ) : (
          <button onClick={() => logout()} className="nav-item w-full justify-center" title="Sign out">
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );

  if (fullscreen) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex shrink-0">
          <SidebarContent />
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex shrink-0">
        <SidebarContent />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-10">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-border shrink-0">
          <button className="p-2 rounded-lg border border-border" onClick={() => setMobileOpen(true)}>
            <div className="flex flex-col gap-1">
              <div className="w-4 h-0.5 bg-foreground rounded" />
              <div className="w-4 h-0.5 bg-foreground rounded" />
              <div className="w-3 h-0.5 bg-foreground rounded" />
            </div>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.52 0.26 272), oklch(0.65 0.22 300))" }}>
              <Brain size={13} color="white" />
            </div>
            <span className="font-bold text-sm text-foreground">Agent Forge</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
