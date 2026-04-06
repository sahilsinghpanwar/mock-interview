# 📊 VAPI Voice Agent Workflow Diagrams
## Visual Guides for Setup & Integration

---

## 🎯 Complete Interview Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                     MOCK INTERVIEW PLATFORM                      │
│                         (Next.js App)                            │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 1: USER AUTHENTICATION                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Sign In / Sign Up                                          │  │
│  │ ↓                                                          │  │
│  │ Firebase Auth                                             │  │
│  │ ↓                                                          │  │
│  │ Dashboard (authenticated)                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 2: INTERVIEW SETUP                                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Click "Start New Interview"                               │  │
│  │ ↓                                                          │  │
│  │ Select Technical Field                                    │  │
│  │ (JavaScript, Python, Java, Go, etc.)                      │  │
│  │ ↓                                                          │  │
│  │ Select Experience Level                                   │  │
│  │ (Junior, Mid, Senior)                                     │  │
│  │ ↓                                                          │  │
│  │ POST /api/interview/create                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 3: QUESTION GENERATION (Gemini)                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Gemini API Call                                            │  │
│  │ Input: {field, level}                                     │  │
│  │ ↓                                                          │  │
│  │ Generate 4-5 contextual questions                         │  │
│  │ ↓                                                          │  │
│  │ Save Session to Database                                  │  │
│  │ - sessionId                                               │  │
│  │ - questions[]                                             │  │
│  │ - field, level                                            │  │
│  │ - timestamps                                              │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 4: INTERVIEW SESSION PAGE                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Show Interview Setup Details                              │  │
│  │ - Field: JavaScript                                       │  │
│  │ - Level: Mid                                              │  │
│  │ - Questions Preview (1-3)                                 │  │
│  │ ↓                                                          │  │
│  │ [Start Interview Button]                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 5: INITIATE VAPI CALL                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ User clicks "Start Interview"                             │  │
│  │ ↓                                                          │  │
│  │ Browser requests microphone permission                    │  │
│  │ User grants permission                                    │  │
│  │ ↓                                                          │  │
│  │ POST /api/interview/start-call                            │  │
│  │ - sessionId, field, level, questions                      │  │
│  │ ↓                                                          │  │
│  │ Generate System Prompt (with all questions)               │  │
│  │ ↓                                                          │  │
│  │ Call VAPI API with:                                       │  │
│  │ - assistantId                                             │  │
│  │ - systemPrompt (customized with questions)                │  │
│  │ - voiceSettings (Alloy, speed 1.0)                        │  │
│  │ - customData (sessionId, field, level)                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 6: VAPI VOICE AGENT CONDUCTS INTERVIEW                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ VAPI:                                                      │  │
│  │ ├─ Establishes call connection (WebRTC)                   │  │
│  │ ├─ Generates greeting from system prompt                  │  │
│  │ ├─ Converts to speech (TTS: OpenAI voice "Alloy")         │  │
│  │ └─ Calls user's device                                    │  │
│  │ ↓                                                          │  │
│  │ USER HEARS: "Hello! I'm your technical interviewer..."    │  │
│  │ ↓                                                          │  │
│  │ VAPI asks Question 1 (from system prompt)                 │  │
│  │ USER speaks answer                                        │  │
│  │ ↓                                                          │  │
│  │ VAPI:                                                      │  │
│  │ ├─ Records audio                                          │  │
│  │ ├─ Transcribes speech to text (STT: Whisper)              │  │
│  │ ├─ Sends to GPT-4 for understanding                       │  │
│  │ └─ Generates follow-up questions if needed                │  │
│  │ ↓                                                          │  │
│  │ [Repeats for Questions 2, 3, 4, 5...]                     │  │
│  │ ↓                                                          │  │
│  │ Interview Duration: ~20-30 minutes                        │  │
│  │ ↓                                                          │  │
│  │ VAPI Ends Call (timeout or user hangs up)                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 7: WEBHOOK NOTIFICATION FROM VAPI                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ VAPI sends POST to webhook endpoint:                      │  │
│  │ /api/interview/complete                                   │  │
│  │ ↓                                                          │  │
│  │ Data includes:                                            │  │
│  │ {                                                         │  │
│  │   message: {                                              │  │
│  │     type: "call-ended",                                   │  │
│  │     callId: "call_xyz123",                                │  │
│  │     duration: 1250 (seconds),                             │  │
│  │     recording: {                                          │  │
│  │       url: "https://...",                                 │  │
│  │       transcription: "Full transcript text..."            │  │
│  │     },                                                    │  │
│  │     summary: {                                            │  │
│  │       messages: [                                         │  │
│  │         {role: "interviewer", message: "Q1?"},            │  │
│  │         {role: "candidate", message: "A1..."},            │  │
│  │         ...                                               │  │
│  │       ]                                                   │  │
│  │     },                                                    │  │
│  │     customData: {sessionId, field, level}                 │  │
│  │   }                                                       │  │
│  │ }                                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 8: PROCESS TRANSCRIPT & EVALUATE                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Your API (/api/interview/complete) processes:             │  │
│  │ ├─ Extract candidate answers from transcript              │  │
│  │ ├─ Match against questions                                │  │
│  │ └─ Prepare for Gemini evaluation                          │  │
│  │ ↓                                                          │  │
│  │ Call Gemini API with:                                     │  │
│  │ {                                                         │  │
│  │   questions: [...],                                       │  │
│  │   answers: [...],                                         │  │
│  │   field,                                                  │  │
│  │   level                                                   │  │
│  │ }                                                         │  │
│  │ ↓                                                          │  │
│  │ Gemini evaluates each answer:                             │  │
│  │ - Correctness (0-10)                                      │  │
│  │ - Clarity (0-10)                                          │  │
│  │ - Depth (0-10)                                            │  │
│  │ - Score for each answer (0-100)                           │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 9: GENERATE FEEDBACK (Gemini)                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Gemini generates comprehensive feedback:                  │  │
│  │ ├─ Overall Score (0-100)                                  │  │
│  │ ├─ Performance Summary                                    │  │
│  │ ├─ Strengths (Top 3)                                      │  │
│  │ ├─ Weaknesses (Top 3)                                     │  │
│  │ ├─ Recommendations for improvement                        │  │
│  │ └─ Detailed answer-by-answer feedback                     │  │
│  │ ↓                                                          │  │
│  │ Save to Database:                                         │  │
│  │ {                                                         │  │
│  │   sessionId,                                              │  │
│  │   userId,                                                 │  │
│  │   field,                                                  │  │
│  │   level,                                                  │  │
│  │   questions,                                              │  │
│  │   answers,                                                │  │
│  │   evaluation,                                             │  │
│  │   feedback,                                               │  │
│  │   score,                                                  │  │
│  │   recordingUrl,                                           │  │
│  │   duration,                                               │  │
│  │   completedAt                                             │  │
│  │ }                                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                                ↓
┌──────────────────────────────────────────────────────────────────┐
│  STEP 10: DISPLAY RESULTS TO USER                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Show Feedback Page:                                       │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │ INTERVIEW COMPLETE!                                 │  │  │
│  │ │                                                      │  │  │
│  │ │ Score: 78/100  ⭐⭐⭐⭐                              │  │  │
│  │ │                                                      │  │  │
│  │ │ STRENGTHS:                                           │  │  │
│  │ │ ✓ Strong fundamentals of closures                   │  │  │
│  │ │ ✓ Good understanding of async/await                 │  │  │
│  │ │ ✓ Provided real-world examples                       │  │  │
│  │ │                                                      │  │  │
│  │ │ AREAS FOR IMPROVEMENT:                               │  │  │
│  │ │ • Study Promise error handling                       │  │  │
│  │ │ • Practice performance optimization                 │  │  │
│  │ │ • Learn about event loop in depth                    │  │  │
│  │ │                                                      │  │  │
│  │ │ DETAILED FEEDBACK:                                   │  │  │
│  │ │                                                      │  │  │
│  │ │ Q1: "What is a closure?"                             │  │  │
│  │ │ Your Answer: "A closure is..."                       │  │  │
│  │ │ Feedback: Excellent! Your explanation was clear...   │  │  │
│  │ │ Score: 85/100                                        │  │  │
│  │ │                                                      │  │  │
│  │ │ [Q2 Feedback...]                                     │  │  │
│  │ │ [Q3 Feedback...]                                     │  │  │
│  │ │                                                      │  │  │
│  │ │ [Download PDF] [View Recording] [Share Results]      │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │ Optional Actions:                                           │  │
│  │ - Download feedback as PDF                                 │  │
│  │ - Listen to recording                                      │  │
│  │ - Share results with recruiter                             │  │
│  │ - Schedule next interview                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React/Next.js Pages                                  │  │
│  │ ├─ Dashboard                                         │  │
│  │ ├─ Interview Setup Wizard                           │  │
│  │ ├─ Interview Session (Mic/Speaker)                  │  │
│  │ └─ Feedback Results                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS SERVER                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Routes                                           │  │
│  │ ├─ POST /api/interview/create                        │  │
│  │ │   └─ Call Gemini to generate questions            │  │
│  │ │   └─ Save session to Database                      │  │
│  │ │                                                   │  │
│  │ ├─ POST /api/interview/start-call                    │  │
│  │ │   └─ Call VAPI API to initiate call               │  │
│  │ │   └─ Update session with call ID                  │  │
│  │ │                                                   │  │
│  │ └─ POST /api/interview/complete                      │  │
│  │     └─ Receive webhook from VAPI                    │  │
│  │     └─ Process transcript                           │  │
│  │     └─ Call Gemini to evaluate                      │  │
│  │     └─ Generate feedback                            │  │
│  │     └─ Save results to Database                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Services & Libraries                                 │  │
│  │ ├─ lib/services/gemini.service.ts                   │  │
│  │ │   ├─ generateInterviewQuestions()                 │  │
│  │ │   ├─ evaluateAnswers()                            │  │
│  │ │   └─ generateFeedback()                           │  │
│  │ │                                                   │  │
│  │ ├─ lib/services/vapi.service.ts                     │  │
│  │ │   ├─ initialize()                                 │  │
│  │ │   ├─ startCall()                                  │  │
│  │ │   └─ endCall()                                    │  │
│  │ │                                                   │  │
│  │ └─ lib/services/interview-session.service.ts        │  │
│  │     ├─ createSession()                              │  │
│  │     ├─ getSession()                                 │  │
│  │     └─ updateSession()                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Firebase                                             │  │
│  │ ├─ Authentication (Google, Email/Password)          │  │
│  │ └─ Firestore Database (Users & Sessions)            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Google Gemini API                                    │  │
│  │ ├─ Generate interview questions                     │  │
│  │ ├─ Evaluate candidate answers                       │  │
│  │ └─ Generate feedback summary                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ VAPI (Voice API)                                     │  │
│  │ ├─ Make outbound calls to users                      │  │
│  │ ├─ Conduct voice interviews with AI                 │  │
│  │ ├─ Record audio and transcribe                       │  │
│  │ └─ Send webhook with results                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER DATA JOURNEY                                           │
└─────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION
   User Input (email/password or Google)
        ↓
   Firebase Auth
        ↓
   User UID & Session

