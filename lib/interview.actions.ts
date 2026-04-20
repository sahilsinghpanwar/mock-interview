import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Types

export interface InterviewQuestion {
  id: string;
  text: string;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  type: string;
  difficulty: string;
  numQuestions: number;
  questions: InterviewQuestion[];
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

// Generate Questions via Gemini

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
    const data = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Failed to generate questions");
  }

  const data = (await response.json()) as { questions: string[] };
  const parsed = data?.questions;

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini API route did not return a valid questions array");
  }

  return parsed.slice(0, count).map((questionText: string, i: number) => ({
    id: `q-${i + 1}`,
    text: questionText,
  }));
}

// Create Interview

export async function createInterview(
  userId: string,
  role: string,
  type: string,
  difficulty: string,
  numQuestions: number,
  focusArea: string
): Promise<CreateInterviewResult> {
  try {
    const questions = await generateQuestions(
      role,
      type,
      difficulty,
      numQuestions,
      focusArea
    );
    const ref = doc(collection(db, "interviews"));

    await setDoc(ref, {
      id: ref.id,
      userId,
      role,
      type,
      difficulty,
      focusArea,
      numQuestions,
      questions,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Interview created successfully!",
      interviewId: ref.id,
    };
  } catch (error) {
    console.error("createInterview error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      message: `Failed to create interview: ${errorMessage}`,
    };
  }
}

// Get Single Interview

export async function getInterview(id: string): Promise<Interview | null> {
  try {
    const snap = await getDoc(doc(db, "interviews", id));
    if (!snap.exists()) return null;

    const data = snap.data();

    return {
      id: snap.id,
      ...data,
      createdAt: normalizeDate(data.createdAt),
      status: data.status ?? "pending",
      numQuestions: data.numQuestions ?? data.questions?.length ?? 0,
    } as Interview;
  } catch (error) {
    console.error("getInterview error:", error);
    return null;
  }
}

// Get All Interviews for a User

export async function getUserInterviews(userId: string): Promise<Interview[]> {
  try {
    let snapshot;

    try {
      
      const q = query(
        collection(db, "interviews"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      snapshot = await getDocs(q);
    } catch {
      const fallbackQuery = query(
        collection(db, "interviews"),
        where("userId", "==", userId)
      );
      snapshot = await getDocs(fallbackQuery);

      const docs = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: normalizeDate(data.createdAt),
            status: data.status ?? "pending",
            numQuestions: data.numQuestions ?? data.questions?.length ?? 0,
          } as Interview;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      return docs;
    }

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: normalizeDate(data.createdAt),
        status: data.status ?? "pending",
        numQuestions: data.numQuestions ?? data.questions?.length ?? 0,
      } as Interview;
    });
  } catch (error) {
    console.error("getUserInterviews error:", error);
    return [];
  }
}

// Update Interview Status

export async function updateInterviewStatus(
  interviewId: string,
  status: "pending" | "in-progress" | "completed"
): Promise<void> {
  try {
    await updateDoc(doc(db, "interviews", interviewId), { status });
  } catch (error) {
    console.error("updateInterviewStatus error:", error);
  }
}

export interface InterviewFeedbackPayload {
  score: number;
  summary: string;
  detailedFeedback: string;
  strengths: string[];
  improvements: string[];
  transcriptSummary: string;
}

export async function saveInterviewFeedback(
  interviewId: string,
  payload: InterviewFeedbackPayload
): Promise<void> {
  try {
    await updateDoc(doc(db, "interviews", interviewId), {
      score: payload.score,
      feedbackSummary: payload.summary,
      feedbackDetail: payload.detailedFeedback,
      strengths: payload.strengths,
      improvements: payload.improvements,
      transcriptSummary: payload.transcriptSummary,
      status: "completed",
    });
  } catch (error) {
    console.error("saveInterviewFeedback error:", error);
    throw error;
  }
}

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

// Format Date for Display

export function formatInterviewDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}
