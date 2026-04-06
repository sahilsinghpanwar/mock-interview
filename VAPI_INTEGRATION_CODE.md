# 🔧 VAPI Integration Code Examples
## Complete Implementation Guide for Mock Interview Platform

---

## 1️⃣ Environment Variables Setup

**File: `.env.local`**

```bash
# VAPI Voice Agent Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY="your_public_key_here"
VAPI_API_KEY="your_api_key_here"  # Keep this secret, server-side only!
NEXT_PUBLIC_VAPI_ASSISTANT_ID="assistant_xyz123"
NEXT_PUBLIC_VAPI_WEBHOOK_SECRET="webhook_secret_key"

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL="http://localhost:3000"  # Change in production

# Alternative: If deploying to Vercel
# NEXT_PUBLIC_BASE_URL="https://your-project.vercel.app"
```

---

## 2️⃣ Initialize VAPI in Your App

**File: `lib/services/vapi.service.ts`** (Enhanced)

```typescript
import Vapi from "@vapi-ai/web";

class VAPIService {
  private vapi: Vapi | null = null;
  private isInitialized = false;

  /**
   * Initialize VAPI with your public key
   */
  public initialize(): void {
    if (this.isInitialized) return;

    try {
      this.vapi = new Vapi({
        apiKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "",
        onMessage: (message) => this.handleVAPIMessage(message),
        onError: (error) => this.handleVAPIError(error),
      });

      this.isInitialized = true;
      console.log("✅ VAPI initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize VAPI:", error);
    }
  }

  /**
   * Start a voice call for interview
   */
  public async startCall(sessionId: string, context: InterviewContext): Promise<string> {
    if (!this.vapi) {
      this.initialize();
    }

    try {
      const callObject = await this.vapi?.start({
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
        customerPhoneNumber: "+1234567890", // User's phone (optional)
        assistantOverrides: {
          systemPrompt: this.generateSystemPrompt(context),
          model: {
            provider: "openai",
            model: "gpt-4-turbo",
            temperature: 0.7,
            maxTokens: 1000,
          },
          voice: {
            provider: "openai",
            voiceId: "alloy", // or "nova", "echo", etc.
            speed: 1.0,
          },
        },
        customData: {
          sessionId,
          field: context.field,
          level: context.level,
          webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/complete`,
        },
      });

      return callObject?.id || "";
    } catch (error) {
      console.error("❌ Failed to start call:", error);
      throw new Error("Failed to start interview call");
    }
  }

  /**
   * End the current call
   */
  public async endCall(): Promise<void> {
    try {
      await this.vapi?.stop();
      console.log("✅ Call ended successfully");
    } catch (error) {
      console.error("❌ Failed to end call:", error);
    }
  }

  /**
   * Handle messages from VAPI
   */
  private handleVAPIMessage(message: any): void {
    console.log("📨 VAPI Message:", message);

    switch (message.type) {
      case "call-start":
        console.log("📞 Call started");
        break;
      case "call-end":
        console.log("📞 Call ended");
        break;
      case "message":
        console.log("💬 Message:", message.data);
        break;
      case "recording":
        console.log("🎙️ Recording available:", message.data.url);
        break;
      default:
        console.log("❓ Unknown message type:", message.type);
    }
  }

  /**
   * Handle errors from VAPI
   */
  private handleVAPIError(error: any): void {
    console.error("🚨 VAPI Error:", error);
  }

  /**
   * Generate context-aware system prompt
   */
  private generateSystemPrompt(context: InterviewContext): string {
    const difficultyGuidelines = {
      junior:
        "Focus on fundamental concepts and basic problem-solving. Ask 3-4 questions.",
      mid: "Ask real-world scenarios and intermediate problem-solving. Ask 4-5 questions.",
      senior:
        "Focus on system design, architecture, and leadership. Ask 3-4 complex questions.",
    };

    const basePrompt = `You are a professional technical interview conductor.

Interview Context:
- Field: ${context.field}
- Experience Level: ${context.level}
- Difficulty: ${difficultyGuidelines[context.level]}

Your responsibilities:
1. Ask the provided questions one at a time
2. Listen carefully and ask follow-up questions
3. Evaluate answer quality and depth
4. Maintain a professional but friendly tone
5. Use clear language and pause between sentences

Question List:
${context.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Guidelines:
- Wait for complete answers before moving on
- Encourage candidates to explain their thinking
- Be supportive and constructive
- End with a brief summary of strengths

Start by greeting the candidate and introducing yourself.`;

    return basePrompt;
  }

  /**
   * Get call status
   */
  public getCallStatus(): string {
    return this.vapi?.getStatus?.() || "idle";
  }

  /**
   * Check if currently in call
   */
  public isInCall(): boolean {
    return this.getCallStatus() === "active";
  }
}