2. INTERVIEW SETUP
   {field: "JavaScript", level: "mid"}
        ↓
   POST /api/interview/create
        ↓
   Gemini generates questions
        ↓
   {
     sessionId: "session_xyz",
     field: "JavaScript",
     level: "mid",
     questions: [
       "What is a closure?",
       "Explain async/await",
       "What is hoisting?",
       "Difference between var/let/const",
       "How does event loop work?"
     ]
   }
        ↓
   Firestore: Save session

3. INTERVIEW SESSION
   User clicks "Start Interview"
        ↓
   POST /api/interview/start-call
        ↓
   Generate System Prompt with questions
        ↓
   Call VAPI API
        ↓
   {
     assistantId: "assistant_123",
     systemPrompt: "You are a technical interviewer...",
     customData: {sessionId, field, level, questions}
   }
        ↓
   VAPI initiates call

4. VOICE INTERVIEW
   VAPI calls user
        ↓
   Asks questions from system prompt
        ↓
   Records user responses
        ↓
   Transcribes to text
        ↓
   Interview completes
        ↓
   VAPI sends webhook

5. EVALUATION
   POST /api/interview/complete (webhook)
   {
     transcript: [
       {role: "interviewer", message: "What is a closure?"},
       {role: "candidate", message: "A closure is a function..."},
       ...
     ],
     recording: {url: "https://storage.vapi.ai/rec_123.wav"},
     duration: 1250 seconds
   }
        ↓
   Extract candidate answers
        ↓
   POST to Gemini for evaluation
        ↓
   Gemini returns scores & feedback
        ↓
   {
     overallScore: 78,
     answers: [
       {
         question: "What is a closure?",
         answer: "A closure is a function...",
         score: 85,
         feedback: "Great explanation..."
       },
       ...
     ],
     strengths: ["Good fundamentals", ...],
     weaknesses: ["Needs to practice...", ...],
     recommendations: ["Study advanced...", ...]
   }
        ↓
   Firestore: Save complete session with evaluation & feedback

