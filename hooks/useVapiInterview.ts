"use client";

import { useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { getVapiAssistantId, getVapiPublicKey } from "@/lib/vapiConfig";
import { buildVapiVoiceSystemPrompt } from "@/lib/prompts/interviewerPrompts";
import type { Interview } from "@/lib/interview.actions";

function appendLineFromVapiMessage(
  lines: string[],
  msg: Record<string, unknown>
): void {
  if (msg.type === "transcript") {
    const role = msg.role === "user" ? "Candidate" : "Interviewer";
    const text =
      typeof msg.transcript === "string"
        ? msg.transcript
        : typeof msg.transcript === "object" &&
            msg.transcript !== null &&
            "text" in msg.transcript
          ? String((msg.transcript as { text?: string }).text ?? "")
          : "";
    if (text.trim()) {
      lines.push(`${role}: ${text.trim()}`);
    }
  }
}

/**
 * Starts/stops Vapi web calls and accumulates transcript lines from `message` events.
 * Requires NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID.
 */
export function useVapiInterview() {
  const vapiRef = useRef<Vapi | null>(null);

  const ensureClient = useCallback(() => {
    const key = getVapiPublicKey();
    if (!key) {
      throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
    }
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(key);
    }
    return vapiRef.current;
  }, []);

  const start = useCallback(
    (
      interview: Interview,
      handlers: {
        onTranscriptLine?: (fullTranscript: string) => void;
        onCallEnd?: (fullTranscript: string) => void;
        onError?: (message: string) => void;
      }
    ) => {
      const assistantId = getVapiAssistantId();
      if (!assistantId) {
        handlers.onError?.("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID");
        return;
      }

      const client = ensureClient();
      const lines: string[] = [];

      const systemPrompt = buildVapiVoiceSystemPrompt(interview);

      const overrides = {
        firstMessage: `Hi — I'm your interviewer today for the ${interview.role} ${interview.type} session at ${interview.difficulty} level. I'll ask ${interview.numQuestions} questions. Let's begin with the first one.`,
        model: {
          provider: "google" as const,
          model: "gemini-2.5-flash" as const,
          messages: [{ role: "system" as const, content: systemPrompt }],
        },
      };

      client.removeAllListeners("message");
      client.removeAllListeners("call-end");
      client.removeAllListeners("error");

      client.on("message", (message: unknown) => {
        if (!message || typeof message !== "object") return;
        appendLineFromVapiMessage(lines, message as Record<string, unknown>);
        const full = lines.join("\n");
        handlers.onTranscriptLine?.(full);
      });

      client.on("call-end", () => {
        handlers.onCallEnd?.(lines.join("\n"));
      });

      client.on("error", (e: unknown) => {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: unknown }).message)
            : String(e);
        handlers.onError?.(msg);
      });

      void client.start(assistantId, overrides);
    },
    [ensureClient]
  );

  const stop = useCallback(async () => {
    const client = vapiRef.current;
    if (client) {
      await client.stop();
    }
  }, []);

  return { start, stop };
}
