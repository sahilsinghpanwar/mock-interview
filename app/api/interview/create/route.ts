/**
 * API Route: Create Interview Session
 * POST /api/interview/create
 * 
 * Creates a new interview session based on user's field and level selection
 */

import { NextRequest, NextResponse } from "next/server";
import { createInterviewSession } from "@/lib/services/interview-session.service";
import { TechnicalField, InterviewLevel } from "@/lib/types/interview";

export async function POST(req: NextRequest) {
  try {
    const { userId, field, level } = await req.json();

    // Validation
    if (!userId || !field || !level) {
      return NextResponse.json(
        { error: "Missing required fields: userId, field, level" },
        { status: 400 }
      );
    }

    const session = await createInterviewSession(
      userId,
      field as TechnicalField,
      level as InterviewLevel
    );

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message: `Interview session created successfully`,
      questionsCount: session.questions.length,
      estimatedDuration: session.questions.length * 3, // ~3 minutes per question
    });
  } catch (error) {
    console.error("Error creating interview session:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }
}