6. RESULTS DISPLAY
   Fetch completed session
        ↓
   Display feedback page
        ↓
   User sees score, feedback, recommendations
```

---

## 🎯 VAPI Setup Flow

```
┌─────────────────────┐
│ CREATE VAPI ACCOUNT │
└──────────┬──────────┘
           ↓
     ┌─────────────┐
     │ Sign Up     │
     │ Verify Email│
     │ Add Billing │
     └──────┬──────┘
            ↓
   ┌─────────────────────┐
   │ GET API KEYS        │
   │ Settings → API Keys │
   │ Create Key          │
   └──────┬──────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │ CREATE VOICE ASSISTANT               │
   │ ├─ Name                              │
   │ ├─ Select Voice (Alloy/Nova)         │
   │ ├─ Model (GPT-4 Turbo)               │
   │ ├─ System Prompt                     │
   │ └─ Save & Get Assistant ID           │
   └──────┬───────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │ ADD TO .env.local                    │
   │ NEXT_PUBLIC_VAPI_PUBLIC_KEY          │
   │ VAPI_API_KEY                         │
   │ NEXT_PUBLIC_VAPI_ASSISTANT_ID        │
   └──────┬───────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │ CONFIGURE WEBHOOKS                   │
   │ ├─ Enable call-ended event           │
   │ ├─ Set webhook URL                   │
   │ └─ Add auth headers (optional)       │
   └──────┬───────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │ TEST LOCALLY                         │
   │ ├─ npm run dev                       │
   │ ├─ Start interview                   │
   │ ├─ Allow microphone                  │
   │ └─ Complete interview                │
   └──────┬───────────────────────────────┘
          ↓
   ┌──────────────────────────────────────┐
   │ DEPLOY TO PRODUCTION                 │
   │ ├─ Add env vars to Vercel            │
   │ ├─ Update webhook URL                │
   │ └─ Test on production domain         │
   └──────────────────────────────────────┘
          ↓
      ✅ LIVE!
