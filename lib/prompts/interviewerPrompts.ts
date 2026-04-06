import type { Interview } from "@/lib/interview.actions";

/** Domain hints for Gemini (web, mobile, etc.) */
export function buildDomainContextLine(focusArea: string, role: string): string {
  const focus = focusArea.trim();
  if (focus && focus !== "General") {
    return `Primary focus area: ${focus}. Role title: ${role}.`;
  }
  return `Role / stack context: ${role}. Infer domain (e.g. web, Android, backend) from this title when choosing topics.`;
}

/**
 * Prompt for generating interview questions (JSON array of strings).
 * Kept in one place so API routes and docs stay aligned.
 */
export function buildQuestionGenerationPrompt(input: {
  role: string;
  type: string;
  difficulty: string;
  count: number;
  focusArea: string;
}): string {
  const { role, type, difficulty, count, focusArea } = input;
  const domain = buildDomainContextLine(focusArea, role);

  return `You are an expert hiring manager and technical interviewer.

${domain}

Generate exactly ${count} interview questions for a ${difficulty}-level candidate.

Interview format: ${type}
- Technical: coding, algorithms, debugging, APIs, frameworks, and practical trade-offs relevant to the role and focus area.
- Behavioral: STAR-style prompts about collaboration, conflict, ownership, and learning; still tie examples to software/product work when possible.
- System Design: scalability, reliability, data modeling, APIs, caching, consistency, and operational concerns appropriate to ${difficulty} depth.

Difficulty calibration:
- Junior: fundamentals, clear scenarios, limited scope; avoid senior-only architecture traps.
- Mid: multi-step reasoning, production awareness, reasonable trade-offs.
- Senior: depth on architecture, scaling, mentoring, incident response, and ambiguous requirements.

Rules:
- Questions must be specific to the role/focus (e.g. Android vs web vs backend) when the role implies a stack.
- Each question is one clear sentence or short paragraph (still one question, not multiple parts unless necessary).
- Do NOT prefix with numbers or bullets in the strings.
- Return ONLY a valid JSON array of strings. No markdown, no code fences, no commentary.

Example shape:
["Question one?", "Question two?"]`;
}

/**
 * System prompt for the Vapi voice agent: uses the same questions your app generated via Gemini.
 */
export function buildVapiVoiceSystemPrompt(interview: Interview): string {
  const numbered = interview.questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  return `You are a professional mock interviewer conducting a voice session.

Context:
- Role: ${interview.role}
- Interview type: ${interview.type}
- Level: ${interview.difficulty}
- Planned number of questions: ${interview.numQuestions}
${interview.focusArea && interview.focusArea !== "General" ? `- Focus area: ${interview.focusArea}` : ""}

You MUST ask exactly these questions, in order, one at a time:
${numbered}

Behavior:
- Start briefly: greet the candidate, state the role and interview type, then ask question 1.
- After each answer: give a short acknowledgment (one sentence), optionally one brief follow-up only if needed for clarity, then move to the next question.
- Do not invent new main questions beyond the list. If the candidate goes off-topic, steer back politely.
- Keep your spoken turns concise so the session fits a reasonable duration.
- End professionally after the last question: thank them and say the session is complete.

Tone: supportive, neutral, interview-realistic.`;
}

export function buildFeedbackPrompt(input: {
  role: string;
  type: string;
  difficulty: string;
  questions: string[];
  transcript: string;
}): string {
  return `You are an experienced engineering hiring manager.

Mock interview context:
- Role: ${input.role}
- Type: ${input.type}
- Level: ${input.difficulty}

Planned questions (reference):
${input.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Conversation transcript (may be partial; user and assistant turns):
${input.transcript || "(No transcript captured.)"}

Task:
Evaluate the candidate's performance based on the transcript. If the transcript is empty or too short, say so briefly and still give generic improvement tips for this role/level.

Return ONLY valid JSON with this exact shape (no markdown):
{
  "score": <number 0-100>,
  "summary": "<2-4 sentences overall>",
  "strengths": ["<bullet>", "<bullet>"],
  "improvements": ["<bullet>", "<bullet>"],
  "detailedFeedback": "<3-6 sentences: actionable feedback on communication, technical depth, and structure>"
}`;
}
