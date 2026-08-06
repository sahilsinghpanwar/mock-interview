import { NextResponse } from "next/server";
import { geminiGenerateText } from "@/lib/gemini/server";
import { buildFeedbackPrompt } from "@/lib/prompts/interviewerPrompts";

type Body = {
  role?: string;
  type?: string;
  difficulty?: string;
  questions?: string[];
  transcript?: string;
};

function buildFallbackFeedback(
  questions: string[],
  transcript: string,
  role: string
) {
  const transcriptWords = transcript.trim().split(/\s+/).filter(Boolean).length;
  const totalQuestions = questions.length || 1;

  // Estimate how many questions were answered based on transcript length
  const wordsPerAnswer = 60;
  const estimatedAnswered = Math.min(
    Math.floor(transcriptWords / wordsPerAnswer),
    totalQuestions
  );
  const completionRatio = estimatedAnswered / totalQuestions;

  // Score: 0 answers = 0, all answered = 65 (fallback cap, no AI analysis)
  const score =
    transcriptWords < 20
      ? 0
      : Math.round(Math.max(10, Math.min(65, completionRatio * 65)));

  const didNothing = transcriptWords < 20;
  const stoppedEarly = !didNothing && completionRatio < 0.5;
  const mostlyDone = !didNothing && completionRatio >= 0.5;

  const summary = didNothing
    ? "The interview was stopped before any questions were answered. No conversation was recorded."
    : stoppedEarly
    ? `The interview was stopped early. Approximately ${estimatedAnswered} of ${totalQuestions} questions were attempted based on the transcript. A complete session would give a better picture of your readiness.`
    : `The interview was mostly completed (approximately ${estimatedAnswered}/${totalQuestions} questions). AI feedback is unavailable right now, but completing the full session is a good sign.`;

  const strengths = didNothing
    ? ["You set up the interview — that first step matters."]
    : stoppedEarly
    ? [
        "You started the interview and attempted some questions.",
        "Practice sessions, even incomplete ones, build familiarity with the format.",
      ]
    : [
        `You completed most of the ${role} interview questions.`,
        "Finishing the majority of questions shows good persistence and preparation.",
      ];

  const improvements = didNothing
    ? [
        "Try to complete at least one full mock interview session.",
        "Ensure your microphone is working before starting.",
        "Practice answering questions out loud to build confidence.",
      ]
    : stoppedEarly
    ? [
        "Aim to complete all questions in one sitting for a full assessment.",
        "If you get stuck, take a breath and structure your answer using STAR method.",
        "Practice staying calm under pressure — finishing is more valuable than perfection.",
      ]
    : [
        "Review each question after the session and refine your answers.",
        "Focus on concise, structured responses for stronger impressions.",
        "Try a full session with AI feedback enabled for detailed coaching.",
      ];

  const detailedFeedback = didNothing
    ? "No transcript was captured. The session ended before any meaningful conversation occurred. Please ensure your microphone is working and try again. AI-powered feedback requires a completed session."
    : `AI-powered feedback is temporarily unavailable (Gemini API quota/key issue). Based on transcript analysis: approximately ${transcriptWords} words were spoken across an estimated ${estimatedAnswered} of ${totalQuestions} questions. To unlock detailed AI feedback, update your GEMINI_API_KEY at https://aistudio.google.com/app/apikey and retry.`;

  return { score, summary, strengths, improvements, detailedFeedback };
}

export async function POST(req: Request) {
  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { role, type, difficulty, questions, transcript } = body;

  if (!role || !type || !difficulty) {
    return NextResponse.json(
      { error: "Missing role, type, or difficulty" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const qs = Array.isArray(questions) ? questions : [];
  const tx = typeof transcript === "string" ? transcript : "";

  if (!apiKey) {
    console.warn("[API] GEMINI_API_KEY not set — returning fallback feedback");
    return NextResponse.json(buildFallbackFeedback(qs, tx, role));
  }

  try {
    const prompt = buildFeedbackPrompt({
      role,
      type,
      difficulty,
      questions: Array.isArray(questions) ? questions : [],
      transcript: typeof transcript === "string" ? transcript : "",
    });

    const raw = await geminiGenerateText(apiKey, prompt);
    const clean = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

    const parsed = JSON.parse(clean) as {
      score?: number;
      summary?: string;
      strengths?: string[];
      improvements?: string[];
      detailedFeedback?: string;
      hiringSignal?: string;
      questionAnalysis?: Array<{
        question: string;
        rating: string;
        feedback: string;
      }>;
    };

    return NextResponse.json({
      score: typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 0,
      summary: parsed.summary ?? "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      detailedFeedback: parsed.detailedFeedback ?? "",
      hiringSignal: parsed.hiringSignal ?? null,
      questionAnalysis: Array.isArray(parsed.questionAnalysis) ? parsed.questionAnalysis : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Gemini feedback failed:", message);

    const isQuotaOrAuth =
      message.includes("401") ||
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("Unauthorized") ||
      message.includes("All models");

    if (isQuotaOrAuth) {
      console.warn("[API] Returning fallback feedback due to Gemini unavailability");
      const qs = Array.isArray(questions) ? questions : [];
      const tx = typeof transcript === "string" ? transcript : "";
      return NextResponse.json(buildFallbackFeedback(qs, tx, role));
    }

    return NextResponse.json(
      { error: "Failed to generate feedback. Please try again." },
      { status: 500 }
    );
  }
}
