"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { signOut } from "@/lib/auth.actions";
import { getUserInterviews, formatInterviewDate, Interview } from "@/lib/interview.actions";
import InterviewCard from "@/components/InterviewCard";
import AuthGuard from "@/components/AuthGuard";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { FaRobot } from "react-icons/fa";
import { LogOut, Plus, BarChart3 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserInterviews(user.uid).then((data: Interview[]) => {
      setInterviews(data);
      setLoadingInterviews(false);
    });
  }, [user]);

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
            <FaRobot className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight">Mock + AI</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/analytics">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </Link>
          </Button>
          <ThemeToggle />
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.displayName ?? user?.email}
          </span>
          <Button variant="outline" size="sm" onClick={() => setShowSignOutDialog(true)}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Content */}
      {loadingInterviews ? (
        <DashboardSkeleton />
      ) : (
        <main className="px-6 py-12 max-w-5xl mx-auto space-y-10">
          {/* Welcome */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, {user?.displayName?.split(" ")[0] ?? "there"} 👋
              </h1>
              <p className="text-muted-foreground">
                Ready to practice your next interview?
              </p>
            </div>
            <Button asChild>
              <Link href="/interview/new">
                <Plus className="w-4 h-4 mr-2" />
                New Interview
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          {interviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickStat
                label="Total Interviews"
                value={interviews.length.toString()}
              />
              <QuickStat
                label="Completed"
                value={interviews.filter((i) => i.status === "completed").length.toString()}
              />
              <QuickStat
                label="Avg Score"
                value={
                  (() => {
                    const completed = interviews.filter((i) => i.score && i.score > 0);
                    if (completed.length === 0) return "—";
                    const avg = Math.round(
                      completed.reduce((sum, i) => sum + (i.score ?? 0), 0) / completed.length
                    );
                    return `${avg}/100`;
                  })()
                }
              />
              <QuickStat
                label="Best Score"
                value={
                  (() => {
                    const scores = interviews
                      .map((i) => i.score ?? 0)
                      .filter((s) => s > 0);
                    return scores.length > 0 ? `${Math.max(...scores)}/100` : "—";
                  })()
                }
              />
            </div>
          )}

          {/* Interviews */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Interviews</h2>

            {interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-xl">
                <FaRobot className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-medium mb-1">No interviews yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first AI-powered mock interview to get started.
                </p>
                <Button asChild size="sm">
                  <Link href="/interview/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Start your first interview
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {interviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    id={interview.id}
                    role={interview.role}
                    type={interview.type}
                    difficulty={interview.difficulty}
                    numQuestions={interview.questions.length}
                    status={interview.status ?? "pending"}
                    createdAt={formatInterviewDate(interview.createdAt)}
                    score={interview.score ?? 0}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You&apos;ll need to sign in again to access your interviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Ok</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </AuthGuard>
  );
}

// ─── Quick Stat Card ──────────────────────────────────────────────────────────

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
