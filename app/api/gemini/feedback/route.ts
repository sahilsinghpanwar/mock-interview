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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { role, type, difficulty, questions, transcript } = body;

    if (!role || !type || !difficulty) {
      return NextResponse.json(
        { error: "Missing role, type, or difficulty" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = buildFeedbackPrompt({
      role,
      type,
      difficulty,
      questions: Array.isArray(questions) ? questions : [],
      transcript: typeof transcript === "string" ? transcript : "",
    });

    const raw = await geminiGenerateText(apiKey, prompt);

    const clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(clean) as {
      score?: number;
      summary?: string;
      strengths?: string[];
      improvements?: string[];
      detailedFeedback?: string;
    };

    return NextResponse.json({
      score: typeof parsed.score === "number" ? parsed.score : 0,
      summary: parsed.summary ?? "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [],
      detailedFeedback: parsed.detailedFeedback ?? "",
    });
  } catch (error) {
    console.error("Gemini feedback failed:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
