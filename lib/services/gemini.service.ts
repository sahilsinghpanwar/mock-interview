/**
 * Gemini API Integration Service
 * Handles interview question generation and answer evaluation
 * 
 * This service uses Google's Gemini API to:
 * 1. Generate contextual interview questions based on field and level
 * 2. Evaluate user answers with detailed feedback
 * 3. Provide performance summaries and recommendations
 */

import {
  GeneratedQuestion,
  InterviewLevel,
  TechnicalField,
  AnswerFeedback,
  InterviewBriefFeedback,
  LEVEL_CONFIGS,
  FIELD_CONFIGS,
} from "@/lib/types/interview";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ─── Enhanced System Prompts ────────────────────────────────────────────────

/**
 * System prompt for generating interview questions
 * Instructs Gemini to create realistic, level-appropriate technical questions
 */
function getQuestionGenerationPrompt(
  field: TechnicalField,
  level: InterviewLevel,
  questionCount: number
): string {
  const fieldConfig = FIELD_CONFIGS[field];
  const levelConfig = LEVEL_CONFIGS[level];

  return `You are an expert technical interviewer specializing in ${fieldConfig.label}.

Your task is to generate ${questionCount} highly relevant interview questions for a ${level}-level candidate.

CONTEXT:
- Field: ${fieldConfig.label} (${fieldConfig.description})
- Key Technologies: ${fieldConfig.technologies.join(", ")}
- Common Topics: ${fieldConfig.commonQuestionPatterns.join(", ")}
- Level: ${levelConfig.description}
- Estimated Duration: ${levelConfig.estimatedDuration} minutes
- Focus Areas: ${levelConfig.focusAreas.join(", ")}

REQUIREMENTS:
1. Each question should be relevant to ${fieldConfig.label}
2. Difficulty should match ${level}-level expectations:
   - Junior: Focus on fundamentals, basic concepts, and problem-solving
   - Mid: Focus on advanced concepts, system design, and real-world scenarios
   - Senior: Focus on architecture, optimization, and leadership/mentoring
3. Include follow-up questions for deeper assessment
4. Questions should test both theoretical knowledge and practical experience
5. Mix different question types: conceptual, practical, scenario-based, and design

OUTPUT FORMAT:
Return a JSON array with exactly ${questionCount} questions in this format:
[
  {
    "questionText": "The main interview question",
    "category": "Category name (e.g., 'Advanced Concepts', 'System Design')",
    "difficulty": "${level}",
    "expectedKeyPoints": ["Key point 1", "Key point 2", "Key point 3"],
    "followUpQuestions": ["Follow-up 1", "Follow-up 2"]
  }
]

IMPORTANT:
- Return ONLY the JSON array, no additional text
- Ensure questions are distinct and non-repetitive
- Make questions challenging but fair for the ${level} level
- Include real-world scenarios and practical examples
- Questions should encourage detailed, thoughtful answers`;
}

/**
 * System prompt for evaluating user answers
 * Instructs Gemini to provide comprehensive, actionable feedback
 */
function getAnswerEvaluationPrompt(
  question: string,
  userAnswer: string,
  expectedKeyPoints: string[],
  level: InterviewLevel
): string {
  return `You are a senior technical interviewer evaluating a candidate's answer.

INTERVIEW CONTEXT:
- Candidate Level: ${level}
- Question Asked: "${question}"
- Candidate's Answer: "${userAnswer}"
- Expected Key Points: ${expectedKeyPoints.join(", ")}

EVALUATION CRITERIA:
1. Technical Accuracy (30%): How correct is the technical content?
2. Completeness (20%): Did they cover key points and depth?
3. Communication (20%): Was the answer clear and well-structured?
4. Real-world Application (20%): Did they provide practical examples?
5. Follow-up Potential (10%): Would this answer lead to good follow-ups?

SCORING GUIDELINES:
- 90-100: Excellent - Comprehensive, accurate, demonstrates deep understanding
- 70-89: Good - Accurate, covers main points, minor gaps
- 50-69: Fair - Mostly accurate, missing some depth, some confusion
- 30-49: Needs Improvement - Some accuracy, significant gaps, unclear
- Below 30: Poor - Inaccurate, minimal understanding

EVALUATION OUTPUT:
Provide ONLY a JSON object in this exact format (no other text):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2"],
  "detailedFeedback": "2-3 sentences of constructive feedback",
  "keyPointsDetected": ["detected point 1", "detected point 2"]
}`;
}

