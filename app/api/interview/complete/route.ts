/**
 * API Route: Complete Interview
 * POST /api/interview/complete
 * 
 * Completes the interview session and generates comprehensive feedback
 */

import { NextRequest, NextResponse } from "next/server";
import { completeInterviewSession } from "@/lib/services/interview-session.service";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required field: sessionId" },
        { status: 400 }
      );
    }

    const result = await completeInterviewSession(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      overallScore: result.overallScore,
      feedback: result.briefFeedback,
      duration: result.duration,
      message: `Interview completed with score: ${result.overallScore}/100`,
    });
  } catch (error) {
    console.error("Error completing interview:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to complete interview",
      },
      { status: 500 }
    );
  }
}
