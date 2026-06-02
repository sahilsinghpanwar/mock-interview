"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { signOut } from "@/lib/auth.actions";
import { getUserInterviews, formatInterviewDate, Interview, deleteInterview } from "@/lib/interview.actions";
import InterviewCard from "@/components/InterviewCard";
import AuthGuard from "@/components/AuthGuard";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { FaRobot } from "react-icons/fa";
import { LogOut, Plus, BarChart3, AlertCircle } from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      const success = await deleteInterview(deletingId);
      if (success) {
        setInterviews((prev) => prev.filter((i) => i.id !== deletingId));
      }
    } catch (e) {
      console.error("Delete interview failed:", e);
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  }

  // Custom modern brain + audio wave logo for header
  const Logo = () => (
    <div className="flex items-center gap-3.5 group cursor-pointer">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-inner transition-all duration-300">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-neutral-900 dark:text-white relative z-10"
        >
          <path d="M7 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
          <path d="M11 12V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-75" />
          <path d="M15 8V24" stroke="url(#logo-grad-dash)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 12V20" stroke="url(#logo-grad-dash)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M23 10V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />
          <path d="M27 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
          <defs>
            <linearGradient id="logo-grad-dash" x1="15" y1="8" x2="19" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a855f7" />
              <stop offset="1" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
        Mock<span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">.ai</span>
      </span>
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 overflow-x-hidden relative">
        {/* Blueprint Grid pattern in background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        {/* Dashed Header Nav */}
        <header className="sticky top-0 z-30 border-b border-dashed border-neutral-200 dark:border-neutral-900 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-2 sm:gap-4 relative z-10">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 font-semibold text-xs">
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4 text-violet-650 dark:text-violet-400" />
                <span className="hidden sm:inline uppercase tracking-wider">Analytics</span>
              </Link>
            </Button>
            <ThemeToggle />
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 px-3 py-1.5 rounded-xl hidden sm:block">
              {user?.displayName ?? user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowSignOutDialog(true)} className="border-dashed border-neutral-200 dark:border-neutral-850 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white text-xs font-bold rounded-xl h-9">
              <LogOut className="h-3.5 w-3.5 mr-1.5 text-neutral-400 dark:text-neutral-550" />
              Sign out
            </Button>
          </div>
        </header>

        {/* Content */}
        {loadingInterviews ? (
          <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-black">
            <DashboardSkeleton />
          </div>
        ) : (
          <main className="px-6 py-12 max-w-5xl mx-auto space-y-10 relative z-10">
            
            {/* Welcome banner */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-8">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400">Candidate Workspace</span>
                <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Welcome back, {user?.displayName?.split(" ")[0] ?? "there"} 👋
                </h1>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                  Ready to practice your custom AI voice mock sessions?
                </p>
              </div>
              <Button asChild className="h-11 px-5 text-xs font-extrabold bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-xl hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] border border-neutral-900 dark:border-neutral-200 transition-all duration-300">
                <Link href="/interview/new" className="flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Mock Session
                </Link>
              </Button>
            </div>

            {/* Dash Grid Quick stats */}
            {interviews.length > 0 && (
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400">Live Analytics telemetry</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-dashed divide-neutral-200 dark:divide-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-3xl overflow-hidden bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md">
                  <QuickStat
                    label="Total Mock Sessions"
                    value={interviews.length.toString()}
                  />
                  <QuickStat
                    label="Completed Sessions"
                    value={interviews.filter((i) => i.status === "completed").length.toString()}
                  />
                  <QuickStat
                    label="Average Score Gauge"
                    value={
                      (() => {
                        const completed = interviews.filter((i) => i.score && i.score > 0);
                        if (completed.length === 0) return "—";
                        const avg = Math.round(
                          completed.reduce((sum, i) => sum + (i.score ?? 0), 0) / completed.length
                        );
                        return `${avg}%`;
                      })()
                    }
                  />
                  <QuickStat
                    label="Best Performance Grade"
                    value={
                      (() => {
                        const scores = interviews
                           .map((i) => i.score ?? 0)
                           .filter((s) => s > 0);
                        return scores.length > 0 ? `${Math.max(...scores)}%` : "—";
                      })()
                    }
                  />
                </div>
              </div>
            )}

            {/* List of Interviews */}
            <div className="space-y-4.5 pt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400">Practice Inventory</span>

              {interviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl bg-neutral-50/20 dark:bg-neutral-950/20 backdrop-blur-md relative overflow-hidden">
                  {/* Cohesive inner grid overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808004_1px,transparent_1px),linear-gradient(to_bottom,#80808004_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                  
                  <FaRobot className="w-10 h-10 text-violet-650 dark:text-violet-400 mb-3.5 relative z-10" />
                  <p className="font-extrabold text-neutral-900 dark:text-white mb-1.5 relative z-10 text-sm">No interviews recorded yet</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-5 max-w-xs relative z-10 font-light">
                    Start your first highly customized technical or behavioral session to build dynamic confidence.
                  </p>
                  <Button asChild size="sm" className="bg-neutral-950 text-white dark:bg-white dark:text-black font-extrabold hover:bg-neutral-900 dark:hover:bg-neutral-100 rounded-xl relative z-10 text-xs px-4 h-9 border border-neutral-900 dark:border-neutral-200">
                    <Link href="/interview/new" className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      Start First Interview
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
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
                      onDelete={() => setDeletingId(interview.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* Sign Out Confirmation Dialog */}
        <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
          <AlertDialogContent className="bg-white dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-lg font-black text-neutral-900 dark:text-white">Sign out from Mock.ai?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                Are you sure you want to end your active candidate session? You&apos;ll need to log in again to configure or launch mock trials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-dashed border-neutral-200 dark:border-neutral-900">
              <AlertDialogCancel className="bg-transparent border border-dashed border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl h-9 text-xs font-bold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleSignOut} className="bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-xl h-9 text-xs font-black px-4 border border-neutral-900 dark:border-neutral-200">
                Confirm
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <AlertDialogContent className="bg-white dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl p-6">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-lg font-black text-rose-600 dark:text-rose-400">Delete Mock Session?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                Are you sure you want to permanently delete this mock interview session? This will erase all grading grades, transcripts, and telemetry reports. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-3 pt-5 mt-4 border-t border-dashed border-neutral-200 dark:border-neutral-900">
              <AlertDialogCancel disabled={deleting} className="bg-transparent border border-dashed border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl h-9 text-xs font-bold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl h-9 text-xs font-black px-4 border border-rose-650 transition-all">
                {deleting ? "Deleting…" : "Delete Permanently"}
              </AlertDialogAction>
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
    <div className="relative overflow-hidden p-6 text-center hover:bg-neutral-100/40 dark:hover:bg-neutral-900/10 transition-colors">
      {/* Inner grid overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
      <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight tabular-nums relative z-10">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400 mt-2 relative z-10 leading-none">{label}</p>
    </div>
  );
}
