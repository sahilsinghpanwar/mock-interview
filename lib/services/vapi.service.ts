/**
 * VAPI Voice Agent Integration Service
 * Handles real-time voice interaction during mock interviews
 * 
 * VAPI (Voice API) provides:
 * - Real-time voice transcription
 * - AI voice responses
 * - Call management and monitoring
 * - Recording and transcript storage
 * 
 * Integration Guide:
 * 1. Sign up at https://vapi.ai
 * 2. Get API key from dashboard
 * 3. Create a voice assistant in VAPI dashboard
 * 4. Add API key and Assistant ID to .env.local
 * 5. Use this service to start/manage calls
 */

import { VAPICallStatus, InterviewQuestion, InterviewLevel } from "@/lib/types/interview";

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
const VAPI_API_URL = "https://api.vapi.ai";

// ─── VAPI Call Management ──────────────────────────────────────────────────

/**
 * Create a system message that instructs VAPI voice agent
 * about the interview questions and requirements
 */
function createInterviewSystemPrompt(
  questions: InterviewQuestion[],
  level: InterviewLevel
): string {
  const questionList = questions
    .map((q, i) => `${i + 1}. ${q.questionText}`)
    .join("\n");

  return `You are a professional technical interviewer conducting a ${level}-level mock interview.

INTERVIEW INSTRUCTIONS:
1. Ask the following questions in order:
${questionList}

2. For each question:
   - Ask the question clearly
   - Wait for the candidate's complete answer
   - After they finish, say "Thank you. Next question." and proceed
   - Be encouraging and professional

3. Interview Guidelines:
   - Speak clearly and at a moderate pace
   - Allow time for the candidate to think and respond
   - For ${level}-level candidates:
     - ${level === "junior" ? "Focus on fundamentals and basic explanations" : ""}
     - ${level === "mid" ? "Probe deeper into system design and trade-offs" : ""}
     - ${level === "senior" ? "Challenge with complex scenarios and architectural decisions" : ""}
   - Be supportive but maintain professional standards

4. When all questions are answered:
   - Thank the candidate for their time
   - Say "The interview has ended. Please wait for your feedback."
   - Stop speaking and let the system end the call

TONE: Professional, encouraging, and conversational.
Keep responses concise and focus on the interview.`;
}

/**
 * Create a VAPI assistant configuration for the interview
 */
function createAssistantConfig(
  questions: InterviewQuestion[],
  level: InterviewLevel
) {
  return {
    name: `Mock Interview - ${level}`,
    model: {
      provider: "openai",
      model: "gpt-4-turbo",
      systemPrompt: createInterviewSystemPrompt(questions, level),
      temperature: 0.7,
      max_tokens: 1024,
    },
    voice: {
      provider: "11labs",
      voiceId: "professional", // Options: professional, friendly, etc.
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    endCallFunctionEnabled: true,
    recordingEnabled: true,
  };
}

/**
 * Start a VAPI voice call for the interview
 * @param phoneNumber - Candidate's phone number (optional for web)
 * @param questions - Array of interview questions
 * @param level - Interview level
 * @returns Call details with callId
 */
export async function startVAPICall(
  phoneNumber: string | undefined,
  questions: InterviewQuestion[],
  level: InterviewLevel
): Promise<{ callId: string; callStatus: VAPICallStatus }> {
  try {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY not configured");
    }

    if (!VAPI_ASSISTANT_ID) {
      throw new Error("VAPI_ASSISTANT_ID not configured");
    }

    const assistantConfig = createAssistantConfig(questions, level);

    const payload = {
      assistantId: VAPI_ASSISTANT_ID,
      assistantOverrides: {
        ...assistantConfig,
      },
      phoneNumber: phoneNumber || "+1234567890", // For web, this is optional
      customerName: "Candidate",
      recordingEnabled: true,
    };

    const response = await fetch(`${VAPI_API_URL}/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `VAPI API error: ${response.status} - ${error.message || error}`
      );
    }

    const data = await response.json();
    console.log(`✓ VAPI call initiated with ID: ${data.callId}`);

    return {
      callId: data.callId,
      callStatus: {
        status: "active",
        callId: data.callId,
      },
    };
  } catch (error) {
    console.error("Error starting VAPI call:", error);
    throw error;
  }
}

/**
 * Get the status of an ongoing VAPI call
 * @param callId - The VAPI call ID
 * @returns Current call status
 */
export async function getVAPICallStatus(callId: string): Promise<VAPICallStatus> {
  try {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY not configured");
    }

    const response = await fetch(`${VAPI_API_URL}/call/${callId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `VAPI API error: ${response.status} - Failed to get call status`
      );
    }

    const data = await response.json();

    return {
      status: data.status === "ended" ? "ended" : "active",
      callId: data.callId,
      duration: data.duration,
      transcript: data.transcript,
      recordingUrl: data.recordingUrl,
    };
  } catch (error) {
    console.error("Error getting VAPI call status:", error);
    throw error;
  }
}

