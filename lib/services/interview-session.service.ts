/**
 * Interview Session Management Service
 * Handles creating, updating, and managing interview sessions
 * Coordinates between Gemini (questions), VAPI (voice), and Database
 */

import {
  InterviewSession,
  TechnicalField,
  InterviewLevel,
  UserAnswer,
  AnswerFeedback,
  InterviewBriefFeedback,
} from "@/lib/types/interview";
import { generateInterviewQuestions, evaluateAnswer, generateFeedbackSummary } from "./gemini.service";
import { startVAPICall, endVAPICall } from "./vapi.service";

// ─── Session Database (In-memory for now, replace with Firestore) ──────────

const sessionStore = new Map<string, InterviewSession>();

// ─── Session Lifecycle ────────────────────────────────────────────────────

/**
 * Create a new interview session
 * @param userId - User ID
 * @param field - Technical field
 * @param level - Interview level
 * @returns New interview session
 */
export async function createInterviewSession(
  userId: string,
  field: TechnicalField,
  level: InterviewLevel
): Promise<InterviewSession> {
  try {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(`Generating questions for ${field} at ${level} level...`);
    const questions = await generateInterviewQuestions(field, level);

    const session: InterviewSession = {
      id: sessionId,
      userId,
      field,
      level,
      status: "not_started",
      questions: questions as never,
      userAnswers: [],
      feedback: [],
    };

    sessionStore.set(sessionId, session);
    console.log(`✓ Interview session created: ${sessionId}`);

    return session;
  } catch (error) {
    console.error("Error creating interview session:", error);
    throw error;
  }
}

/**
 * Get an interview session by ID
 * @param sessionId - Session ID
 * @returns Interview session or null
 */
export async function getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
  return sessionStore.get(sessionId) || null;
}

/**
 * Update interview session status
 * @param sessionId - Session ID
 * @param status - New status
 * @param updates - Additional updates
 */
export async function updateSessionStatus(
  sessionId: string,
  status: InterviewSession["status"],
  updates?: Partial<InterviewSession>
): Promise<InterviewSession> {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const updated = {
    ...session,
    status,
    ...updates,
    startTime: status === "in_progress" && !session.startTime ? new Date() : session.startTime,
  };

  sessionStore.set(sessionId, updated);
  console.log(`✓ Session status updated to: ${status}`);

  return updated;
}

/**
 * Start a VAPI call for the interview session
 * @param sessionId - Session ID
 * @param phoneNumber - Optional phone number for VAPI call
 * @returns Updated session with VAPI call ID
 */
export async function startInterviewCall(
  sessionId: string,
  phoneNumber?: string
): Promise<InterviewSession> {
  try {
    const session = await getInterviewSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    console.log("Initiating VAPI voice call...");
    const { callId } = await startVAPICall(phoneNumber, session.questions, session.level);

    const updated = await updateSessionStatus(sessionId, "in_progress", {
      vapiCallId: callId,
    });

    console.log(`✓ Interview call started with VAPI ID: ${callId}`);
    return updated;
  } catch (error) {
    console.error("Error starting interview call:", error);
    throw error;
  }
}

/**
 * Record a user's answer to a question
 * @param sessionId - Session ID
 * @param questionId - Question ID
 * @param answerText - Answer text (from VAPI transcript)
 * @param answerDuration - Duration in seconds
 * @returns Updated session
 */
export async function recordAnswer(
  sessionId: string,
  questionId: string,
  answerText: string,
  answerDuration: number
): Promise<InterviewSession> {
  const session = await getInterviewSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const userAnswer: UserAnswer = {
    questionId,
    answerText,
    answerDuration,
    timestamp: new Date(),
  };

  const updated = {
    ...session,
    userAnswers: [...session.userAnswers, userAnswer],
  };

  sessionStore.set(sessionId, updated);
  console.log(`✓ Answer recorded for question: ${questionId}`);

  return updated;
}

/**
 * Evaluate a user's answer and generate feedback
 * @param sessionId - Session ID
 * @param questionId - Question ID
 * @returns Updated session with feedback
 */
