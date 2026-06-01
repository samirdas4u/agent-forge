import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Flame, Medal, Star, Trophy, TrendingUp, Users, Zap } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const RANK_STYLES = [
  { bg: "oklch(0.95 0.08 80)", color: "oklch(0.45 0.18 60)", border: "oklch(0.88 0.1 80)", icon: "🥇" },
  { bg: "oklch(0.96 0.02 264)", color: "oklch(0.45 0.08 264)", border: "oklch(0.88 0.04 264)", icon: "🥈" },
  { bg: "oklch(0.97 0.04 47)", color: "oklch(0.45 0.12 47)", border: "oklch(0.9 0.06 47)", icon: "🥉" },
];

function ScoreRing({ value, size = 48 }: { value: number; size?: number }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? "oklch(0.45 0.14 160)" : value >= 60 ? "oklch(0.62 0.18 47)" : "oklch(0.58 0.22 27)";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.91 0.012 264)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={4}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
      />
    </svg>
  );
}

function StreakBadge({ days }: { days: number }) {
  if (days === 0) return <span className="text-xs text-muted-foreground">No streak</span>;
  const color = days >= 14 ? "oklch(0.55 0.22 27)" : days >= 7 ? "oklch(0.62 0.18 47)" : "oklch(0.7 0.14 60)";
  return (
    <div className="flex items-center gap-1">
      <Flame size={13} style={{ color }} />
      <span className="text-xs font-bold" style={{ color }}>{days} day{days !== 1 ? "s" : ""}</span>
    </div>
  );
}

