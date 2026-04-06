"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Mic, PhoneOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVapiInterview } from "@/hooks/useVapiInterview";
import {
  saveInterviewFeedback,
  updateInterviewStatus,
  type Interview,
} from "@/lib/interview.actions";
import { isVapiConfigured } from "@/lib/vapiConfig";

type Props = {
  interview: Interview;
  onFeedbackSaved: (patch: Partial<Interview>) => void;
};

export default function VoiceInterviewPanel({
  interview,
  onFeedbackSaved,
}: Props) {
  const { start, stop } = useVapiInterview();
  const [active, setActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const finalizedRef = useRef(false);
  const transcriptRef = useRef("");

  const finalizeSession = useCallback(
    async (rawTranscript: string) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setBusy(true);
      setError("");

      try {
        const res = await fetch("/api/gemini/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: interview.role,
            type: interview.type,
            difficulty: interview.difficulty,
            questions: interview.questions.map((q) => q.text),
            transcript: rawTranscript,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error ?? "Feedback request failed");
        }

        const data = (await res.json()) as {
          score: number;
          summary: string;
          strengths: string[];
          improvements: string[];
          detailedFeedback: string;
        };

        await saveInterviewFeedback(interview.id, {
          score: data.score,
          summary: data.summary,
          detailedFeedback: data.detailedFeedback,
          strengths: data.strengths,
          improvements: data.improvements,
          transcriptSummary: rawTranscript.slice(0, 12000),
        });

        onFeedbackSaved({
          status: "completed",
          score: data.score,
          feedbackSummary: data.summary,
          feedbackDetail: data.detailedFeedback,
          strengths: data.strengths,
          improvements: data.improvements,
          transcriptSummary: rawTranscript.slice(0, 12000),
        });
      } catch (e) {
        finalizedRef.current = false;
        const msg = e instanceof Error ? e.message : "Failed to save feedback";
        setError(msg);
      } finally {
        setBusy(false);
        setActive(false);
      }
    },
    [interview, onFeedbackSaved]
  );

  async function handleStart() {
    if (!isVapiConfigured()) {
      setError(
        "Add NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID to your environment."
      );
      return;
    }

    setError("");
    finalizedRef.current = false;
    transcriptRef.current = "";
    setTranscript("");
    setActive(true);

    await updateInterviewStatus(interview.id, "in-progress");

    start(interview, {
      onTranscriptLine: (full) => {
        transcriptRef.current = full;
        setTranscript(full);
      },
      onCallEnd: (full) => {
        void finalizeSession(full || transcriptRef.current);
      },
      onError: (msg) => {
        setError(msg);
        setActive(false);
      },
    });
  }

  async function handleEnd() {
    transcriptRef.current = transcript;
    await stop();
    if (!finalizedRef.current) {
      void finalizeSession(transcriptRef.current);
    }
  }

  const configured = isVapiConfigured();

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Voice interview (Vapi)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Add <code className="text-xs">NEXT_PUBLIC_VAPI_PUBLIC_KEY</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_VAPI_ASSISTANT_ID</code> to{" "}
            <code className="text-xs">.env.local</code>, then restart the dev
            server.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void handleStart()}
            disabled={active || busy || !configured}
            className="gap-2"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            Start interview
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleEnd()}
            disabled={!active || busy}
            className="gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            End &amp; get feedback
          </Button>
          {active && (
            <Badge variant="secondary" className="animate-pulse">
              Live
            </Badge>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
        )}

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Live transcript
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-3 min-h-[100px] max-h-[220px] overflow-y-auto text-sm whitespace-pre-wrap">
            {transcript || (
              <span className="text-muted-foreground">
                Transcript appears as you speak…
              </span>
            )}
          </div>
        </div>

        {interview.status === "completed" && interview.feedbackSummary && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              Feedback
              {typeof interview.score === "number" && (
                <Badge variant="secondary">Score {interview.score}/100</Badge>
              )}
            </div>
            <p className="text-sm">{interview.feedbackSummary}</p>
            {interview.strengths && interview.strengths.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Strengths
                </p>
                <ul className="list-disc list-inside text-sm">
                  {interview.strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {interview.improvements && interview.improvements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Improvements
                </p>
                <ul className="list-disc list-inside text-sm">
                  {interview.improvements.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {interview.feedbackDetail && (
              <p className="text-sm text-muted-foreground">
                {interview.feedbackDetail}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
