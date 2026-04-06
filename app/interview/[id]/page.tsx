"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getInterview,
  formatInterviewDate,
  Interview,
} from "@/lib/interview.actions";
import VoiceInterviewPanel from "@/components/VoiceInterviewPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AuthGuard from "@/components/AuthGuard";
import {
  CheckCircle2,
  Mic,
  Hash,
  Briefcase,
  BarChart3,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";

export default function InterviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
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
                    <Link href="/">Back to Dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>
          </Button>

          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Interview Ready</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Your interview is set up
            </h1>
            <p className="text-muted-foreground">
              Review the questions, then start the voice interview when you are
              ready.
            </p>
          </div>

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
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

          {/* Questions */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mic className="w-4 h-4 text-primary" />
                Generated Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {interview.questions.map((q, i) => (
                <div key={q.id}>
                  <div className="flex gap-3 py-4">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-foreground leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  {i < interview.questions.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          <VoiceInterviewPanel
            interview={interview}
            onFeedbackSaved={(patch) =>
              setInterview((prev) => (prev ? { ...prev, ...patch } : prev))
            }
          />

          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1 h-11">
              <Link href="/interview/new">New Setup</Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}