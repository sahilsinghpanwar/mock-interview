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

// Fallback questions when Gemini quota is exhausted — interview must go on!
function getFallbackQuestions(role: string, type: string, count: number): string[] {
  const technical = [
    `What are the core principles you follow when designing a ${role} system?`,
    `Walk me through how you would debug a critical production issue in your ${role} role.`,
    "How do you ensure code quality and maintainability in your projects?",
    `Describe the most technically challenging problem you've solved as a ${role}.`,
    `How do you stay updated with the latest trends and best practices in ${role}?`,
    "What is your approach to writing tests and ensuring adequate coverage?",
    "How do you handle technical debt in a fast-moving project?",
    "Describe your experience with version control and code review processes.",
    "How do you approach performance optimization in your projects?",
    `What development tools and workflows do you rely on most as a ${role}?`,
  ];

  const behavioral = [
    "Tell me about a time you had a conflict with a teammate. How did you resolve it?",
    "Describe a situation where you had to meet a tight deadline. What was your approach?",
    "Give me an example of a project you're most proud of and why.",
    "Tell me about a time you failed and what you learned from it.",
    "Describe a situation where you had to adapt quickly to a major change.",
    "How do you prioritize tasks when everything seems urgent?",
    "Tell me about a time you mentored or helped a colleague grow.",
    "Describe a situation where you had to push back on a requirement or decision.",
    "Tell me about a time you took ownership of a problem outside your role.",
    "Describe a time you had to explain a complex technical concept to a non-technical stakeholder.",
  ];

  const systemDesign = [
    `Design a scalable notification system for a large ${role} platform.`,
    "How would you design a URL shortener that handles millions of requests per day?",
    "Walk me through the design of a real-time chat application.",
    "How would you architect a system that needs 99.99% uptime?",
    "Design a rate limiter for a public API.",
    "How would you design a distributed caching layer?",
    "Walk me through your approach to designing a data pipeline for analytics.",
    "How would you design an authentication and authorization system?",
    "Design a search feature that needs to return results in under 100ms.",
    "How would you handle database migrations in a zero-downtime deployment?",
  ];

  const lowerType = type.toLowerCase();
  const pool = lowerType.includes("behavioral")
    ? behavioral
    : lowerType.includes("system")
    ? systemDesign
    : technical;

  return pool.slice(0, Math.min(count, pool.length));
}

export async function POST(req: Request) {
  // Parse body once upfront so it's available for fallback too
  let body: GenerateQuestionsBody = {};
  try {
    body = (await req.json()) as GenerateQuestionsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { role, type, difficulty, count, focusArea } = body;

  if (!role || !type || !difficulty || !count || count < 1) {
    return NextResponse.json(
      { error: "Missing required fields: role, type, difficulty, count" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[API] GEMINI_API_KEY not set — using fallback questions");
    return NextResponse.json({
      questions: getFallbackQuestions(role, type, count),
      fallback: true,
    });
  }

  try {
    const prompt = buildQuestionGenerationPrompt({
      role,
      type,
      difficulty,
      count,
      focusArea: focusArea?.trim() || "General",
    });

    const text = await geminiGenerateText(apiKey, prompt);

    // Strip markdown fences if model wrapped JSON in them
    const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(clean) as string[];

    if (!Array.isArray(parsed)) throw new Error("Gemini did not return a JSON array");

    return NextResponse.json({ questions: parsed.slice(0, count) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] Gemini question generation failed:", message);

    const isQuotaOrAuth =
      message.includes("429") ||
      message.includes("401") ||
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("Unauthorized") ||
      message.includes("All models");

    if (isQuotaOrAuth) {
      // Graceful fallback — don't crash the interview flow
      console.warn("[API] Falling back to built-in questions due to Gemini unavailability");
      return NextResponse.json({
        questions: getFallbackQuestions(role, type, count),
        fallback: true,
        warning: "Using built-in questions (Gemini quota/key issue). Please update GEMINI_API_KEY.",
      });
    }

    return NextResponse.json(
      { error: "Failed to generate interview questions. Please try again." },
      { status: 500 }
    );
  }
}
