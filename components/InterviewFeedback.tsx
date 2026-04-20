"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ScoreGauge from "@/components/ScoreGauge";
import type { Interview } from "@/lib/interview.actions";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Briefcase,
  BarChart3,
  Hash,
  MessageSquareText,
  Trophy,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewFeedbackProps {
  interview: Interview;
}

// Score Label

function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Outstanding", color: "text-emerald-400" };
  if (score >= 75) return { text: "Great Job", color: "text-emerald-400" };
  if (score >= 60) return { text: "Good Effort", color: "text-amber-400" };
  if (score >= 40) return { text: "Needs Work", color: "text-orange-400" };
  return { text: "Keep Practicing", color: "text-rose-400" };
}

// Component

export default function InterviewFeedback({ interview }: InterviewFeedbackProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const score = interview.score ?? 0;
  const label = getScoreLabel(score);

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <Card className="border-border/60 overflow-hidden animate-fade-in">
        {/* Gradient accent bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              score >= 75
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : score >= 50
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
          }}
        />

        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center">
            {/* Score gauge */}
            <ScoreGauge score={score} size={140} />

            {/* Label */}
            <p className={cn("text-xl font-bold mt-4", label.color)}>
              {label.text}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="w-3 h-3" />
                {interview.role}
              </Badge>
              <Badge variant="secondary">{interview.type}</Badge>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-border/60 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Overall Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {interview.feedbackSummary}
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card
          className="border-emerald-500/20 bg-emerald-500/5 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-emerald-500">
              <Trophy className="w-4 h-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interview.strengths && interview.strengths.length > 0 ? (
              <ul className="space-y-2.5">
                {interview.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific strengths noted.</p>
            )}
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card
          className="border-amber-500/20 bg-amber-500/5 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-500">
              <Target className="w-4 h-4" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {interview.improvements && interview.improvements.length > 0 ? (
              <ul className="space-y-2.5">
                {interview.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No improvement areas noted.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback */}
      {interview.feedbackDetail && (
        <Card className="border-border/60 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {interview.feedbackDetail}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transcript (Collapsible) */}
      {interview.transcriptSummary && (
        <Card className="border-border/60 animate-fade-in" style={{ animationDelay: "450ms" }}>
          <CardHeader className="pb-0">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-primary" />
                Interview Transcript
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {showTranscript ? "Hide" : "Show"}
                {showTranscript ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>
          </CardHeader>
          {showTranscript && (
            <CardContent className="pt-4">
              <div className="rounded-lg bg-muted/30 border border-border p-4 max-h-[400px] overflow-y-auto">
                {interview.transcriptSummary.split("\n").map((line, i) => {
                  const isInterviewer = line.startsWith("Interviewer:");
                  const isCandidate = line.startsWith("Candidate:");
                  const prefix = isInterviewer
                    ? "Interviewer"
                    : isCandidate
                      ? "You"
                      : null;
                  const content = prefix
                    ? line.slice(line.indexOf(":") + 1).trim()
                    : line;

                  if (!line.trim()) return null;

                  return (
                    <div key={i} className={cn("py-2", i > 0 && "border-t border-border/30")}>
                      {prefix && (
                        <span
                          className={cn(
                            "text-xs font-semibold uppercase tracking-wider",
                            isInterviewer ? "text-violet-400" : "text-cyan-400"
                          )}
                        >
                          {prefix}
                        </span>
                      )}
                      <p className="text-sm text-foreground/80 leading-relaxed mt-0.5">
                        {content}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
