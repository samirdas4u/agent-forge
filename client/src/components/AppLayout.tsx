import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Cpu,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Play,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
  fullscreen?: boolean;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scenarios", label: "Simulations", icon: MessageSquare },
  { href: "/walkthroughs", label: "Walkthroughs", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AppLayout({ children, fullscreen }: AppLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen blueprint-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 animate-pulse" style={{ color: "var(--cyan)" }} />
          <span className="mono text-sm text-muted-foreground">Initializing Agent Forge...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen blueprint-bg flex items-center justify-center">
        <div className="bg-white border border-border rounded-lg p-8 shadow-sm max-w-sm w-full mx-4 text-center">
          <Cpu className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--cyan)" }} />
          <h2 className="text-xl font-bold mb-2">Sign in to continue</h2>
          <p className="text-muted-foreground text-sm mb-6">Access your practice sessions, progress, and analytics.</p>
          <a
            href={getLoginUrl()}
            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <User className="w-4 h-4" />
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        "flex flex-col h-full",
        mobile ? "w-full" : "w-60"
      )}
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--cyan)" }}>
          <Cpu className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide" style={{ color: "var(--sidebar-foreground)" }}>AGENT FORGE</div>
          <div className="text-xs mono" style={{ color: "oklch(0.6 0.02 240)" }}>v1.0 · practice engine</div>
        </div>
        {mobile && (
          <button className="ml-auto p-1 rounded" onClick={() => setMobileOpen(false)}>
            <X className="w-4 h-4" style={{ color: "var(--sidebar-foreground)" }} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1.5 mb-2">
          <span className="text-xs mono font-medium uppercase tracking-widest" style={{ color: "oklch(0.45 0.02 240)" }}>
            Navigation
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer transition-all",
                  active ? "font-medium" : "hover:opacity-80"
                )}
                style={{
                  background: active ? "var(--sidebar-accent)" : "transparent",
                  color: active ? "var(--sidebar-foreground)" : "oklch(0.7 0.015 240)",
                  borderLeft: active ? "3px solid var(--cyan)" : "3px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </div>
            </Link>
          );
        })}

        <div className="px-2 py-1.5 mt-4 mb-2">
          <span className="text-xs mono font-medium uppercase tracking-widest" style={{ color: "oklch(0.45 0.02 240)" }}>
            Quick Start
          </span>
        </div>
        <Link href="/scenarios" onClick={() => setMobileOpen(false)}>
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm cursor-pointer hover:opacity-80 transition-all"
            style={{ color: "var(--cyan)", background: "oklch(0.18 0.02 200 / 0.3)" }}
          >
            <Play className="w-4 h-4" />
            <span>Start Practice</span>
          </div>
        </Link>
      </nav>

      {/* User */}
      <div className="border-t p-3" style={{ borderColor: "var(--sidebar-border)" }}>
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--cyan)", color: "white" }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: "var(--sidebar-foreground)" }}>
              {user?.name ?? "User"}
            </div>
            <div className="text-xs truncate" style={{ color: "oklch(0.5 0.02 240)" }}>
              {user?.email ?? ""}
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded hover:opacity-70 transition-opacity flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: "oklch(0.5 0.02 240)" }} />
          </button>
        </div>
      </div>
    </aside>
  );

  if (fullscreen) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
          <button
            className="p-1.5 rounded-md border border-border"
            onClick={() => setMobileOpen(true)}
          >
            <div className="w-4 h-3 flex flex-col justify-between">
              <div className="h-0.5 bg-foreground rounded" />
              <div className="h-0.5 bg-foreground rounded" />
              <div className="h-0.5 bg-foreground rounded" />
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5" style={{ color: "var(--cyan)" }} />
            <span className="font-bold text-sm">AGENT FORGE</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto blueprint-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