/**
 * System prompt for generating interview feedback summary
 * Creates a comprehensive brief feedback based on overall performance
 */
function getFeedbackSummaryPrompt(
  field: TechnicalField,
  level: InterviewLevel,
  overallScore: number,
  questionAnswerPairs: Array<{ q: string; a: string; score: number }>,
  strengths: string[],
  improvements: string[]
): string {
  const fieldConfig = FIELD_CONFIGS[field];

  return `You are providing comprehensive feedback to a ${level}-level ${fieldConfig.label} candidate after their technical interview.

INTERVIEW SUMMARY:
- Field: ${fieldConfig.label}
- Level: ${level}
- Overall Score: ${overallScore}/100
- Questions Asked: ${questionAnswerPairs.length}
- Candidate Strengths: ${strengths.join(", ")}
- Areas for Improvement: ${improvements.join(", ")}

FEEDBACK GENERATION:
Create a professional, encouraging yet honest feedback summary that includes:

1. Overall Performance Assessment
2. Strengths Demonstrated
3. Areas for Improvement
4. Specific Recommendations
5. Next Steps for Growth
6. Comparison with typical ${level}-level candidates

OUTPUT FORMAT (ONLY JSON, no other text):
{
  "performanceLevel": "<poor|needs-improvement|good|excellent>",
  "summary": "1-2 paragraph overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2", "area 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "comparisonWithLevel": "How does this compare to typical ${level}-level candidates?",
  "nextSteps": ["step 1", "step 2", "step 3"]
}`;
}

// ─── API Calls ────────────────────────────────────────────────────────────

/**
 * Generate interview questions using Gemini API
 * @param field - The technical field (e.g., web-development)
 * @param level - The interview level (junior, mid, senior)
 * @returns Array of generated questions
 */
export async function generateInterviewQuestions(
  field: TechnicalField,
  level: InterviewLevel
): Promise<GeneratedQuestion[]> {
  try {
    const levelConfig = LEVEL_CONFIGS[level];
    const prompt = getQuestionGenerationPrompt(field, level, levelConfig.questionsCount);

    const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    const questions = JSON.parse(content);
    console.log(`✓ Generated ${questions.length} questions for ${field} - ${level}`);

    return questions.map((q: GeneratedQuestion, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      ...q,
    }));
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

/**
 * Evaluate a user's answer to an interview question
 * @param question - The interview question asked
 * @param userAnswer - The user's answer text
 * @param expectedKeyPoints - Expected points in the answer
 * @param level - The interview level for context
 * @returns Feedback on the answer (without questionId, add it in caller)
 */
export async function evaluateAnswer(
  question: string,
  userAnswer: string,
  expectedKeyPoints: string[],
  level: InterviewLevel
): Promise<Omit<AnswerFeedback, 'questionId'>> {
  try {
    const prompt = getAnswerEvaluationPrompt(question, userAnswer, expectedKeyPoints, level);

    const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(20000), // 20 second timeout
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    const feedback = JSON.parse(content);
    console.log(`✓ Evaluated answer with score: ${feedback.score}`);

    return feedback as Omit<AnswerFeedback, 'questionId'>;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
}

/**
 * Generate comprehensive interview feedback summary
 * @param field - The technical field
 * @param level - The interview level
 * @param overallScore - Overall performance score
 * @param qa - Question-answer pairs with scores
 * @param strengths - Identified strengths
 * @param improvements - Identified areas for improvement
 * @returns Brief feedback summary
 */
export async function generateFeedbackSummary(
  field: TechnicalField,
  level: InterviewLevel,
  overallScore: number,
  qa: Array<{ q: string; a: string; score: number }>,
  strengths: string[],
  improvements: string[]
): Promise<InterviewBriefFeedback> {
  try {
    const prompt = getFeedbackSummaryPrompt(
      field,
      level,
      overallScore,
      qa,
      strengths,
      improvements
    );

    const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(20000), // 20 second timeout
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    const feedback = JSON.parse(content);
    console.log(`✓ Generated feedback summary with performance level: ${feedback.performanceLevel}`);

    return {
      overallScore,
      ...feedback,
    };
  } catch (error) {
    console.error("Error generating feedback summary:", error);
    throw error;
  }
}

/**
 * Verify Gemini API configuration
 */
export function verifyGeminiConfig(): boolean {
  if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not configured in .env.local");
    return false;
  }
  console.log("✓ Gemini API configured");
  return true;
}
