"use client";

import { useCallback, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { getVapiAssistantId, getVapiPublicKey } from "@/lib/vapiConfig";
import { buildVapiVoiceSystemPrompt } from "@/lib/prompts/interviewerPrompts";
import type { Interview } from "@/lib/interview.actions";

function appendLineFromVapiMessage(
  lines: string[],
  msg: Record<string, unknown>
): boolean {
  if (msg.type !== "transcript") return false;

  if (msg.transcriptType !== "final") return false;

  const role = msg.role === "user" ? "You" : "Interviewer";
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
    return true;
  }
  return false;
}


//  Formats the raw transcript lines into a clean Q/A numbered format.

function formatTranscriptForFeedback(lines: string[]): string {
  let qNum = 0;
  let aNum = 0;
  const formatted: string[] = [];

  for (const line of lines) {
    if (line.startsWith("Interviewer: ")) {
      qNum++;
      formatted.push(`Q${qNum}: ${line.replace("Interviewer: ", "")}`);
    } else if (line.startsWith("You: ")) {
      aNum++;
      formatted.push(`A${aNum}: ${line.replace("You: ", "")}`);
    } else {
      formatted.push(line);
    }
  }

  return formatted.join("\n");
}


  // Formats transcript lines for the live display panel.
  // Groups consecutive interviewer lines and user lines together.
 
function formatTranscriptForDisplay(lines: string[]): string {
  if (lines.length === 0) return "";

  const grouped: string[] = [];
  let currentRole = "";
  let currentText = "";

  for (const line of lines) {
    const isInterviewer = line.startsWith("Interviewer: ");
    const isUser = line.startsWith("You: ");
    const role = isInterviewer ? "Interviewer" : isUser ? "You" : "";
    const text = line.replace(/^(Interviewer|You): /, "");

    if (role === currentRole && role !== "") {
      
      currentText += " " + text;
    } else {
      
      if (currentRole && currentText) {
        grouped.push(`${currentRole}: ${currentText}`);
      }
      currentRole = role;
      currentText = text;
    }
  }

  if (currentRole && currentText) {
    grouped.push(`${currentRole}: ${currentText}`);
  }

  return grouped.join("\n\n");
}

export function useVapiInterview() {
  const vapiRef = useRef<Vapi | null>(null);

  const ensureClient = useCallback(() => {
    const key = getVapiPublicKey();
    if (!key) {
      throw new Error("Missing NEXT_PUBLIC_VAPI_WEB_TOKEN");
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
        onTranscriptLine?: (displayTranscript: string) => void;
        onCallEnd?: (feedbackTranscript: string) => void;
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

    
      const questionsList = interview.questions
        .map((q, i) => `${i + 1}. ${q.text}`)
        .join("\n");

      
      const firstQuestion = interview.questions[0]?.text ?? "";
      const firstMessage =
        `Hi! I'm your interviewer for the ${interview.role} position ` +
        `at ${interview.difficulty} level. I have ${interview.numQuestions} ` +
        `questions for you today. Let's begin.\n\n` +
        `Here's your first question: ${firstQuestion}`;

      const overrides = {
        firstMessage,
        variableValues: {
          role: interview.role,
          type: interview.type,
          level: interview.difficulty,
          numQuestions: String(interview.numQuestions),
          focusArea: interview.focusArea ?? "General",
          questions: questionsList,
          systemPrompt: systemPrompt,
        },
        
        silenceTimeoutSeconds: 30,
    
        maxDurationSeconds: 1800,
      };

      client.removeAllListeners("message");
      client.removeAllListeners("call-end");
      client.removeAllListeners("error");

      client.on("message", (message: unknown) => {
        if (!message || typeof message !== "object") return;
        const added = appendLineFromVapiMessage(
          lines,
          message as Record<string, unknown>
        );
        if (added) {
          
          handlers.onTranscriptLine?.(formatTranscriptForDisplay(lines));
        }
      });

      client.on("call-end", () => {
        
        handlers.onCallEnd?.(formatTranscriptForFeedback(lines));
      });

      client.on("error", (e: unknown) => {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: unknown }).message)
            : String(e);
        
        if (msg.includes("Meeting has ended") || msg.includes("ejection")) {
          console.warn("Vapi call ended:", msg);
          return;
        }
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