export const vapiService = new VAPIService();
```

---

## 3️⃣ API Route: Create Interview Session

**File: `app/api/interview/create/route.ts`** (Enhanced)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase/auth";
import { GeminiService } from "@/lib/services/gemini.service";
import { InterviewSessionService } from "@/lib/services/interview-session.service";
import { auth } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { field, level } = body;

    // Validate input
    if (!field || !level) {
      return NextResponse.json({ error: "Field and level are required" }, { status: 400 });
    }

    // Get current user
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate questions using Gemini
    const geminiService = new GeminiService();
    const questions = await geminiService.generateInterviewQuestions(field, level);

    // Create interview session
    const sessionService = new InterviewSessionService();
    const session = await sessionService.createSession({
      userId: user.uid,
      field,
      level,
      questions,
      startedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      questions: session.questions,
      message: "Interview session created successfully",
    });
  } catch (error) {
    console.error("Interview creation error:", error);
    return NextResponse.json(
      { error: "Failed to create interview session" },
      { status: 500 }
    );
  }
}
```

---

## 4️⃣ API Route: Start VAPI Call

**File: `app/api/interview/start-call/route.ts`** (Enhanced)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { InterviewSessionService } from "@/lib/services/interview-session.service";
import { auth } from "@/lib/firebase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Verify user is authenticated
    const user = auth.currentUser;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session from database
    const sessionService = new InterviewSessionService();
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.userId !== user.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Prepare VAPI call payload
    const vapiPayload = {
      assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
      customerPhoneNumber: "+1234567890", // Optional: user's phone number
      assistantOverrides: {
        systemPrompt: generateSystemPrompt(session),
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          temperature: 0.7,
          maxTokens: 1000,
        },
        voice: {
          provider: "openai",
          voiceId: "alloy",
          speed: 1.0,
        },
      },
      customData: {
        sessionId: session.id,
        userId: user.uid,
        field: session.field,
        level: session.level,
      },
    };

    // Call VAPI API
    const vapiResponse = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vapiPayload),
    });

    if (!vapiResponse.ok) {
      const error = await vapiResponse.json();
      console.error("VAPI error:", error);
      return NextResponse.json(
        { error: "Failed to start VAPI call" },
        { status: 500 }
      );
    }

    const vapiData = await vapiResponse.json();

    // Update session with call ID
    await sessionService.updateSession(sessionId, {
      callId: vapiData.id,
      callStartedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      callId: vapiData.id,
      message: "Interview call started successfully",
    });
  } catch (error) {
    console.error("Start call error:", error);
    return NextResponse.json(
      { error: "Failed to start interview call" },
      { status: 500 }
    );
  }
}

function generateSystemPrompt(session: any): string {
  return `You are a professional technical interview conductor for a software company.

Interview Details:
- Candidate Field: ${session.field}
- Experience Level: ${session.level}
- Interview Type: ${session.level} level ${session.field} developer

Your Role:
1. Ask the provided interview questions one at a time
2. Listen carefully to each answer
3. Ask follow-up questions if needed
4. Evaluate the depth and correctness of responses
5. Maintain a professional but friendly and encouraging tone

Interview Questions to Ask:
${session.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Guidelines:
- Speak clearly and pause between sentences
- Wait for complete answers before moving to the next question
- Encourage candidates to explain their thinking process
- Be supportive and constructive in your tone
- After all questions, provide a brief summary of strengths
- Keep the conversation natural and conversational

Start the interview by greeting the candidate warmly and introducing yourself.`;
}
```

---

## 5️⃣ API Route: Complete Interview

**File: `app/api/interview/complete/route.ts`** (Enhanced)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { InterviewSessionService } from "@/lib/services/interview-session.service";
import { GeminiService } from "@/lib/services/gemini.service";
import crypto from "crypto";

// Verify VAPI webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get("x-vapi-signature");
    const secret = process.env.NEXT_PUBLIC_VAPI_WEBHOOK_SECRET || "";

    if (signature && secret) {
      const payload = await request.text();
      if (!verifyWebhookSignature(payload, signature, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = await request.json();
    const { message } = body;

    if (message.type !== "call-ended") {
      return NextResponse.json({ success: true });
    }

    const { customData, recording, summary } = message;
    const { sessionId, userId, field, level } = customData;

    // Get session
    const sessionService = new InterviewSessionService();
    const session = await sessionService.getSession(sessionId);

    if (!session) {
      console.warn(`Session not found: ${sessionId}`);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Process transcript and generate feedback
    const transcript = summary?.messages || [];
    const candidates = transcript.filter((m: any) => m.role === "candidate");

    // Evaluate answers with Gemini
    const geminiService = new GeminiService();
    const evaluation = await geminiService.evaluateAnswers(
      session.questions,
      candidates,
      field,
      level
    );

    // Generate final feedback
    const feedback = await geminiService.generateFeedback(
      evaluation,
      field,
      level
    );

    // Update session with completion data
    await sessionService.updateSession(sessionId, {
      completedAt: new Date(),
      transcript,
      recordingUrl: recording?.url || null,
      evaluation,
      feedback,
      score: evaluation.overallScore,
    });

    // TODO: Send email to user with feedback
    // TODO: Save to Firestore for analytics

    return NextResponse.json({
      success: true,
      message: "Interview completed and evaluated",
      sessionId,
    });
  } catch (error) {
    console.error("Interview completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}
```

