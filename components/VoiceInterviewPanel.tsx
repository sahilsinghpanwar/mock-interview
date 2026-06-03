"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, PhoneOff, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return { 
    formatted: `${mins}:${secs.toString().padStart(2, "0")}`, 
    seconds,
    reset: () => setSeconds(0)
  };
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
    timer.reset();
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
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed p-6 transition-all duration-300 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md",
        active
          ? "border-violet-500 shadow-xl shadow-violet-500/5"
          : "border-neutral-200 dark:border-neutral-850 hover:border-neutral-400 dark:hover:border-neutral-750"
      )}
    >
      {/* Blueprint Grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />

      <div className="relative z-10 space-y-5">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 text-violet-650 dark:text-violet-400" />
            </div>
            <h2 className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Voice Transceiver Interface</h2>
          </div>
          
          {active && (
            <div className="flex items-center gap-3">
              <AudioWaveform active={active} barCount={6} />
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-neutral-105 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 text-violet-650 dark:text-violet-400 flex items-center gap-1.5 uppercase tracking-wide font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                {timer.formatted}
              </span>
            </div>
          )}
        </div>

        {/* Configuration notice */}
        {!configured && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider">Configuration parameters missing</p>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mt-0.5">
                Add <code className="text-[11px] font-mono text-neutral-900 dark:text-white">NEXT_PUBLIC_VAPI_WEB_TOKEN</code> and <code className="text-[11px] font-mono text-neutral-900 dark:text-white">NEXT_PUBLIC_VAPI_ASSISTANT_ID</code> to your local environment file (<code className="text-[11px] font-mono text-neutral-900 dark:text-white">.env.local</code>), then restart the Next.js dev server.
              </p>
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void handleStart()}
            disabled={active || busy || !configured}
            className={cn(
              "h-10 text-xs font-extrabold rounded-xl px-5 transition-all duration-300 gap-2 shrink-0 border border-neutral-900 dark:border-neutral-200",
              !active && !busy && configured
                ? "bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                : "bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500"
            )}
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
            {busy ? "Generating Feedback Report…" : active ? "Active Connection Established" : "Initiate Transceiver"}
          </Button>

          {active && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleEnd()}
              disabled={!active || busy}
              className="h-10 text-xs font-extrabold rounded-xl px-5 gap-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10 shrink-0"
            >
              <PhoneOff className="w-4 h-4" />
              Terminate &amp; Retrieve Grade
            </Button>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/5 border border-dashed border-rose-500/20 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">{error}</p>
          </div>
        )}

        {/* Telemetry processing block */}
        {busy && (
          <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-neutral-200 dark:border-neutral-900 bg-neutral-50/40 dark:bg-neutral-900/10 rounded-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-violet-650 dark:text-violet-400" />
            <div className="text-center space-y-1">
              <p className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Analyzing Interview Audio Telemetry</p>
              <p className="text-[10px] text-neutral-605 dark:text-neutral-400 font-light">
                Mock.ai is evaluating performance grade parameters… usually compiles in 5–10s.
              </p>
            </div>
          </div>
        )}

        {/* Live Audio Transcript viewport */}
        {active && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              Live Transcript Telemetry
            </p>
            <div className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-900 bg-white dark:bg-black p-4 min-h-[120px] max-h-[250px] overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed font-light text-neutral-700 dark:text-neutral-300">
              {transcript || (
                <span className="text-neutral-450 dark:text-neutral-500 italic font-light">
                  Establishing transceiver downlink… waiting for interviewer voice stream…
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
