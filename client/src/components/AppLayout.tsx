import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Play,
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
    label: "Overview",
    items: [
      { href: "/", label: "Home", icon: Home, exact: true },
      { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/simulate", label: "Conversation Sim", icon: MessageSquare },
      { href: "/walkthroughs", label: "Tool Walkthroughs", icon: BookOpen },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
];

const ADMIN_NAV = [
  { href: "/admin/scenarios", label: "Scenario Builder", icon: Layers },
];

export default function AppLayout({ children, fullscreen }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.51 0.23 264)" }}>
            <Zap size={16} color="white" className="animate-pulse" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">Loading Agent Forge...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-white border border-border rounded-2xl p-10 shadow-sm max-w-sm w-full mx-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: "oklch(0.51 0.23 264)" }}>
            <Zap size={24} color="white" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">Welcome to Agent Forge</h2>
          <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
            AI-powered practice simulations for communication and tool walkthroughs.
          </p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "oklch(0.51 0.23 264)" }}
          >
            Sign in to continue
          </a>
        </div>
      </div>
    );
  }

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
        className="flex items-center gap-2.5 px-3 border-b"
        style={{ borderColor: "var(--sidebar-border)", height: 56, minHeight: 56 }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 32, height: 32, background: "oklch(0.51 0.23 264)" }}
        >
          <Zap size={15} color="white" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-bold text-sm tracking-tight" style={{ color: "oklch(0.97 0.01 264)" }}>
            Agent Forge
          </span>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto rounded-md p-1 transition-colors"
            style={{ color: "oklch(0.5 0.03 264)" }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {(!collapsed || mobile) && (
              <div className="section-label">{section.label}</div>
            )}
            {section.items.map((item) => {
              const isActive = item.exact
                ? location === item.href
                : location === item.href || location.startsWith(item.href + "/");
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
        ))}

        {/* Admin section */}
        {isAdmin && (
          <div>
            {(!collapsed || mobile) && (
              <div className="section-label flex items-center gap-1">
                <Shield size={9} style={{ color: "oklch(0.62 0.18 47)" }} />
                Admin
              </div>
            )}
            {ADMIN_NAV.map((item) => {
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
        )}

        {/* Quick start CTA */}
        {(!collapsed || mobile) && (
          <div>
            <div className="section-label">Quick Start</div>
            <Link href="/simulate" onClick={() => setMobileOpen(false)}>
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: "oklch(0.51 0.23 264 / 0.15)",
                  color: "oklch(0.72 0.18 264)",
                  border: "1px solid oklch(0.51 0.23 264 / 0.25)",
                }}
              >
                <Play size={13} />
                Start a Simulation
              </div>
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="border-t p-2" style={{ borderColor: "var(--sidebar-border)" }}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg" style={{ background: "oklch(0.225 0.05 264)" }}>
            <div
              className="flex items-center justify-center rounded-full text-xs font-bold shrink-0"
              style={{ width: 28, height: 28, background: "oklch(0.51 0.23 264)", color: "white" }}
            >
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate" style={{ color: "oklch(0.92 0.01 264)" }}>
                {user?.name || "User"}
              </div>
              <div className="text-[10px] truncate" style={{ color: "oklch(0.52 0.03 264)" }}>
                {user?.email || ""}
              </div>
            </div>
            <button onClick={() => logout()} title="Sign out" className="p-1 rounded transition-opacity hover:opacity-70">
              <LogOut size={13} style={{ color: "oklch(0.52 0.03 264)" }} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => logout()}
            className="nav-item w-full justify-center"
            title="Sign out"
          >
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
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-10">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-border shrink-0">
          <button
            className="p-2 rounded-lg border border-border"
            onClick={() => setMobileOpen(true)}
          >
            <div className="flex flex-col gap-1">
              <div className="w-4 h-0.5 bg-foreground rounded" />
              <div className="w-4 h-0.5 bg-foreground rounded" />
              <div className="w-3 h-0.5 bg-foreground rounded" />
            </div>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.51 0.23 264)" }}>
              <Zap size={13} color="white" />
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
