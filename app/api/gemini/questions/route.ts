import { NextResponse } from "next/server";
import { geminiGenerateText } from "@/lib/gemini/server";
import { buildQuestionGenerationPrompt } from "@/lib/prompts/interviewerPrompts";

type GenerateQuestionsBody = {
  role?: string;
  type?: string;
  difficulty?: string;
  count?: number;
  focusArea?: string;
};

export async function POST(req: Request) {
  try {
    const { role, type, difficulty, count, focusArea } =
      (await req.json()) as GenerateQuestionsBody;

    if (!role || !type || !difficulty || !count || count < 1) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const prompt = buildQuestionGenerationPrompt({
      role,
      type,
      difficulty,
      count,
      focusArea: focusArea?.trim() || "General",
    });

    const text = await geminiGenerateText(apiKey, prompt);

    const clean = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(clean) as string[];
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini did not return an array");
    }

    return NextResponse.json({ questions: parsed.slice(0, count) });
  } catch (error) {
    console.error("Gemini question generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}
