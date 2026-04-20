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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthGuard from "@/components/AuthGuard";
import {
  CheckCircle2,
  Mic,
  Briefcase,
  BarChart3,
  Calendar,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Headphones,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

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
        <InterviewPageSkeleton />
      </AuthGuard>
    );
  }

  if (error || !interview) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background py-10 px-4">
          <div className="max-w-xl mx-auto">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Unable to open interview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {error || "Interview not found."}
                </p>
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href="/interview/new">Create New Interview</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const isCompleted = interview.status === "completed" && interview.feedbackSummary;

  
  if (isCompleted) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background py-10 px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back */}
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to dashboard
              </Link>
            </Button>

            {/* Full-page professional feedback */}
            <InterviewFeedback interview={interview} />

            {/* Actions */}
            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <Button
                variant="default"
                onClick={handleRetake}
                disabled={retaking}
                className="flex-1 h-11 gap-2"
              >
                {retaking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Retake with Same Settings
              </Button>
              <Button variant="outline" asChild className="flex-1 h-11">
                <Link href="/interview/new">New Interview</Link>
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }


  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-10 px-4">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Back */}
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-1 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Interview Ready</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ready to begin your interview
            </h1>
            <p className="text-muted-foreground">
              The AI interviewer will ask you {interview.questions.length} questions
              one by one. Answer naturally — there are no right or wrong answers.
            </p>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="w-3 h-3" />
              {interview.role}
            </Badge>
            <Badge variant="secondary">{interview.type}</Badge>
            {interview.focusArea && interview.focusArea !== "General" && (
              <Badge variant="outline">{interview.focusArea}</Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(
                "gap-1",
                interview.difficulty === "Junior" && "text-emerald-400",
                interview.difficulty === "Mid" && "text-amber-400",
                interview.difficulty === "Senior" && "text-rose-400"
              )}
            >
              <BarChart3 className="w-3 h-3" />
              {interview.difficulty}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Hash className="w-3 h-3" />
              {interview.questions.length} questions
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {formatInterviewDate(interview.createdAt)}
            </Badge>
          </div>

          {/* Interview tips card (replaces the question list) */}
          <Card className="border-border/60 bg-card/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Headphones className="w-4 h-4 text-primary" />
                How this works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <TipRow num="1" text={`Click "Start Interview" below — the AI interviewer will greet you and begin.`} />
                <TipRow num="2" text="Listen to each question carefully, then answer verbally. Take your time." />
                <TipRow num="3" text="The AI will move to the next question after your answer. You can skip if needed." />
                <TipRow num="4" text={`When done, click "End & Get Feedback" to receive your score and detailed analysis.`} />
              </div>
            </CardContent>
          </Card>

          {/* Voice panel */}
          <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <VoiceInterviewPanel
              interview={interview}
              onFeedbackSaved={(patch) =>
                setInterview((prev) => (prev ? { ...prev, ...patch } : prev))
              }
            />
          </div>

          <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button variant="outline" asChild className="flex-1 h-11">
              <Link href="/interview/new">Different Setup</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}


function TipRow({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
        {num}
      </span>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}