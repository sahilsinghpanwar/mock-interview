/**
 * API Route: Start Interview Call
 * POST /api/interview/start-call
 * 
 * Initiates a VAPI voice call for the interview session
 */

import { NextRequest, NextResponse } from "next/server";
import { startInterviewCall, getInterviewSession } from "@/lib/services/interview-session.service";
import { verifyVAPIConfig } from "@/lib/services/vapi.service";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, phoneNumber } = await req.json();

    // Validation
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required field: sessionId" },
        { status: 400 }
      );
    }

    // Verify VAPI is configured
    if (!verifyVAPIConfig()) {
      return NextResponse.json(
        {
          error: "VAPI not configured. Please set NEXT_PUBLIC_VAPI_API_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env.local",
        },
        { status: 500 }
      );
    }

    // Check session exists
    const session = await getInterviewSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Interview session not found" },
        { status: 404 }
      );
    }

    // Start the call
    const updatedSession = await startInterviewCall(sessionId, phoneNumber);

    return NextResponse.json({
      success: true,
      sessionId,
      vapiCallId: updatedSession.vapiCallId,
      message: "Interview call started successfully",
      firstQuestion: updatedSession.questions[0]?.questionText,
    });
  } catch (error) {
    console.error("Error starting interview call:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to start interview call",
      },
      { status: 500 }
    );
  }
}