export default function Leaderboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: leaderboard, isLoading } = trpc.leaderboard.list.useQuery(undefined, { enabled: true });
  const { data: myStreak } = trpc.leaderboard.myStreak.useQuery(undefined, { enabled: true });

  const myRank = leaderboard?.findIndex((u) => u.id === user?.id);
  const today = new Date().toISOString().slice(0, 10);
  const practicedToday = myStreak?.lastPracticeDate === today;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "oklch(0.95 0.08 80)" }}>
              <Trophy size={12} style={{ color: "oklch(0.45 0.18 60)" }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Community</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Top performers ranked by average score and practice consistency</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* My Stats Card */}
            {myStreak && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: "oklch(0.97 0.04 264 / 0.4)", borderColor: "oklch(0.88 0.08 264)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star size={15} style={{ color: "oklch(0.51 0.23 264)" }} />
                    <span className="text-sm font-bold text-foreground">Your Stats</span>
                  </div>
                  {myRank !== undefined && myRank >= 0 && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "oklch(0.51 0.23 264)", color: "white" }}
                    >
                      #{myRank + 1} on leaderboard
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Streak */}
                  <div className="bg-white rounded-xl p-3 border border-border text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame size={16} style={{ color: myStreak.streakDays > 0 ? "oklch(0.55 0.22 27)" : "oklch(0.7 0.01 264)" }} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">{myStreak.streakDays}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Day Streak</div>
                    {practicedToday && (
                      <div className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block" style={{ background: "oklch(0.96 0.06 160)", color: "oklch(0.38 0.12 160)" }}>
                        ✓ Today
                      </div>
                    )}
                  </div>
                  {/* Longest streak */}
                  <div className="bg-white rounded-xl p-3 border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Zap size={16} style={{ color: "oklch(0.62 0.18 47)" }} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">{myStreak.longestStreak}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Best Streak</div>
                  </div>
                  {/* Sessions */}
                  <div className="bg-white rounded-xl p-3 border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp size={16} style={{ color: "oklch(0.51 0.23 264)" }} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">{myStreak.totalSessions}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Sessions</div>
                  </div>
                  {/* Avg score */}
                  <div className="bg-white rounded-xl p-3 border border-border text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Medal size={16} style={{ color: "oklch(0.45 0.18 60)" }} />
                    </div>
                    <div className="text-2xl font-extrabold text-foreground">
                      {myStreak.avgScore != null ? Math.round(myStreak.avgScore) : "—"}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Avg Score</div>
                  </div>
                </div>

                {/* Streak motivation */}
                {!practicedToday && (
                  <div
                    className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "oklch(0.97 0.05 47 / 0.5)", border: "1px solid oklch(0.9 0.06 47)" }}
                  >
                    <Flame size={16} style={{ color: "oklch(0.62 0.18 47)" }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.1 47)" }}>
                        {myStreak.streakDays > 0
                          ? `Don't break your ${myStreak.streakDays}-day streak! Practice today to keep it going.`
                          : "Start your streak today — complete a simulation to begin!"}
                      </p>
                    </div>
                  </div>
                )}
                {practicedToday && myStreak.streakDays > 0 && (
                  <div
                    className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "oklch(0.96 0.06 160 / 0.5)", border: "1px solid oklch(0.88 0.08 160)" }}
                  >
                    <Flame size={16} style={{ color: "oklch(0.45 0.14 160)" }} />
                    <p className="text-xs font-bold" style={{ color: "oklch(0.35 0.1 160)" }}>
                      You've practiced today! {myStreak.streakDays}-day streak maintained. Keep it up!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard table */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <Users size={15} style={{ color: "oklch(0.51 0.23 264)" }} />
                <span className="text-sm font-bold text-foreground">Top Performers</span>
                <span className="ml-auto text-xs text-muted-foreground">{leaderboard?.length ?? 0} practitioners</span>
              </div>

              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : !leaderboard || leaderboard.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "oklch(0.95 0.08 80)" }}>
                    <Trophy size={20} style={{ color: "oklch(0.45 0.18 60)" }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1">No rankings yet</p>
                  <p className="text-xs text-muted-foreground">Complete a simulation session to appear on the leaderboard.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {leaderboard.map((entry, idx) => {
                    const isMe = entry.id === user?.id;
                    const rankStyle = RANK_STYLES[idx];
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 transition-colors hover:bg-gray-50"
                        style={isMe ? { background: "oklch(0.97 0.04 264 / 0.3)" } : {}}
                      >
                        {/* Rank */}
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                          style={rankStyle
                            ? { background: rankStyle.bg, color: rankStyle.color, border: `1px solid ${rankStyle.border}` }
                            : { background: "oklch(0.96 0.005 264)", color: "oklch(0.5 0.01 264)" }
                          }
                        >
                          {rankStyle ? rankStyle.icon : idx + 1}
                        </div>

                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background: isMe ? "oklch(0.51 0.23 264)" : "oklch(0.91 0.012 264)",
                            color: isMe ? "white" : "oklch(0.35 0.08 264)",
                          }}
                        >
                          {(entry.name ?? "U")[0]?.toUpperCase()}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground truncate">
                              {entry.name ?? "Anonymous"}
                            </span>
                            {isMe && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.51 0.23 264)", color: "white" }}>
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <StreakBadge days={entry.streakDays ?? 0} />
                            <span className="text-xs text-muted-foreground">{entry.totalSessions} sessions</span>
                          </div>
                        </div>

                        {/* Score ring + value */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="relative">
                            <ScoreRing value={entry.avgScore ?? 0} size={40} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-extrabold text-foreground">
                                {entry.avgScore != null ? Math.round(entry.avgScore) : "—"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-extrabold text-foreground">
                              {entry.avgScore != null ? Math.round(entry.avgScore) : "—"}
                            </div>
                            <div className="text-[10px] text-muted-foreground">avg score</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* How scoring works */}
            <div className="rounded-2xl border border-border bg-white p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">How Rankings Work</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Medal size={14} style={{ color: "oklch(0.45 0.18 60)" }} />, title: "Average Score", desc: "Ranked by your average score across all completed sessions." },
                  { icon: <Flame size={14} style={{ color: "oklch(0.55 0.22 27)" }} />, title: "Daily Streaks", desc: "Complete at least one session per day to build and maintain your streak." },
                  { icon: <TrendingUp size={14} style={{ color: "oklch(0.51 0.23 264)" }} />, title: "Session Count", desc: "Tiebreaker: more sessions = higher rank when scores are equal." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.96 0.005 264)" }}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
