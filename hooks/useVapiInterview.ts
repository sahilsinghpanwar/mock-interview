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
        grouped.push(`${currentRole}: ${currentText.trim()}`);
      }
      currentRole = role;
      currentText = text;
    }
  }

  if (currentRole && currentText) {
    grouped.push(`${currentRole}: ${currentText.trim()}`);
  }

  return grouped.join("\n");
}


function findQuestionStartIndex(content: string, questionText: string): number {
  const cleanContent = content.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanContent) return -1;

  const words = questionText.trim().split(/\s+/);
  if (words.length === 0) return -1;

  const candidates: string[] = [];

  // 1. Full question
  candidates.push(questionText);

  // 2. Phrase of 5 words starting at word 0, 1, 2, 3
  for (let startWord = 0; startWord <= 3; startWord++) {
    if (words.length >= startWord + 5) {
      candidates.push(words.slice(startWord, startWord + 5).join(" "));
    }
  }

  // 3. Middle phrase of 5 words
  if (words.length > 8) {
    const mid = Math.floor(words.length / 2);
    candidates.push(words.slice(mid - 2, mid + 3).join(" "));
  }

  // Search for candidates
  for (const candidate of candidates) {
    const cleanCand = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanCand.length < 10) continue;

    const cleanMatchIdx = cleanContent.indexOf(cleanCand);
    if (cleanMatchIdx !== -1) {
      const originalMatchIdx = mapCleanIndexToOriginal(content, cleanMatchIdx);
      if (originalMatchIdx !== -1) {
        let boundaryIdx = -1;
        for (let j = originalMatchIdx - 1; j >= 0; j--) {
          const char = content[j];
          if (char === "." || char === "!" || char === "?" || char === "\n") {
            boundaryIdx = j;
            break;
          }
        }
        return boundaryIdx !== -1 ? boundaryIdx + 1 : 0;
      }
    }
  }

  return -1;
}

function mapCleanIndexToOriginal(originalStr: string, cleanIdx: number): number {
  let cleanCounter = 0;
  for (let i = 0; i < originalStr.length; i++) {
    const char = originalStr[i].toLowerCase();
    if (/[a-z0-9]/.test(char)) {
      if (cleanCounter === cleanIdx) {
        return i;
      }
      cleanCounter++;
    }
  }
  return -1;
}

function formatInterviewerText(content: string, questions: { id: string; text: string }[]): string {
  interface MatchInfo {
    qNum: number;
    start: number;
  }

  const matches: MatchInfo[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const startIdx = findQuestionStartIndex(content, q.text);
    if (startIdx !== -1) {
      matches.push({
        qNum: i + 1,
        start: startIdx,
      });
    }
  }

  if (matches.length === 0) {
    return content;
  }

  matches.sort((a, b) => a.start - b.start);

  let formatted = "";
  let lastIdx = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.start < lastIdx) {
      continue;
    }

    const textBefore = content.slice(lastIdx, match.start).trim();
    if (textBefore) {
      formatted += textBefore + "\n\n";
    }

    const nextStart = i + 1 < matches.length ? matches[i + 1].start : content.length;
    const questionText = content.slice(match.start, nextStart).trim();

    formatted += `Q${match.qNum}: ${questionText}`;
    lastIdx = nextStart;
  }

  const textAfter = content.slice(lastIdx).trim();
  if (textAfter) {
    formatted += "\n\n" + textAfter;
  }

  return formatted;
}

  // Formats transcript lines for the live display panel.
  // Groups consecutive interviewer lines and user lines together.
 
function formatTranscriptForDisplay(lines: string[], questions: { id: string; text: string }[]): string {
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
        if (currentRole === "Interviewer") {
          const formattedText = formatInterviewerText(currentText, questions);
          grouped.push(`Interviewer: ${formattedText}`);
        } else {
          grouped.push(`${currentRole}: ${currentText}`);
        }
      }
      currentRole = role;
      currentText = text;
    }
  }

  if (currentRole && currentText) {
    if (currentRole === "Interviewer") {
      const formattedText = formatInterviewerText(currentText, questions);
      grouped.push(`Interviewer: ${formattedText}`);
    } else {
      grouped.push(`${currentRole}: ${currentText}`);
    }
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
          
          handlers.onTranscriptLine?.(formatTranscriptForDisplay(lines, interview.questions));
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
