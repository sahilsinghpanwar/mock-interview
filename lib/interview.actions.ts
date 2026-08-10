import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Individual interview question with candidate answer and evaluation data.
 * Stored inside the `questions` array in the `interviews` Firestore collection.
 */
export interface InterviewQuestion {
  /** Unique ID e.g. "q-1" */
  id: string;
  /** AI-generated question text */
  text: string;
  /** Candidate's spoken response extracted from transcript */
  userAnswer?: string;
  /** Evaluation rating for this response */
  rating?: string;
  /** Targeted coaching feedback for this question */
  feedback?: string;
}

/**
 * Structured per-question analysis returned by Gemini feedback.
 */
export interface QuestionAnalysis {
  questionId?: string;
  question: string;
  userAnswer: string;
  rating: string;
  feedback: string;
}

/**
 * Complete document schema for an Interview record in Firestore.
 */
export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: string;
  difficulty: string;
  numQuestions: number;
  questions: InterviewQuestion[];
  questionAnalysis?: QuestionAnalysis[];
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
  focusArea?: string;
  score?: number;
  feedbackSummary?: string;
  feedbackDetail?: string;
  strengths?: string[];
  improvements?: string[];
  transcriptSummary?: string;
}

export interface CreateInterviewResult {
  success: boolean;
  message: string;
  interviewId?: string;
}

/**
 * Payload for saving post-interview feedback to Firestore.
 */
export interface InterviewFeedbackPayload {
  score: number;
  summary: string;
  detailedFeedback: string;
  strengths: string[];
  improvements: string[];
  transcriptSummary: string;
  questions?: InterviewQuestion[];
  questionAnalysis?: QuestionAnalysis[];
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Extracts a human-readable message from a Firebase/Firestore error object.
 */
function getFirestoreErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const code = typeof e.code === "string" ? e.code : "";
    const msg = typeof e.message === "string" ? e.message : "";

    const codeMessages: Record<string, string> = {
      "permission-denied":
        "Firebase permission denied. Check Firestore Security Rules — the authenticated user may not have write access to this document.",
      "not-found":
        "Document not found in Firestore. The interview record may have been deleted.",
      unavailable:
        "Firestore is temporarily unavailable. Check your internet connection.",
      "deadline-exceeded":
        "Firestore request timed out. Check your internet connection.",
      unauthenticated:
        "User is not authenticated. Please sign in again.",
      cancelled:
        "Firestore operation was cancelled.",
      "resource-exhausted":
        "Firestore quota exceeded. Try again later.",
    };

    if (code && codeMessages[code]) {
      return codeMessages[code];
    }

    if (msg) return msg;
  }

  return "Unknown Firestore error occurred.";
}

/**
 * Normalizes a raw Firestore date value to an ISO string.
 */