---

## 6️⃣ Hook: Use VAPI in React Component

**File: `hooks/useVapiInterview.ts`**

```typescript
import { useState, useCallback, useRef } from "react";
import { vapiService } from "@/lib/services/vapi.service";

interface UseVapiInterviewOptions {
  sessionId: string;
  field: string;
  level: string;
  questions: string[];
}

export function useVapiInterview(options: UseVapiInterviewOptions) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callIdRef = useRef<string | null>(null);

  const startCall = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize VAPI
      vapiService.initialize();

      // Start call with context
      const callId = await vapiService.startCall(options.sessionId, {
        field: options.field,
        level: options.level,
        questions: options.questions,
      });

      callIdRef.current = callId;
      setIsCallActive(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start call";
      setError(message);
      console.error("Start call error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const endCall = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await vapiService.endCall();
      setIsCallActive(false);
      callIdRef.current = null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to end call";
      setError(message);
      console.error("End call error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isCallActive,
    isLoading,
    error,
    startCall,
    endCall,
  };
}
```

---

## 7️⃣ Component: Voice Interview Panel

**File: `components/VoiceInterviewPanel.tsx`**

```typescript
"use client";

import React, { useEffect } from "react";
import { useVapiInterview } from "@/hooks/useVapiInterview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, PhoneOff, AlertCircle } from "lucide-react";

interface VoiceInterviewPanelProps {
  sessionId: string;
  field: string;
  level: string;
  questions: string[];
  onCallEnd: () => void;
}

export function VoiceInterviewPanel({
  sessionId,
  field,
  level,
  questions,
  onCallEnd,
}: VoiceInterviewPanelProps) {
  const { isCallActive, isLoading, error, startCall, endCall } = useVapiInterview({
    sessionId,
    field,
    level,
    questions,
  });

  useEffect(() => {
    if (!isCallActive) return;

    // Handle user hanging up (browser close, tab close, etc.)
    const handleUnload = () => {
      endCall();
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [isCallActive, endCall]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Voice Interview Session</CardTitle>
        <CardDescription>
          {field} Developer ({level} level)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isCallActive ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Interview in progress...</p>
              <p className="text-xs text-gray-500 mt-2">
                Your voice agent is asking questions. Speak clearly and provide detailed answers.
              </p>
            </div>

            <Button
              onClick={() => {
                endCall();
                onCallEnd();
              }}
              variant="destructive"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending call...
                </>
              ) : (
                <>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Interview
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={startCall}
            size="lg"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="mr-2 h-4 w-4" />
                Start Interview
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500 text-center">
          {isCallActive ? "Questions being asked:" : "Questions to be asked:"}
          <ul className="mt-2 space-y-1 text-left bg-gray-50 p-2 rounded">
            {questions.slice(0, 3).map((q, i) => (
              <li key={i} className="text-xs">
                {i + 1}. {q.substring(0, 50)}...
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 8️⃣ Deployment Considerations

### For Vercel Deployment:

**File: `vercel.json`**

```json
{
  "env": {
    "VAPI_API_KEY": "@vapi-api-key",
    "NEXT_PUBLIC_VAPI_PUBLIC_KEY": "@vapi-public-key",
    "NEXT_PUBLIC_VAPI_ASSISTANT_ID": "@vapi-assistant-id",
    "NEXT_PUBLIC_BASE_URL": "@base-url"
  }
}
```

Set these in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each key from `.env.local`
3. Set `NEXT_PUBLIC_BASE_URL` to your domain

---

## 🧪 Testing Checklist

- [ ] VAPI keys are correctly set in `.env.local`
- [ ] Assistant ID is correct (format: `assistant_xyz`)
- [ ] Webhook URL is publicly accessible
- [ ] Call starts when clicking "Start Interview"
- [ ] Questions are asked by voice agent
- [ ] Responses are recorded
- [ ] Webhook receives data after call ends
- [ ] Feedback is generated and saved

---

## 📊 Monitoring & Debugging

**Check VAPI Call Logs:**

```bash
# Monitor your API endpoint
curl http://localhost:3000/api/interview/complete \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "call-ended",
      "customData": {
        "sessionId": "test-session"
      }
    }
  }'
```

---

Congratulations! You now have a complete VAPI integration. 🎉