```

---

## 📊 Interview Session State Machine

```
                    ┌─────────────────┐
                    │   CREATED       │
                    │ (Session exists) │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  IN_PROGRESS    │
         ┌─────────→│  (VAPI calling) │←─────────┐
         │          └────────┬────────┘          │
         │                   │                   │
    User hangs up      Interview running    User pauses
         │                   │                   │
         ↓                   ↓                   ↓
    ┌──────────┐    ┌─────────────────┐    ┌──────────┐
    │ COMPLETED│    │ TIMEOUT/ERROR   │    │ PAUSED   │
    │(Webhook) │    │ (VAPI ended)    │    │(Optional)│
    └─────┬────┘    └────────┬────────┘    └─────┬────┘
          │                  │                    │
          ├──────────────────┘                    │
          │                                       │
          ↓                                       ↓
    ┌─────────────────────────────────────────────────┐
    │ EVALUATING                                      │
    │ - Gemini evaluating answers                    │
    │ - Generating feedback                         │
    │ - Saving to database                          │
    └──────────────────┬──────────────────────────────┘
                       │
                       ↓
                ┌─────────────────┐
                │ COMPLETED       │
                │ (with feedback) │
                └─────────────────┘
                       │
                       ↓
                ┌─────────────────┐
                │  USER VIEWS     │
                │   FEEDBACK      │
                └─────────────────┘
