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

/**
 * Extracts candidate answers from transcript using explicit interviewer/candidate turn boundaries.
 * Associates candidate responses with their corresponding question based on conversation flow.
 */
function extractUserAnswersFromTranscript(
  transcript: string,
  questionCount: number,
  questions?: string[]
): string[] {
  if (!transcript.trim() || questionCount <= 0) return [];

  const lines = transcript.split("\n");
  const answers: string[] = new Array(questionCount).fill("");
  let currentQIndex = -1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isInterviewer =
      trimmed.startsWith("Interviewer:") ||
      trimmed.startsWith("Interviewer: ") ||
      /^Q\d+:/.test(trimmed);

    const isCandidate =
      trimmed.startsWith("You:") ||
      trimmed.startsWith("You: ") ||
      trimmed.startsWith("Candidate:") ||
      trimmed.startsWith("Candidate: ") ||
      trimmed.startsWith("User:") ||
      trimmed.startsWith("User: ") ||
      /^A\d+:/.test(trimmed);

    if (isInterviewer) {
      if (questions && questions.length > 0) {
        const lowerLine = trimmed.toLowerCase();
        for (let i = 0; i < questions.length; i++) {
          const qClean = questions[i].toLowerCase().replace(/[^a-z0-9]/g, "");
          const lineClean = lowerLine.replace(/[^a-z0-9]/g, "");
          if (qClean.length > 8 && lineClean.includes(qClean.slice(0, 20))) {
            currentQIndex = i;
            break;
          }
        }
      } else {
        if (currentQIndex < questionCount - 1) {
          currentQIndex++;
        }
      }
    } else if (isCandidate) {
      if (currentQIndex < 0) {
        currentQIndex = 0;
      }

      const cleanText = trimmed
        .replace(/^(You|Candidate|User|A\d+):\s*/i, "")
        .trim();

      if (cleanText && currentQIndex < questionCount) {
        if (answers[currentQIndex]) {
          answers[currentQIndex] += " " + cleanText;
        } else {
          answers[currentQIndex] = cleanText;
        }
      }
    }
  }

  return answers.map((a) => a.trim());
}

/**
 * Constructs structured fallback feedback when Gemini API is unavailable or quota is exceeded.
 */
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
  const isFullyCompleted = !didNothing && estimatedAnswered === totalQuestions;

  const summary = didNothing
    ? "The interview was stopped before any questions were answered. No conversation was recorded."
    : isFullyCompleted
    ? `The interview was completed (${estimatedAnswered}/${totalQuestions} questions). AI feedback is unavailable right now, but completing the full session is a good sign.`
    : `The interview was stopped early. Approximately ${estimatedAnswered} of ${totalQuestions} questions were attempted based on the transcript. A complete session would give a better picture of your readiness.`;

  const strengths = didNothing
    ? ["You set up the interview — that first step matters."]
    : !isFullyCompleted
    ? [
        "You started the interview and attempted some questions.",
        "Practice sessions, even incomplete ones, build familiarity with the format.",
      ]
    : [
        `You completed all of the ${role} interview questions.`,
        "Finishing the full set of questions shows good persistence and preparation.",
      ];

  const improvements = didNothing
    ? [
        "Try to complete at least one full mock interview session.",
        "Ensure your microphone is working before starting.",
        "Practice answering questions out loud to build confidence.",
      ]
    : !isFullyCompleted
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

  // Parse candidate responses for per-question analysis
  const extractedAnswers = extractUserAnswersFromTranscript(transcript, questions.length, questions);
  const questionAnalysis = questions.map((q, i) => {
    const rawAns = (extractedAnswers[i] || "").trim();
    const hasAnswer = rawAns.length > 0;
    const userAnswer = hasAnswer ? rawAns : "No answer recorded.";
    const rating = !hasAnswer
      ? "Unanswered"
      : rawAns.length > 20
      ? "Good"
      : "Needs Improvement";
    const feedback = !hasAnswer
      ? "No response was recorded for this question."
      : "Candidate responded. Detailed AI coaching feedback will generate when GEMINI_API_KEY is active.";

    return {
      question: q,
      userAnswer,
      rating,
      feedback,
    };
  });

  return { score, summary, strengths, improvements, detailedFeedback, questionAnalysis };
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
      questions: qs,
      transcript: tx,
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
        question?: string;
        userAnswer?: string;
        rating?: string;
        feedback?: string;
      }>;
    };

    // Extract user answers from transcript if Gemini didn't return them for some items
    const extractedAnswers = extractUserAnswersFromTranscript(tx, qs.length, qs);

    // Normalize questionAnalysis array
    const rawAnalysis = Array.isArray(parsed.questionAnalysis) ? parsed.questionAnalysis : [];
    const questionAnalysis = qs.map((qText, index) => {
      const matchedItem = rawAnalysis.find(
        (item) => item.question && item.question.toLowerCase().includes(qText.slice(0, 20).toLowerCase())
      ) || rawAnalysis[index];

      const rawUserAnswer = (matchedItem?.userAnswer || extractedAnswers[index] || "").trim();
      const isPlaceholder =
        !rawUserAnswer ||
        rawUserAnswer.toLowerCase() === "no answer recorded." ||
        rawUserAnswer.toLowerCase() === "no answer provided" ||
        rawUserAnswer.toLowerCase() === "answer recorded in transcript.";

      const hasAnswer = !isPlaceholder;
      const userAnswer = hasAnswer ? rawUserAnswer : "No answer recorded.";

      const rating = matchedItem?.rating
        ? matchedItem.rating
        : !hasAnswer
        ? "Unanswered"
        : rawUserAnswer.length > 25
        ? "Good"
        : "Needs Improvement";

      const feedback = matchedItem?.feedback
        ? matchedItem.feedback
        : !hasAnswer
        ? "No response was recorded for this question."
        : "Evaluation complete based on interview transcript.";

      return {
        question: qText,
        userAnswer,
        rating,
        feedback,
      };
    });

    return NextResponse.json({
      score: typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 0,
      summary: parsed.summary ?? "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      detailedFeedback: parsed.detailedFeedback ?? "",
      hiringSignal: parsed.hiringSignal ?? null,
      questionAnalysis,
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
      return NextResponse.json(buildFallbackFeedback(qs, tx, role));
    }

    return NextResponse.json(
      { error: "Failed to generate feedback. Please try again." },
      { status: 500 }
    );
  }
}
