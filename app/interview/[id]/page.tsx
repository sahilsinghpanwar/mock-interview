"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInterview,
  formatInterviewDate,
  createInterview,
  Interview,
} from "@/lib/interview.actions";
import VoiceInterviewPanel from "@/components/VoiceInterviewPanel";
import InterviewPageSkeleton from "@/components/InterviewPageSkeleton";
import InterviewFeedback from "@/components/InterviewFeedback";
import TipRow from "@/components/TipRow";
import { Button } from "@/components/ui/button";
import AuthGuard from "@/components/AuthGuard";
import {
  CheckCircle2,
  Briefcase,
  BarChart3,
  Calendar,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Headphones,
  Hash,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function InterviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retaking, setRetaking] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadInterview() {
      if (!id) {
        if (mounted) {
          setError("Missing interview ID.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const data = await getInterview(id);
      if (!mounted) return;

      if (!data) {
        setError("Interview not found or access denied.");
        setLoading(false);
        return;
      }

      setInterview(data);
      setError("");
      setLoading(false);
    }

    loadInterview();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleRetake() {
    if (!interview || !user) return;
    setRetaking(true);
    try {
      const result = await createInterview(
        user.uid,
        interview.role,
        interview.type,
        interview.difficulty,
        interview.numQuestions,
        interview.focusArea ?? "General"
      );
      if (result.success && result.interviewId) {
        router.push(`/interview/${result.interviewId}`);
      }
    } catch {
      setRetaking(false);
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <InterviewPageSkeleton />
        </div>
      </AuthGuard>
    );
  }

  // Error block styled with blueprint pattern
  if (error || !interview) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 py-12 px-6 overflow-x-hidden relative flex items-center justify-center">
          {/* Blueprint Grid pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

          <div className="max-w-md w-full relative z-10">
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />

              <div className="flex items-center gap-2 mb-4 relative z-10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Unable to open interview</h2>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-6">
                {error || "Interview not found."}
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild className="h-10 bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black font-extrabold rounded-xl text-xs w-full border border-neutral-900 dark:border-neutral-200">
                  <Link href="/interview/new">Create New Interview</Link>
                </Button>
                <Button variant="outline" asChild className="h-10 border-dashed border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl text-xs w-full">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isCompleted = interview.status === "completed" && interview.feedbackSummary;

  if (isCompleted) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 py-12 px-6 overflow-x-hidden relative">
          {/* Blueprint Grid pattern */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            {/* Back */}
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold uppercase tracking-wider rounded-xl">
              <Link href="/dashboard">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-neutral-400 dark:text-neutral-550" />
                Back to dashboard
              </Link>
            </Button>

            {/* Full-page professional feedback */}
            <InterviewFeedback interview={interview} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-900">
              <Button
                variant="default"
                onClick={handleRetake}
                disabled={retaking}
                className="flex-1 h-11 gap-2 bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black font-extrabold rounded-xl text-xs border border-neutral-900 dark:border-neutral-200"
              >
                {retaking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Retake with Same Settings
              </Button>
              <Button variant="outline" asChild className="flex-1 h-11 border-dashed border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl text-xs font-extrabold">
                <Link href="/interview/new">New Practice Session</Link>
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 py-12 px-6 overflow-x-hidden relative">
        {/* Blueprint Grid pattern in background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-2xl mx-auto space-y-8 relative z-10">

          {/* Back */}
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold uppercase tracking-wider rounded-xl">
            <Link href="/dashboard">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-neutral-400 dark:text-neutral-550" />
              Back to dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-2 border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-6">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Interview Agent Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              Ready to begin your interview
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
              The AI interviewer will ask you {interview.questions.length} custom voice questions
              one by one. Answer naturally as if speaking to a real recruiter.
            </p>
          </div>

          {/* Meta technical badges */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Briefcase className="w-3.5 h-3.5 text-violet-650 dark:text-violet-400" />
              {interview.role}
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              {interview.type}
            </span>
            {interview.focusArea && interview.focusArea !== "General" && (
              <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                {interview.focusArea}
              </span>
            )}
            <span className={cn("text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 uppercase tracking-wide", 
              interview.difficulty === "Junior" && "text-emerald-650 dark:text-emerald-400",
              interview.difficulty === "Mid" && "text-amber-650 dark:text-amber-400",
              interview.difficulty === "Senior" && "text-rose-650 dark:text-rose-400"
            )}>
              <BarChart3 className="w-3.5 h-3.5" />
              {interview.difficulty}
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Hash className="w-3.5 h-3.5 text-neutral-500" />
              {interview.questions.length} Qs
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-neutral-500" />
              {formatInterviewDate(interview.createdAt)}
            </span>
          </div>

          {/* Interview tips card in blueprint container */}
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Headphones className="w-4 h-4 text-violet-650 dark:text-violet-400" />
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">How This Works</h2>
            </div>
            
            <div className="grid gap-3.5 relative z-10">
              <TipRow num="1" text={`Click "Start Interview" below — the AI interviewer will greet you verbally.`} />
              <TipRow num="2" text="Listen to each question carefully, then answer naturally using your microphone." />
              <TipRow num="3" text="The AI detects when you finish speaking, then moves dynamically to the next question." />
              <TipRow num="4" text={`When done, click "End & Get Feedback" to immediately generate detailed grade telemetry.`} />
            </div>
          </div>

          {/* Voice panel */}
          <VoiceInterviewPanel
            interview={interview}
            onFeedbackSaved={(patch) =>
              setInterview((prev) => (prev ? { ...prev, ...patch } : prev))
            }
          />

          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1 h-11 border-dashed border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider">
              <Link href="/interview/new">Different Setup</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