/**
 * End a VAPI call
 * @param callId - The VAPI call ID
 */
export async function endVAPICall(callId: string): Promise<void> {
  try {
    if (!VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY not configured");
    }

    const response = await fetch(`${VAPI_API_URL}/call/${callId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.status}`);
    }

    console.log(`✓ VAPI call ended: ${callId}`);
  } catch (error) {
    console.error("Error ending VAPI call:", error);
    throw error;
  }
}

/**
 * Get recording and transcript from a completed VAPI call
 * @param callId - The VAPI call ID
 * @returns Recording URL and transcript
 */
export async function getVAPICallRecording(
  callId: string
): Promise<{ recordingUrl?: string; transcript?: string }> {
  try {
    const callStatus = await getVAPICallStatus(callId);

    return {
      recordingUrl: callStatus.recordingUrl,
      transcript: callStatus.transcript,
    };
  } catch (error) {
    console.error("Error getting VAPI call recording:", error);
    throw error;
  }
}

/**
 * Verify VAPI configuration
 */
export function verifyVAPIConfig(): boolean {
  const hasApiKey = !!VAPI_API_KEY;
  const hasAssistantId = !!VAPI_ASSISTANT_ID;

  if (!hasApiKey) {
    console.error(
      "❌ NEXT_PUBLIC_VAPI_API_KEY not configured in .env.local"
    );
  }
  if (!hasAssistantId) {
    console.error(
      "❌ NEXT_PUBLIC_VAPI_ASSISTANT_ID not configured in .env.local"
    );
  }

  if (hasApiKey && hasAssistantId) {
    console.log("✓ VAPI configuration verified");
    return true;
  }

  return false;
}

/**
 * Setup instructions for VAPI integration
 * This is printed during development
 */
export function printVAPISetupInstructions(): void {
  console.log(`
  ╔════════════════════════════════════════════════════════════════╗
  ║          VAPI VOICE INTEGRATION SETUP GUIDE                   ║
  ╚════════════════════════════════════════════════════════════════╝

  1. SIGN UP AT VAPI.AI:
     - Go to https://vapi.ai
     - Create a free account
     - Complete email verification

  2. GET YOUR API KEY:
     - Dashboard → Settings → API Keys
     - Copy your API Key
     - Add to .env.local: NEXT_PUBLIC_VAPI_API_KEY=your_key_here

  3. CREATE A VOICE ASSISTANT:
     - Dashboard → Assistants → Create New
     - Configure:
       * Name: "Mock Interview Assistant"
       * Model: GPT-4 Turbo (recommended)
       * Voice: Choose from available options
       * Transcriber: Deepgram Nova-2
     - Copy the Assistant ID
     - Add to .env.local: NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_id_here

  4. CONFIGURE VOICE SETTINGS:
     - Select text-to-speech provider (11labs recommended)
     - Choose voice tone (professional/friendly)
     - Set transcription language (English-US)

  5. TEST THE INTEGRATION:
     - Use the testVAPIConnection() function
     - Check console logs for verification

  IMPORTANT NOTES:
     - VAPI offers free tier with limited minutes
     - Recordings are stored for 30 days
     - Transcripts are automatically generated
     - API calls are rate-limited (check your plan)

  For support: https://docs.vapi.ai
  `);
}
