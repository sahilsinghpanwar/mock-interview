# 🎤 Mock Interview Platform - AI-Powered Voice Interview System

A professional, production-ready mock interview platform powered by VAPI voice agents and Google Gemini AI. Candidates can practice technical interviews with AI that asks field-specific questions, provides real-time feedback, and generates performance reports.

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Quick Start Guide](#quick-start-guide)
- [VAPI Integration](#vapi-integration)
- [Gemini API Integration](#gemini-api-integration)
- [Interview System Architecture](#interview-system-architecture)
- [API Endpoints](#api-endpoints)
- [Future Enhancements](#future-enhancements)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### ✅ Implemented

#### Authentication
- Email/Password sign-up and sign-in
- Firebase Authentication integration
- Protected interview routes
- Sign-out with confirmation dialog

#### Interview Setup
- **8 Technical Fields:**
  - Web Development
  - Android Development
  - iOS Development
  - Backend Development
  - DevOps
  - Data Science
  - Machine Learning
  - Cloud Architecture

- **3 Interview Levels:**
  - **Junior**: 5 questions, ~15 minutes (focus on fundamentals)
  - **Mid**: 10 questions, ~30 minutes (system design & scenarios)
  - **Senior**: 15 questions, ~45 minutes (architecture & leadership)

#### Voice Interview
- Real-time VAPI voice agent connection
- Professional AI speaking with clear instructions
- Automatic speech transcription
- Interview recording with transcript storage
- Call status monitoring and management

#### Question Generation (Gemini AI)
- Dynamically generated field-specific questions
- Level-appropriate difficulty
- Expected key points for evaluation
- Follow-up questions for deeper assessment
- Mix of conceptual, practical, and scenario-based questions

#### Answer Evaluation
- Automatic answer scoring (0-100)
- Strength detection with specific examples
- Area for improvement identification
- Detailed feedback per answer
- Key points detection and matching

#### Performance Feedback
- Overall score calculation
- Performance level badges (Poor → Excellent)
- Individual answer feedback with explanations
- Summary of demonstrated strengths
- Personalized recommendations
- Comparison with level expectations
- Next steps for skill improvement

#### Session Management
- Create and manage interview sessions
- Pause/resume functionality
- Session history
- Export session data
- Real-time status updates

### 🚀 Phase 2 Features (Coming Soon)
- Firestore integration for persistent storage
- Custom questions upload by recruiters
- Interview scheduling system
- Performance analytics dashboard
- Multi-candidate support
- Video recording alongside voice
- Leaderboards and achievements
- Mobile app (iOS/Android)

---

## 🏗️ Project Structure

```
mock-interview/
├── app/
│   ├── (auth)/                          # Auth route group
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (root)/                          # Main app route group
│   │   ├── page.tsx                     # Dashboard
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   └── interview/
│   │       ├── create/route.ts          # POST: Create interview session
│   │       ├── start-call/route.ts      # POST: Start VAPI call
│   │       └── complete/route.ts        # POST: Complete & get feedback
│   │
│   ├── interview/
│   │   ├── new/page.tsx                 # Interview setup page
│   │   └── [sessionId]/page.tsx         # Active interview session
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── AuthForm.tsx
│   ├── InterviewSetupForm.tsx           # NEW: Field & level selection
│   ├── InterviewSession.tsx             # NEW: Voice interview UI
│   ├── InterviewFeedback.tsx            # NEW: Results display
│   └── ui/                              # shadcn/ui components
│
├── lib/
│   ├── types/
│   │   └── interview.ts                 # NEW: Interview types & interfaces
│   │
│   ├── services/                        # NEW: Business logic services
│   │   ├── gemini.service.ts            # Gemini API integration
│   │   ├── vapi.service.ts              # VAPI voice integration
│   │   └── interview-session.service.ts # Session management
│   │
│   ├── firebase.ts
│   ├── auth.actions.ts
│   ├── utils.ts
│   └── validations.ts
│
├── public/
├── .env.local                           # Configuration (update required)
├── SETUP_GUIDE.ts                       # Detailed setup guide
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 16+** - App Router, Server Components
- **React 19+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - RESTful APIs
- **Node.js** - Runtime

### AI/Voice Services
- **VAPI AI** - Voice agent & call management
- **Google Gemini 2.0** - Question generation & evaluation
- **Deepgram** - Speech-to-text transcription
- **11labs** - Text-to-speech synthesis

### Authentication
- **Firebase Auth** - User authentication

### Development
- **ESLint** - Code quality
- **TypeScript Compiler** - Type checking

---

## 🚀 Quick Start Guide

### 1. Prerequisites
```bash
# Required
- Node.js 18+ (check with: node --version)
- npm or yarn
- Git

# External accounts
- Google account (for Gemini API)
- VAPI account
- Firebase project
```

### 2. Clone & Setup Project
```bash
cd /Users/sahilpanwar/Ghost/2026/PROJECTS/mock-interview
npm install
```

### 3. Configure Environment Variables
Create/update `.env.local`:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# Gemini AI Configuration
GEMINI_API_KEY="your_gemini_api_key"

# VAPI Configuration (see VAPI Integration below)
NEXT_PUBLIC_VAPI_API_KEY="your_vapi_api_key"
NEXT_PUBLIC_VAPI_ASSISTANT_ID="your_vapi_assistant_id"
```

### 4. Start Development Server
```bash
npm run dev
# Server starts at http://localhost:3000
```

### 5. Test the Application
```bash
# In browser, navigate to:
http://localhost:3000

# Test workflow:
1. Sign up with email/password
2. Go to Dashboard
3. Click "New Interview"
4. Select field and level
5. Start interview (requires VAPI setup)
```

---

## 🎙️ VAPI Integration Guide

### What is VAPI?

VAPI is an AI voice calling platform that enables real-time voice conversations with AI agents. It handles:
- Speech-to-text transcription
- AI response generation
- Text-to-speech synthesis
- Call recording and management

### Step-by-Step Setup

#### Step 1: Create VAPI Account
1. Go to https://vapi.ai
2. Click "Sign Up"
3. Create account with email
4. Verify email address
5. Complete profile setup

#### Step 2: Get API Credentials
1. Dashboard → **Settings** → **API Keys**
2. Click "Create New API Key"
3. Copy the key (save securely!)
4. Add to `.env.local`:
```bash
NEXT_PUBLIC_VAPI_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 3: Create Voice Assistant
1. Dashboard → **Assistants** → **Create New**
2. Fill in basic info:
   - **Name**: Mock Interview Assistant
   - **Description**: AI-powered technical interview agent

3. Configure AI Model:
   - **Provider**: OpenAI
   - **Model**: gpt-4-turbo
   - **Temperature**: 0.7
   - **Max Tokens**: 1024
   - **System Prompt**: [Auto-generated by our service]

4. Configure Voice:
   - **Voice Provider**: 11labs (or ElevenLabs)
   - **Voice ID**: Select professional voice (e.g., "Michael")
   - **Language**: English (en-US)

5. Configure Transcription:
   - **Provider**: Deepgram
   - **Model**: nova-2 (latest, most accurate)
   - **Language**: en-US

6. Enable Recording:
   - Toggle **Recording Enabled**: ON
   - Format: MP3
   - Retention: 30 days

7. Save and copy **Assistant ID**
8. Add to `.env.local`:
```bash
NEXT_PUBLIC_VAPI_ASSISTANT_ID=asst_xxxxxxxxxxxxxxx
```

#### Step 4: Test in VAPI Dashboard
1. Go to **Assistants** → Your assistant
2. Click **Test Agent**
3. Verify:
   - Voice output is clear
   - Transcription is accurate
   - System prompt is working

#### Step 5: Verify in Application
```bash
# Restart dev server
npm run dev

# Check browser console for:
✓ VAPI configuration verified

# If error, check:
- API key in .env.local (no spaces)
- Assistant ID correct
- VAPI account not expired
- Billing configured
```

### VAPI System Prompt

The system prompt automatically generated by `vapi.service.ts` instructs the AI to:

```
You are a professional technical interviewer conducting a [LEVEL]-level mock interview.

- Ask the following questions in order: [QUESTIONS]
- Speak clearly and at a moderate pace
- Allow time for candidates to think
- Be encouraging but maintain professional standards
- When all questions are answered, thank the candidate
- Say "The interview has ended" and wait for system to end call
```

### VAPI Pricing

- **Free Tier**: ~100 minutes/month
- **Paid**: Starting $0.05/minute
- **No setup fees**
- **Pay-as-you-go billing**

### Troubleshooting VAPI

| Issue | Cause | Solution |
|-------|-------|----------|
| "VAPI not configured" | Missing env vars | Check .env.local has both keys |
| No voice output | Assistant not configured | Test in VAPI dashboard |
| Poor transcription | Wrong transcriber | Use Deepgram nova-2 |
| Call drops | Network issues | Check internet connection |
| High latency | Model too complex | Use gpt-4-turbo (not gpt-4) |

---

## 🤖 Gemini API Integration

### What is Gemini?

Google's latest multimodal AI model that we use for:
- Generating field-specific interview questions
- Evaluating candidate answers with feedback
- Creating performance summaries

### Setup Instructions

#### Step 1: Access Google AI Studio
1. Go to https://ai.google.dev/
2. Click "Get started" or "API keys"
3. Sign in with Google account

#### Step 2: Create API Key
1. Click "Create API Key"
2. Select "Create in new project" (or existing)
3. Copy your API Key
4. Add to `.env.local`:
```bash
GEMINI_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Step 3: Verify Configuration
```bash
# Restart dev server
npm run dev

# Check console for:
✓ Gemini API configured
```

### Question Generation Prompt

Our enhanced prompt includes:

```
You are an expert technical interviewer for [FIELD].

Generate [COUNT] interview questions for [LEVEL]-level candidates.

Context:
- Technologies: [TECH_LIST]
- Common Topics: [TOPICS]
- Level Requirements: [REQUIREMENTS]

Return JSON format:
{
  "questionText": "...",
  "category": "...",
  "difficulty": "[LEVEL]",
  "expectedKeyPoints": [...],
  "followUpQuestions": [...]
}
```

### Answer Evaluation Prompt

```
Evaluate this candidate's answer:

Question: [QUESTION]
Answer: [USER_ANSWER]
Expected Key Points: [KEY_POINTS]

Score on 0-100 scale with:
- Technical Accuracy (30%)
- Completeness (20%)
- Communication (20%)
- Real-world Application (20%)
- Follow-up Potential (10%)

Return JSON with score, strengths, improvements, feedback.
```

### Pricing & Limits

- **Free Tier**: Generous daily quota
- **Paid**: $0.075/million input tokens, $0.30/million output tokens
- **Rate Limit**: 60 requests/minute (free)

### Best Practices

1. **Use JSON Mode**: Request structured JSON responses
2. **Set Temperature**: Use 0.7-0.8 for balanced output
3. **Batch Requests**: Group evaluations when possible
4. **Monitor Tokens**: Check usage in Google AI Studio dashboard
5. **Include Context**: More detailed prompts = better results

---

## 🏛️ Interview System Architecture

### Data Flow Diagram

```
┌─────────────┐
│   Candidate │ (Frontend - React)
└──────┬──────┘
       │
       ├─→ Select Field & Level
       │
       ├─→ POST /api/interview/create
       │   └─→ createInterviewSession()
       │       ├─→ generateInterviewQuestions() [Gemini]
       │       └─→ Store in sessionStore
       │
       ├─→ View Session Details
       │
       ├─→ POST /api/interview/start-call
       │   └─→ startInterviewCall()
       │       └─→ startVAPICall() [VAPI]
       │           └─→ Get callId, connect voice
       │
       ├─→ Interview Session (VAPI Voice)
       │   ├─→ VAPI asks first question
       │   ├─→ Candidate answers
       │   ├─→ VAPI transcribes answer
       │   ├─→ recordAnswer() [Session]
       │   ├─→ evaluateUserAnswer() [Gemini]
       │   ├─→ VAPI asks next question
       │   └─→ Repeat for all questions
       │
       ├─→ POST /api/interview/complete
       │   └─→ completeInterviewSession()
       │       ├─→ Calculate overall score
       │       ├─→ generateFeedbackSummary() [Gemini]
       │       └─→ Return results & feedback
       │
       └─→ View Feedback & Results
           ├─→ Overall Score (0-100)
           ├─→ Performance Level
           ├─→ Per-question feedback
           ├─→ Strengths & Improvements
           └─→ Recommendations
```

### Session State Machine

```
NOT_STARTED
    ↓
    └─→ [User clicks Start] → IN_PROGRESS (VAPI call active)
        ├─→ [All questions answered] → COMPLETED
        ├─→ [User clicks Pause] → PAUSED
        │   └─→ [User resumes] → IN_PROGRESS
        └─→ [Network error] → FAILED
```

### Score Calculation

```
Overall Score = Average of all question scores

Per-Question Score:
  - Technical Accuracy: 30%
  - Completeness: 20%
  - Communication: 20%
  - Real-world Application: 20%
  - Follow-up Potential: 10%

Performance Levels:
  - 90-100: ⭐ Excellent
  - 70-89: ✅ Good
  - 50-69: ⚠️ Needs Improvement
  - Below 50: ❌ Poor
```

---

## 📡 API Endpoints

### Create Interview Session
```http
POST /api/interview/create
Content-Type: application/json

{
  "userId": "firebase_user_id",
  "field": "web-development",
  "level": "junior"
}

Response (200):
{
  "success": true,
  "sessionId": "session-1234567890-abc",
  "questionsCount": 5,
  "estimatedDuration": 15
}

Response (400):
{
  "error": "Missing required fields"
}
```

### Start Interview Call
```http
POST /api/interview/start-call
Content-Type: application/json

{
  "sessionId": "session-1234567890-abc",
  "phoneNumber": "+1234567890" (optional)
}

Response (200):
{
  "success": true,
  "sessionId": "session-1234567890-abc",
  "vapiCallId": "call-1234567890",
  "firstQuestion": "What is React?"
}

Response (500):
{
  "error": "VAPI not configured"
}
```

### Complete Interview
```http
POST /api/interview/complete
Content-Type: application/json

{
  "sessionId": "session-1234567890-abc"
}

Response (200):
{
  "success": true,
  "sessionId": "session-1234567890-abc",
  "overallScore": 78,
  "duration": 1245,
  "feedback": {
    "performanceLevel": "good",
    "summary": "...",
    "strengths": [...],
    "areasForImprovement": [...],
    "recommendations": [...],
    "nextSteps": [...]
  }
}
```

---

## 🚀 Future Enhancements

### Phase 2: Production Features
- [ ] Firestore integration for persistent storage
- [ ] User interview history dashboard
- [ ] Performance analytics and trends
- [ ] Custom question templates
- [ ] Interview scheduling system
- [ ] Multiple interviewer support

### Phase 3: Advanced AI
- [ ] Dynamic follow-up questions based on answers
- [ ] Emotion and confidence detection
- [ ] Multi-language support
- [ ] Accent adaptation
- [ ] Behavioral assessment

### Phase 4: Recruiter Features
- [ ] Recruiter dashboard
- [ ] Candidate management system
- [ ] Custom evaluation rubrics
- [ ] Bulk interview creation
- [ ] Interview analytics

### Phase 5: Enterprise
- [ ] Video recording option
- [ ] SSO integration (Google, Azure, etc.)
- [ ] Custom branding
- [ ] Mobile apps (iOS/Android)
- [ ] API for third-party integration

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Check TypeScript
npm run build

# Fix common issues
npm run dev -- --reset-cache
```

### Environment Variables Not Loading
```bash
# Verify .env.local exists
ls -la .env.local

# Restart dev server after changing .env.local
npm run dev
```

### VAPI Connection Issues
```bash
# Check browser console (F12 → Console tab)
# Look for VAPI initialization logs

# Verify credentials in dashboard.vapi.ai
# Test assistant in VAPI dashboard first
```

### Gemini API Errors
```bash
# Check API key is valid
# Verify quota in Google AI Studio dashboard
# Ensure API is enabled in Google Cloud
```

### Port Already in Use
```bash
# If port 3000 is busy
lsof -i :3000  # See what's using it
kill -9 <PID>  # Kill the process

# Or use different port
PORT=3001 npm run dev
```

---

## 📖 Documentation

- **[SETUP_GUIDE.ts](./SETUP_GUIDE.ts)** - Detailed technical setup guide
- **[VAPI Docs](https://docs.vapi.ai/)** - VAPI API documentation
- **[Gemini Docs](https://ai.google.dev/docs/)** - Google Gemini documentation
- **[Next.js Docs](https://nextjs.org/docs/)** - Next.js framework documentation

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [SETUP_GUIDE.ts](./SETUP_GUIDE.ts)
3. Check third-party documentation:
   - VAPI: https://docs.vapi.ai/
   - Gemini: https://ai.google.dev/docs/
   - Firebase: https://firebase.google.com/docs/

---

## 📝 License

This project is part of the Mock Interview Platform initiative.

---

## 🎉 Credits

Built with:
- ✨ VAPI AI for voice interactions
- 🤖 Google Gemini for question generation & evaluation
- 🔥 Firebase for authentication
- 💨 Next.js for full-stack framework
- 🎨 Tailwind CSS for styling

---

**Happy interviewing! 🎤**