function normalizeDate(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

/**
 * Maps a raw Firestore document snapshot into a typed Interview object.
 */
function mapDocToInterview(
  id: string,
  data: Record<string, unknown>
): Interview {
  const questions = normalizeQuestions(
    data.questions,
    typeof data.transcriptSummary === "string" ? data.transcriptSummary : undefined
  );

  return {
    id,
    ...(data as Omit<Interview, "id" | "questions" | "createdAt" | "status" | "numQuestions" | "questionAnalysis">),
    questions,
    createdAt: normalizeDate(data.createdAt),
    status: (data.status as Interview["status"]) ?? "pending",
    numQuestions: typeof data.numQuestions === "number" ? data.numQuestions : questions.length,
    questionAnalysis: Array.isArray(data.questionAnalysis) ? data.questionAnalysis : [],
  };
}

// ─── Question Normalization ───────────────────────────────────────────────────

/**
 * Parses transcript to backfill candidate answers into question objects
 * when `userAnswer` was not explicitly stored.
 */
export function parseQAPairsFromTranscript(
  questions: InterviewQuestion[],
  transcriptSummary?: string
): InterviewQuestion[] {
  if (!questions.length) return [];
  if (!transcriptSummary?.trim()) return questions;

  const lines = transcriptSummary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const questionAnswers: string[] = new Array(questions.length).fill("");
  let currentQIndex = 0;

  for (const line of lines) {
    const isInterviewer =
      line.startsWith("Interviewer:") || /^Q\d+:/.test(line);
    const isCandidate =
      line.startsWith("You:") ||
      line.startsWith("Candidate:") ||
      line.startsWith("User:") ||
      /^A\d+:/.test(line);

    if (isInterviewer) {
      const lowerLine = line.toLowerCase();
      for (let i = 0; i < questions.length; i++) {
        const qClean = questions[i].text.toLowerCase().replace(/[^a-z0-9]/g, "");
        const lineClean = lowerLine.replace(/[^a-z0-9]/g, "");
        if (qClean.length > 10 && lineClean.includes(qClean.slice(0, 20))) {
          currentQIndex = i;
          break;
        }
      }
    } else if (isCandidate) {
      const cleanText = line.replace(/^(You|Candidate|User|A\d+):\s*/i, "").trim();
      if (cleanText) {
        questionAnswers[currentQIndex] = questionAnswers[currentQIndex]
          ? questionAnswers[currentQIndex] + " " + cleanText
          : cleanText;
      }
    }
  }

  return questions.map((q, i) => {
    const existingAnswer = q.userAnswer?.trim();
    const extractedAnswer = questionAnswers[i]?.trim();
    return {
      ...q,
      userAnswer: existingAnswer || extractedAnswer || "",
    };
  });
}

/**
 * Normalizes raw Firestore `questions` data into strongly typed `InterviewQuestion[]`.
 * Supports legacy string arrays and current object arrays.
 */
export function normalizeQuestions(
  rawQuestions: unknown,
  transcriptSummary?: string
): InterviewQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  const parsed: InterviewQuestion[] = rawQuestions.map((q, i) => {
    if (typeof q === "string") {
      return { id: `q-${i + 1}`, text: q, userAnswer: "", rating: "", feedback: "" };
    }
    if (typeof q === "object" && q !== null) {
      const qObj = q as Record<string, unknown>;
      return {
        id: String(qObj.id ?? `q-${i + 1}`),
        text: String(qObj.text ?? ""),
        userAnswer: String(qObj.userAnswer ?? ""),
        rating: String(qObj.rating ?? ""),
        feedback: String(qObj.feedback ?? ""),
      };
    }
    return { id: `q-${i + 1}`, text: "", userAnswer: "", rating: "", feedback: "" };
  });

  return parseQAPairsFromTranscript(parsed, transcriptSummary);
}

// ─── Question Generation ──────────────────────────────────────────────────────

async function generateQuestions(
  role: string,
  type: string,
  difficulty: string,
  count: number,
  focusArea: string
): Promise<InterviewQuestion[]> {
  const response = await fetch("/api/gemini/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, type, difficulty, count, focusArea }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Failed to generate questions");
  }

  const data = (await response.json()) as { questions: string[] };
  if (!Array.isArray(data?.questions)) {
    throw new Error("Gemini API route did not return a valid questions array");
  }

  return data.questions.slice(0, count).map((text: string, i: number) => ({
    id: `q-${i + 1}`,
    text,
    userAnswer: "",
    rating: "",
    feedback: "",
  }));
}

/**
 * Recursively sanitizes objects before saving to Firestore by removing undefined values,
 * replacing them with empty strings or safe defaults so Firestore setDoc/updateDoc never fails.
 */
function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return "" as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    !(data instanceof Date) &&
    !(data instanceof Timestamp)
  ) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      } else {
        cleaned[key] = "";
      }
    }
    return cleaned as T;
  }

  return data;
}

// ─── CRUD Actions ─────────────────────────────────────────────────────────────

/**
 * Creates a new interview document in Firestore with AI-generated questions.
 */
