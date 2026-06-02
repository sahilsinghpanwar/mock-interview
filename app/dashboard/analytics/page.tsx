"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserInterviews, formatInterviewDate, Interview } from "@/lib/interview.actions";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 hover:scale-[1.01] transition-all duration-300 group min-h-[120px]">
      {/* Blueprint Grid pattern in background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />

      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-655 dark:text-violet-400">
            {label}
          </p>
          <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight tabular-nums mt-1">{value}</p>
          {sub && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">{sub}</p>
          )}
        </div>
        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-violet-650 dark:text-violet-400" />
        </div>
      </div>
    </div>
  );
}

// ─── Bar Chart (Telemetry CSS Style) ──────────────────────────────────────────

function ScoreChart({ interviews }: { interviews: Interview[] }) {
  const completed = interviews
    .filter((i) => i.status === "completed" && typeof i.score === "number" && i.score > 0)
    .slice(0, 10) // Last 10
    .reverse(); // Oldest first

  if (completed.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-xs text-neutral-600 dark:text-neutral-400 font-light italic">
        Complete interviews to see your score trends
      </div>
    );
  }

  const maxScore = 100;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-end gap-2 h-44 border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-2 relative">
        {/* Grid helper lines in chart background */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-neutral-300 dark:border-neutral-850 w-full h-0 text-[8px] text-neutral-500 font-mono pt-0.5">100</div>
          <div className="border-b border-dashed border-neutral-300 dark:border-neutral-850 w-full h-0 text-[8px] text-neutral-500 font-mono">75</div>
          <div className="border-b border-dashed border-neutral-300 dark:border-neutral-850 w-full h-0 text-[8px] text-neutral-500 font-mono">50</div>
          <div className="border-b border-dashed border-neutral-300 dark:border-neutral-850 w-full h-0 text-[8px] text-neutral-500 font-mono">25</div>
        </div>

        {completed.map((interview, i) => {
          const score = interview.score ?? 0;
          const height = (score / maxScore) * 100;
          const color =
            score >= 75
              ? "from-emerald-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : score >= 50
                ? "from-amber-500 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "from-rose-500 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]";

          return (
            <div
              key={interview.id}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer relative z-10"
            >
              <span className="text-[9px] font-bold tabular-nums text-neutral-800 dark:text-neutral-350 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {score}%
              </span>
              <div className="w-full rounded-t bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-850 overflow-hidden relative h-full flex flex-col justify-end">
                <div
                  className={cn(
                    "w-full rounded-t bg-gradient-to-t transition-all duration-700 ease-out",
                    color
                  )}
                  style={{
                    height: `${height}%`,
                    minHeight: "4px",
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        {completed.map((interview) => (
          <div
            key={interview.id}
            className="flex-1 text-center"
          >
            <p className="text-[9px] text-neutral-500 dark:text-neutral-400 font-semibold truncate uppercase tracking-wider">
              {interview.role.split(" ")[0]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Difficulty Breakdown ─────────────────────────────────────────────────────

function DifficultyBreakdown({ interviews }: { interviews: Interview[] }) {
  const difficulties = ["Junior", "Mid", "Senior"] as const;

  const data = difficulties.map((d) => {
    const matching = interviews.filter(
      (i) => i.difficulty === d && i.status === "completed" && i.score && i.score > 0
    );
    const avg =
      matching.length > 0
        ? Math.round(matching.reduce((s, i) => s + (i.score ?? 0), 0) / matching.length)
        : 0;
    return { difficulty: d, count: matching.length, avg };
  });

  const colorMap: Record<string, string> = {
    Junior: "bg-emerald-500",
    Mid: "bg-amber-500",
    Senior: "bg-rose-500",
  };

  return (
    <div className="space-y-5 pt-2">
      {data.map((d) => (
        <div key={d.difficulty} className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">{d.difficulty}</span>
            <span className="text-neutral-500 dark:text-neutral-400 text-[10px] font-light">
              {d.count} completed · avg <span className="font-bold text-neutral-900 dark:text-white">{d.avg || "—"}%</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 overflow-hidden relative">
            <div
              className={cn("h-full rounded-full transition-all duration-700", colorMap[d.difficulty])}
              style={{ width: d.avg > 0 ? `${d.avg}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

function RecentActivity({ interviews }: { interviews: Interview[] }) {
  const recent = interviews.slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="text-xs text-neutral-600 dark:text-neutral-400 italic py-4 font-light">No activity yet</p>
    );
  }

  return (
    <div className="divide-y divide-dashed divide-neutral-200 dark:divide-neutral-900">
      {recent.map((interview) => (
        <Link
          key={interview.id}
          href={`/interview/${interview.id}`}
          className="flex items-center gap-3.5 py-3.5 hover:bg-neutral-100/40 dark:hover:bg-neutral-900/20 transition-colors group px-2 rounded-xl"
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
              interview.status === "completed"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : interview.status === "in-progress"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
            )}
          >
            {interview.status === "completed" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : interview.status === "in-progress" ? (
              <Clock className="w-4 h-4" />
            ) : (
              <Briefcase className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-neutral-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {interview.role}
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-light mt-0.5">
              {interview.difficulty} · {formatInterviewDate(interview.createdAt)}
            </p>
          </div>
          {interview.status === "completed" && typeof interview.score === "number" && (
            <span
              className={cn(
                "text-xs font-black border border-dashed rounded-full px-2.5 py-0.5 shrink-0 uppercase tracking-wide",
                interview.score >= 75
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-400/5 border-emerald-400/20"
                  : interview.score >= 50
                    ? "text-amber-600 dark:text-amber-400 bg-amber-400/5 border-amber-400/20"
                    : "text-rose-600 dark:text-rose-400 bg-rose-400/5 border-rose-400/20"
              )}
            >
              {interview.score}/100
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid).then((data) => {
      setInterviews(data);
      setLoading(false);
    });
  }, [user]);

  const completed = interviews.filter((i) => i.status === "completed");
  const withScores = completed.filter((i) => i.score && i.score > 0);
  const avgScore =
    withScores.length > 0
      ? Math.round(withScores.reduce((s, i) => s + (i.score ?? 0), 0) / withScores.length)
      : 0;
  const bestScore =
    withScores.length > 0
      ? Math.max(...withScores.map((i) => i.score ?? 0))
      : 0;
  const completionRate =
    interviews.length > 0
      ? Math.round((completed.length / interviews.length) * 100)
      : 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 py-12 px-6 overflow-x-hidden relative">
        {/* Blueprint Grid pattern in background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold uppercase tracking-wider rounded-xl">
            <Link href="/dashboard">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-neutral-400 dark:text-neutral-550" />
              Back to dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-8 space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400">Analytics Telemetry</span>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-neutral-650 dark:text-neutral-400 leading-relaxed font-light">
              Track your interview performance metrics, difficulty ranges, and telemetry.
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-3xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800" />
              ))}
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children animate-fade-in">
                <StatCard
                  icon={BarChart3}
                  label="Total Interviews"
                  value={interviews.length.toString()}
                  sub={`${completed.length} completed`}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Average Score"
                  value={avgScore > 0 ? `${avgScore}%` : "—"}
                  sub={avgScore > 0 ? "out of 100" : "No scores yet"}
                />
                <StatCard
                  icon={Trophy}
                  label="Best Score"
                  value={bestScore > 0 ? `${bestScore}%` : "—"}
                  sub={bestScore > 0 ? "out of 100" : "No scores yet"}
                />
                <StatCard
                  icon={Target}
                  label="Completion Rate"
                  value={`${completionRate}%`}
                  sub={`${completed.length} of ${interviews.length}`}
                />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
                {/* Score Trend */}
                <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
                  
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <TrendingUp className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                    <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Score Trend</h2>
                  </div>
                  <ScoreChart interviews={interviews} />
                </div>

                {/* Difficulty Breakdown */}
                <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6">
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
                  
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <BarChart3 className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                    <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">By Difficulty Level</h2>
                  </div>
                  <DifficultyBreakdown interviews={interviews} />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
                
                <div className="flex items-center gap-2 mb-4 relative z-10">
                  <Clock className="w-4 h-4 text-violet-650 dark:text-violet-400" />
                  <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Recent Activity</h2>
                </div>
                <RecentActivity interviews={interviews} />
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