export async function evaluateUserAnswer(
  sessionId: string,
  questionId: string
): Promise<InterviewSession> {
  try {
    const session = await getInterviewSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const question = session.questions.find((q) => q.id === questionId);
    const answer = session.userAnswers.find((a) => a.questionId === questionId);

    if (!question || !answer) {
      throw new Error("Question or answer not found");
    }

    console.log(`Evaluating answer for: ${question.questionText}`);
    const evaluation = await evaluateAnswer(
      question.questionText,
      answer.answerText,
      question.expectedKeyPoints,
      session.level
    );

    const feedback: AnswerFeedback = {
      questionId,
      ...evaluation,
    };

    const updated = {
      ...session,
      feedback: [...session.feedback, feedback],
    };

    sessionStore.set(sessionId, updated);
    console.log(`✓ Feedback generated with score: ${feedback.score}`);

    return updated;
  } catch (error) {
    console.error("Error evaluating user answer:", error);
    throw error;
  }
}

/**
 * Complete the interview session
 * @param sessionId - Session ID
 * @returns Updated session with feedback summary
 */
export async function completeInterviewSession(
  sessionId: string
): Promise<InterviewSession & { briefFeedback: InterviewBriefFeedback }> {
  try {
    const session = await getInterviewSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // End VAPI call if active
    if (session.vapiCallId) {
      await endVAPICall(session.vapiCallId);
    }

    // Calculate overall score
    const feedbackScores = session.feedback.map((f) => f.score);
    const overallScore =
      feedbackScores.length > 0
        ? Math.round(feedbackScores.reduce((a, b) => a + b, 0) / feedbackScores.length)
        : 0;

    // Collect strengths and areas for improvement
    const strengths = Array.from(
      new Set(session.feedback.flatMap((f) => f.strengths))
    );
    const improvements = Array.from(
      new Set(session.feedback.flatMap((f) => f.areasForImprovement))
    );

    // Generate comprehensive feedback
    const qa = session.feedback.map((f, i) => ({
      q: session.questions[i]?.questionText || "Unknown",
      a: session.userAnswers[i]?.answerText || "No answer",
      score: f.score,
    }));

    console.log("Generating comprehensive feedback summary...");
    const briefFeedback = await generateFeedbackSummary(
      session.field,
      session.level,
      overallScore,
      qa,
      strengths,
      improvements
    );

    const endTime = new Date();
    const duration = session.startTime
      ? Math.round((endTime.getTime() - session.startTime.getTime()) / 1000)
      : 0;

    const completedSession = {
      ...session,
      status: "completed" as const,
      overallScore,
      endTime,
      duration,
    };

    sessionStore.set(sessionId, completedSession);
    console.log(`✓ Interview completed with score: ${overallScore}/100`);

    return {
      ...completedSession,
      briefFeedback,
    };
  } catch (error) {
    console.error("Error completing interview session:", error);
    throw error;
  }
}

/**
 * Get all sessions for a user
 * @param userId - User ID
 * @returns Array of user sessions
 */
export async function getUserSessions(userId: string): Promise<InterviewSession[]> {
  return Array.from(sessionStore.values()).filter((s) => s.userId === userId);
}

/**
 * Pause an interview session
 * @param sessionId - Session ID
 */
export async function pauseSession(sessionId: string): Promise<InterviewSession> {
  const session = await getInterviewSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  if (session.vapiCallId) {
    await endVAPICall(session.vapiCallId);
  }

  return await updateSessionStatus(sessionId, "paused");
}

/**
 * Resume a paused session
 * @param sessionId - Session ID
 * @param phoneNumber - Optional phone number for VAPI call
 */
export async function resumeSession(
  sessionId: string,
  phoneNumber?: string
): Promise<InterviewSession> {
  const session = await getInterviewSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return await startInterviewCall(sessionId, phoneNumber);
}

/**
 * Export session data for storage
 * @param sessionId - Session ID
 */
export async function exportSessionData(sessionId: string): Promise<string> {
  const session = await getInterviewSession(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  return JSON.stringify(session, null, 2);
}