export async function createInterview(
  userId: string,
  role: string,
  type: string,
  difficulty: string,
  numQuestions: number,
  focusArea: string
): Promise<CreateInterviewResult> {
  try {
    const questions = await generateQuestions(role, type, difficulty, numQuestions, focusArea);
    const ref = doc(collection(db, "interviews"));

    const interviewData = {
      id: ref.id,
      userId: userId || "",
      role: role || "",
      type: type || "",
      difficulty: difficulty || "",
      focusArea: focusArea || "General",
      numQuestions: numQuestions || questions.length,
      questions,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await setDoc(ref, sanitizeForFirestore(interviewData));
    console.log(`[Firebase] Interview created: ${ref.id}`);

    return {
      success: true,
      message: "Interview created successfully!",
      interviewId: ref.id,
    };
  } catch (error) {
    const message = getFirestoreErrorMessage(error);
    console.error("[Firebase] createInterview error:", message, error);
    return {
      success: false,
      message: `Failed to create interview: ${message}`,
    };
  }
}

/**
 * Fetches a single interview document by ID from Firestore.
 */
export async function getInterview(id: string): Promise<Interview | null> {
  try {
    const snap = await getDoc(doc(db, "interviews", id));
    if (!snap.exists()) {
      console.warn(`[Firebase] getInterview: doc ${id} not found.`);
      return null;
    }

    return mapDocToInterview(snap.id, snap.data() as Record<string, unknown>);
  } catch (error) {
    console.error("[Firebase] getInterview failed:", getFirestoreErrorMessage(error), error);
    return null;
  }
}

/**
 * Fetches all interviews for a given user, ordered by creation date descending.
 */
export async function getUserInterviews(userId: string): Promise<Interview[]> {
  try {
    let snapshot;

    try {
      // Attempt ordered query (requires composite index in Firestore)
      const q = query(
        collection(db, "interviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      snapshot = await getDocs(q);
    } catch {
      // Fallback: unordered query, sort client-side
      console.warn("[Firebase] Ordered query failed (index may be missing), falling back to client-side sort.");
      const fallbackQuery = query(
        collection(db, "interviews"),
        where("userId", "==", userId)
      );
      snapshot = await getDocs(fallbackQuery);
    }

    const interviews = snapshot.docs.map((docSnap) =>
      mapDocToInterview(docSnap.id, docSnap.data() as Record<string, unknown>)
    );

    // Always sort client-side to guarantee order
    return interviews.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[Firebase] getUserInterviews failed:", getFirestoreErrorMessage(error), error);
    return [];
  }
}

/**
 * Updates the status field of an interview document.
 * @throws {Error} If document is not found or Firestore update fails.
 */
export async function updateInterviewStatus(
  interviewId: string,
  status: Interview["status"]
): Promise<void> {
  const ref = doc(db, "interviews", interviewId);
  try {
    await updateDoc(ref, { status });
    console.log(`[Firebase] Interview ${interviewId} status → ${status}`);
  } catch (error) {
    const message = getFirestoreErrorMessage(error);
    console.error("[Firebase] updateInterviewStatus failed:", message, error);
    throw new Error(message);
  }
}

/**
 * Persists complete interview feedback, evaluation scores, candidate answers,
 * and per-question analysis into the Firestore interview document.
 *
 * @throws {Error} Re-throws on Firestore failure so the caller can surface the error to the user.
 */
export async function saveInterviewFeedback(
  interviewId: string,
  payload: InterviewFeedbackPayload
): Promise<void> {
  const ref = doc(db, "interviews", interviewId);

  const cleanQuestions = (payload.questions ?? []).map((q, idx) => ({
    id: q.id || `q-${idx + 1}`,
    text: q.text || "",
    userAnswer: q.userAnswer || "",
    rating: q.rating || "",
    feedback: q.feedback || "",
  }));

  const cleanQuestionAnalysis = (payload.questionAnalysis ?? []).map((qa, idx) => ({
    questionId: qa.questionId || `q-${idx + 1}`,
    question: qa.question || "",
    userAnswer: qa.userAnswer || "",
    rating: qa.rating || "",
    feedback: qa.feedback || "",
  }));

  const updateData: Record<string, unknown> = {
    score: typeof payload.score === "number" ? payload.score : 0,
    feedbackSummary: payload.summary || "",
    feedbackDetail: payload.detailedFeedback || "",
    strengths: Array.isArray(payload.strengths) ? payload.strengths : [],
    improvements: Array.isArray(payload.improvements) ? payload.improvements : [],
    transcriptSummary: payload.transcriptSummary || "",
    status: "completed",
  };

  if (cleanQuestions.length > 0) {
    updateData.questions = cleanQuestions;
  }

  if (cleanQuestionAnalysis.length > 0) {
    updateData.questionAnalysis = cleanQuestionAnalysis;
  }

  console.log(`[Firebase] Saving feedback for interview: ${interviewId}`, {
    score: payload.score,
    questionsCount: cleanQuestions.length,
    analysisCount: cleanQuestionAnalysis.length,
    transcriptLength: payload.transcriptSummary.length,
  });

  try {
    await updateDoc(ref, updateData);
    console.log(`[Firebase] ✅ Feedback saved successfully for interview: ${interviewId}`);
  } catch (error) {
    const message = getFirestoreErrorMessage(error);
    console.error(`[Firebase] ❌ saveInterviewFeedback failed for ${interviewId}:`, message, error);
    throw new Error(message);
  }
}

/**
 * Deletes an interview document by ID.
 */
export async function deleteInterview(interviewId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "interviews", interviewId));
    console.log(`[Firebase] Interview deleted: ${interviewId}`);
    return true;
  } catch (error) {
    console.error("[Firebase] deleteInterview failed:", getFirestoreErrorMessage(error), error);
    return false;
  }
}

// ─── Formatting Utilities ─────────────────────────────────────────────────────

/**
 * Formats an ISO date string for display in Indian Standard Time format (e.g. "10 Aug 2026, 9:50 am").
 */
export function formatInterviewDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Unknown date";
  }
}
