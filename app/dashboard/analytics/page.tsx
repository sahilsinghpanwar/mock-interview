"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { getUserInterviews, formatInterviewDate, Interview } from "@/lib/interview.actions";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
}) {
  return (
    <Card className="border-border/60 overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
              gradient
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bar Chart (pure CSS) ─────────────────────────────────────────────────────

function ScoreChart({ interviews }: { interviews: Interview[] }) {
  const completed = interviews
    .filter((i) => i.status === "completed" && typeof i.score === "number" && i.score > 0)
    .slice(0, 10) // Last 10
    .reverse(); // Oldest first

  if (completed.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        Complete interviews to see your score trends
      </div>
    );
  }

  const maxScore = 100;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-40">
        {completed.map((interview, i) => {
          const score = interview.score ?? 0;
          const height = (score / maxScore) * 100;
          const color =
            score >= 75
              ? "from-emerald-500 to-emerald-400"
              : score >= 50
                ? "from-amber-500 to-amber-400"
                : "from-rose-500 to-rose-400";

          return (
            <div
              key={interview.id}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                {score}
              </span>
              <div className="w-full rounded-t-md overflow-hidden bg-muted relative">
                <div
                  className={cn(
                    "w-full rounded-t-md bg-gradient-to-t transition-all duration-700 ease-out",
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
            <p className="text-[9px] text-muted-foreground truncate">
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
    <div className="space-y-4">
      {data.map((d) => (
        <div key={d.difficulty} className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{d.difficulty}</span>
            <span className="text-muted-foreground text-xs">
              {d.count} completed · avg {d.avg || "—"}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
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
      <p className="text-sm text-muted-foreground py-4">No activity yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((interview) => (
        <Link
          key={interview.id}
          href={`/interview/${interview.id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              interview.status === "completed"
                ? "bg-emerald-500/10 text-emerald-500"
                : interview.status === "in-progress"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-muted text-muted-foreground"
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
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
              {interview.role}
            </p>
            <p className="text-xs text-muted-foreground">
              {interview.difficulty} · {formatInterviewDate(interview.createdAt)}
            </p>
          </div>
          {interview.status === "completed" && typeof interview.score === "number" && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-semibold shrink-0",
                interview.score >= 75
                  ? "text-emerald-500"
                  : interview.score >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
              )}
            >
              {interview.score}/100
            </Badge>
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
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back */}
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              Performance Analytics
            </h1>
            <p className="text-muted-foreground">
              Track your interview performance and identify areas for growth.
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <StatCard
                  icon={BarChart3}
                  label="Total Interviews"
                  value={interviews.length.toString()}
                  sub={`${completed.length} completed`}
                  gradient="from-violet-600 to-indigo-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Average Score"
                  value={avgScore > 0 ? `${avgScore}` : "—"}
                  sub={avgScore > 0 ? "out of 100" : "No scores yet"}
                  gradient="from-cyan-500 to-blue-500"
                />
                <StatCard
                  icon={Trophy}
                  label="Best Score"
                  value={bestScore > 0 ? `${bestScore}` : "—"}
                  sub={bestScore > 0 ? "out of 100" : "No scores yet"}
                  gradient="from-amber-500 to-orange-500"
                />
                <StatCard
                  icon={Target}
                  label="Completion Rate"
                  value={`${completionRate}%`}
                  sub={`${completed.length} of ${interviews.length}`}
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Score Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreChart interviews={interviews} />
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      By Difficulty Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DifficultyBreakdown interviews={interviews} />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity interviews={interviews} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