```

---

## 🔐 Security & Authentication Flow

```
┌──────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                              │
└──────────────────────────────────────────────────┘

Option 1: Email/Password
   User enters email & password
        ↓
   Firebase verifyPassword()
        ↓
   Session token generated
        ↓
   Stored in browser (httpOnly cookie)

Option 2: Google OAuth
   Click "Sign in with Google"
        ↓
   signInWithPopup(auth, googleProvider)
        ↓
   Google OAuth popup
        ↓
   User grants permissions
        ↓
   Firebase receives Google credential
        ↓
   Session token generated

Option 3: GitHub OAuth
   Click "Sign in with GitHub"
        ↓
   signInWithPopup(auth, githubProvider)
        ↓
   GitHub OAuth popup
        ↓
   User grants permissions
        ↓
   Firebase receives GitHub credential
        ↓
   Session token generated

All Options:
   ↓
   User profile saved to Firestore
   ↓
   User can access dashboard
   ↓
   API routes verify user.uid
   ↓
   Only user's own interviews visible
```

---

## 📈 Performance Metrics Tracking

```
┌────────────────────────────────────────┐
│ INTERVIEW QUALITY METRICS              │
└────────────────────────────────────────┘

1. CALL METRICS
   - Connection time: <3 seconds ✓
   - Call setup duration
   - Network latency
   - Audio quality score

2. TRANSCRIPT METRICS
   - Transcription accuracy: >95%
   - Words per question
   - Conversation turns
   - Silence duration

3. USER METRICS
   - Interview completion rate: >90%
   - Average duration: 20-30 min
   - Response time per question
   - User satisfaction (NPS)

4. BUSINESS METRICS
   - Cost per interview: $2-4
   - Monthly active users
   - Interviews per user
   - Feedback generation time

5. SYSTEM METRICS
   - API response time: <200ms
   - Webhook delivery: 99.9%
   - Database query time: <100ms
   - Error rate: <1%
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│ PRODUCTION DEPLOYMENT (Vercel)                       │
└──────────────────────────────────────────────────────┘

┌─────────────────────────────┐
│ Global CDN (Vercel Edge)    │
│ ├─ Static files (JS/CSS)    │
│ ├─ Image optimization       │
│ └─ Geographic distribution  │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ Vercel Serverless Functions │
│ ├─ Next.js App Router       │
│ ├─ API Routes               │
│ └─ Middleware               │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ Environment Variables       │
│ ├─ Firebase config          │
│ ├─ Gemini API key           │
│ ├─ VAPI keys & Assistant ID │
│ └─ VAPI webhook secret      │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ Database (Firebase)         │
│ ├─ Firestore                │
│ ├─ Authentication           │
│ └─ Cloud Storage (recordings)│
└─────────────────────────────┘

Monitoring & Analytics:
├─ Vercel Analytics
├─ Firebase Analytics
├─ Sentry (error tracking)
├─ LogRocket (user sessions)
└─ Custom dashboards
```

---

This visual guide should help you understand the complete flow!

