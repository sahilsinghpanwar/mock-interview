"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, PhoneOff, Clock, AlertTriangle } from "lucide-react";
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
import AudioWaveform from "@/components/AudioWaveform";
import { cn } from "@/lib/utils";

type Props = {
  interview: Interview;
  onFeedbackSaved: (patch: Partial<Interview>) => void;
};

const MIN_CALL_DURATION_SECONDS = 30;

// Timer Hook

function useTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active) {
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return { formatted: `${mins}:${secs.toString().padStart(2, "0")}`, seconds };
}

// Component

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
  const callStartTimeRef = useRef<number>(0);
  const timer = useTimer(active);

  const finalizeSession = useCallback(
    async (rawTranscript: string) => {
      if (finalizedRef.current) return;

    
      const elapsed = (Date.now() - callStartTimeRef.current) / 1000;
      const hasContent = rawTranscript.trim().length > 20;

      if (elapsed < MIN_CALL_DURATION_SECONDS && !hasContent) {
        setError(
          `The call ended too quickly (${Math.round(elapsed)}s) with no meaningful conversation. ` +
          `Please try again — make sure your microphone is working and wait for the interviewer to ask questions.`
        );
        setActive(false);
        return;
      }

      if (!hasContent) {
        setError(
          "No transcript was captured. Please check your microphone permissions and try again."
        );
        setActive(false);
        return;
      }

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
        "Add NEXT_PUBLIC_VAPI_WEB_TOKEN and NEXT_PUBLIC_VAPI_ASSISTANT_ID to your .env.local, then restart the dev server."
      );
      return;
    }

    setError("");
    finalizedRef.current = false;
    transcriptRef.current = "";
    setTranscript("");
    setActive(true);
    callStartTimeRef.current = Date.now();

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
    <Card
      className={cn(
        "border-border/60 transition-all duration-300",
        active && "border-violet-500/40 shadow-lg shadow-violet-500/10 animate-glow"
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          Voice Interview
          {active && (
            <div className="flex items-center gap-2 ml-auto">
              <AudioWaveform active={active} barCount={5} />
              <Badge variant="secondary" className="gap-1 font-mono text-xs tabular-nums">
                <Clock className="w-3 h-3" />
                {timer.formatted}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Add <code className="text-xs">NEXT_PUBLIC_VAPI_WEB_TOKEN</code> and{" "}
            <code className="text-xs">NEXT_PUBLIC_VAPI_ASSISTANT_ID</code> to{" "}
            <code className="text-xs">.env.local</code>, then restart the dev
            server.
          </p>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void handleStart()}
            disabled={active || busy || !configured}
            className={cn(
              "gap-2",
              !active && !busy && configured && "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
            )}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {busy ? "Generating feedback…" : active ? "Call in progress…" : "Start Interview"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleEnd()}
            disabled={!active || busy}
            className="gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            End &amp; Get Feedback
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Processing state */}
        {busy && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing your interview performance…
              <br />
              <span className="text-xs">This usually takes 5–10 seconds.</span>
            </p>
          </div>
        )}

        {/* Live transcript */}
        {active && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Live transcript
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-3 min-h-[120px] max-h-[250px] overflow-y-auto text-sm whitespace-pre-wrap">
              {transcript || (
                <span className="text-muted-foreground italic">
                  Waiting for the interviewer to speak…
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
