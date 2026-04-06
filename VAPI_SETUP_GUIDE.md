# 🎙️ VAPI Voice Agent Setup Guide
## Complete Step-by-Step Workflow for Mock Interview Platform

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [VAPI Account Setup](#vapi-account-setup)
3. [Create Voice Assistant](#create-voice-assistant)
4. [Configure System Prompt](#configure-system-prompt)
5. [Setup Webhook Integration](#setup-webhook-integration)
6. [Test the Agent](#test-the-agent)
7. [Integration with Mock Interview](#integration-with-mock-interview)
8. [Troubleshooting](#troubleshooting)

---

## 🔑 Prerequisites

Before starting, you need:
- [ ] VAPI account (https://vapi.ai)
- [ ] Google Gemini API key
- [ ] Next.js application running locally or deployed
- [ ] Your project URL (for webhooks)

---

## 1️⃣ VAPI Account Setup

### Step 1: Create VAPI Account
1. Visit: https://vapi.ai/
2. Click **"Sign Up"** (top right)
3. Choose signup method (Email, Google, GitHub)
4. Verify your email
5. Complete your profile

### Step 2: Get API Keys
1. Log in to VAPI dashboard: https://vapi.ai/dashboard
2. Click on **"Settings"** (bottom left)
3. Go to **"API Keys"** section
4. Click **"Create API Key"**
   - Name: `mock-interview-api-key`
   - Copy the key and save it (you'll need it later)
5. Also note your **Personal Access Token**

### Step 3: Setup Billing (Important!)
1. Go to **Settings → Billing**
2. Add a payment method (required to make calls)
3. You can set usage limits to control costs
4. VAPI offers free credits for new accounts (~$10-20)

---

## 2️⃣ Create Voice Assistant (Detailed Steps)

### Step 1: Navigate to Assistants
1. In VAPI dashboard, click **"Assistants"** (left sidebar)
2. Click **"Create Assistant"** (blue button, top right)

### Step 2: Configure Basic Settings

**Name & Description:**
```
Name: "Technical Interview Bot"
Description: "AI-powered voice agent conducting technical interviews for software engineers"
```

**Voice Selection:**
- Select **Provider**: OpenAI
- Select **Voice**: Choose a professional voice
  - Recommended: "Alloy" or "Nova" (friendly & professional)
  - Test by clicking the speaker icon

### Step 3: Model Configuration

**LLM Provider**: OpenAI (default)
```
Model: gpt-4-turbo
Temperature: 0.7 (balanced between creative & consistent)
Max tokens: 1000
```

**Or use Anthropic Claude:**
```
Model: claude-3-5-sonnet
Temperature: 0.7
```

### Step 4: System Prompt (Critical!)

Copy this system prompt:

```text
You are a professional technical interview conductor for a software company.

Your role:
- Ask clear, concise technical questions one at a time
- Listen carefully to candidate responses
- Ask follow-up questions based on their answers
- Maintain a professional but friendly tone
- Evaluate the depth and correctness of answers
- Provide constructive feedback

Interview Flow:
1. Greet the candidate warmly
2. Ask 3-5 questions based on the candidate's field and experience level
3. Allow candidates to think and speak naturally (pause between questions)
4. After each answer, ask 1-2 follow-up questions if needed
5. At the end, summarize key strengths and areas for improvement

Question Guidelines:
- Junior Level: Focus on fundamentals and concepts
- Mid Level: Focus on problem-solving and real-world scenarios
- Senior Level: Focus on system design, architecture, and best practices

Important:
- Be conversational, not robotic
- Speak clearly and pause between sentences
- Wait for complete answers before moving to next question
- Encourage candidates to explain their thinking
- Be supportive and constructive

Session Context will be provided via webhook with:
- candidate_field: (e.g., "JavaScript", "Python", "System Design")
- candidate_level: (e.g., "junior", "mid", "senior")
- questions: [array of questions to ask]
```

---

## 3️⃣ Advanced Configuration

### Step 1: Fallback Options
In the Assistant settings:
- **Fallback Prompt**: What to say if the user doesn't respond
- **Max Call Duration**: 30-45 minutes recommended
- **Enable Recordings**: YES (for feedback later)

### Step 2: Transcription Settings
- **Provider**: OpenAI (best for technical terms)
- **Language**: English
- **Enable Timestamps**: Yes

### Step 3: End Call Behavior
Set what happens when interview ends:
- Record the session
- Send webhook to your backend
- Stop recording after 2 min of silence

---

## 4️⃣ Setup Webhook Integration

### Step 1: Create Webhook URL

In your Next.js app, you already have:
```
POST /api/interview/complete
```

### Step 2: Configure VAPI Webhook

In VAPI Assistant Settings:

**Webhook Events to Enable:**
- [ ] Call Started
- [ ] Call Ended
- [x] Message Received (optional)
- [x] Transfer Requested (optional)
- [x] Recording Available

**Webhook URL:**
```
https://yourdomain.com/api/interview/complete
```

**Webhook Auth:** (if needed)
```
Authorization: Bearer YOUR_VAPI_API_KEY
Content-Type: application/json
```

### Step 3: Expected Webhook Payload

VAPI will POST this when call ends:

```json
{
  "message": {
    "type": "call-ended",
    "callId": "call_xyz123",
    "sessionId": "session_abc456",
    "duration": 1250,
    "recording": {
      "url": "https://storage.vapi.ai/recording_123.wav",
      "transcription": "Full transcript of the interview..."
    },
    "summary": {
      "duration": "20 minutes 50 seconds",
      "messages": [
        {
          "role": "interviewer",
          "message": "What is a closure in JavaScript?"
        },
        {
          "role": "candidate",
          "message": "A closure is..."
        }
      ]
    }
  }
}
```

---

## 5️⃣ Integration with Mock Interview App

### Step 1: Update .env.local

```bash
# VAPI Configuration
NEXT_PUBLIC_VAPI_API_KEY="your_api_key_here"
NEXT_PUBLIC_VAPI_PUBLIC_KEY="your_public_key_here"
VAPI_API_KEY="your_api_key_here"  # Server-side
NEXT_PUBLIC_VAPI_ASSISTANT_ID="your_assistant_id"
```

### Step 2: Get Your Assistant ID

In VAPI Dashboard:
1. Go to **Assistants**
2. Click on your "Technical Interview Bot"
3. Copy the **Assistant ID** from the URL or details panel
   - Format: `assistant_xyz123`

### Step 3: Flow Integration

```
User Dashboard
    ↓
Click "Start New Interview"
    ↓
Interview Setup Wizard (Field + Level)
    ↓
API: POST /api/interview/create
  ├─ Create session in DB
  └─ Generate questions via Gemini
    ↓
Interview Session Page
    ↓
Click "Start Voice Interview"
    ↓
API: POST /api/interview/start-call
  ├─ Initialize VAPI assistant
  ├─ Pass context (field, level, questions)
  └─ Return call token
    ↓
VAPI Voice Agent Calls User
    ├─ Asks generated questions
    ├─ Records responses
    └─ Transcribes audio
    ↓
Interview Completes (user hangs up or timeout)
    ↓
VAPI sends webhook: POST /api/interview/complete
  ├─ Receive transcript & recording
  ├─ Evaluate answers via Gemini
  ├─ Generate feedback
  └─ Save to session DB
    ↓
Show Feedback Page
  ├─ Score & performance
  ├─ Strengths & weaknesses
  └─ Recommendations
```

---

## 6️⃣ Test the Agent

### Step 1: Local Testing

1. Start your dev server:
```bash
npm run dev
```

2. Go to: http://localhost:3000/sign-in
3. Sign in or create account
4. Start a new interview
5. When prompted, click "Start Voice Interview"
6. VAPI will call you (make sure your device has audio)

### Step 2: VAPI Dashboard Testing

In VAPI Dashboard:
1. Go to **Assistants**
2. Click your assistant
3. Click **"Test"** button (top right)
4. Click **"Start Call"**
5. VAPI will call you for testing

### Step 3: Check Call Logs

In VAPI Dashboard:
1. Go to **Calls** section
2. See all call history
3. Click on a call to see:
   - Transcript
   - Recording
   - Metadata
   - Duration
   - Status

---

## 7️⃣ Advanced: Custom Questions via Webhook

### Step 1: Pass Context to VAPI

Modify your start-call API:

```typescript
// app/api/interview/start-call/route.ts

const vapiPayload = {
  assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
  phoneNumberId: "your_phone_number_id",
  customerPhoneNumber: userPhoneNumber,
  customData: {
    sessionId: session.id,
    candidateField: session.field,
    candidateLevel: session.level,
    questions: session.questions,
    webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/interview/complete`,
  }
};

const response = await fetch('https://api.vapi.ai/call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(vapiPayload)
});
```

### Step 2: Access in VAPI System Prompt

The system prompt can access this data via template variables:
```
Interview for: {{candidateField}} developer
Level: {{candidateLevel}}
Questions to ask:
1. {{question1}}
2. {{question2}}
3. {{question3}}
```

---

## 8️⃣ Troubleshooting

### ❌ Error: "Invalid API Key"
**Solution:**
- Copy API key from VAPI dashboard again
- Make sure no extra spaces in .env.local
- Restart dev server: `npm run dev`

### ❌ Error: "Call Failed to Connect"
**Solution:**
- Check your internet connection
- Verify phone number is valid (if using phone calls)
- Check VAPI billing is active
- Check browser allows microphone access

### ❌ Error: "No Audio Detected"
**Solution:**
- Allow microphone permission in browser
- Check volume levels
- Test microphone in another app first
- Try different browser

### ❌ Error: "Webhook Not Receiving Data"
**Solution:**
- Verify webhook URL is publicly accessible
- Check logs: `npm run dev` and look for POST requests
- Use ngrok for local testing:
  ```bash
  ngrok http 3000
  # Use ngrok URL in VAPI webhook settings
  ```
- Ensure firewall allows incoming requests

### ❌ Error: "Assistant Not Found"
**Solution:**
- Verify Assistant ID is correct
- Check it's the full ID (assistant_xyz...)
- Make sure assistant is enabled/published
- Try creating a new assistant

---

## 9️⃣ Production Checklist

Before deploying to production:

- [ ] VAPI API key is in `.env.local` (not committed to git)
- [ ] Webhook URL uses HTTPS (required for production)
- [ ] Error handling for all VAPI calls
- [ ] Rate limiting on API endpoints
- [ ] Call recording storage (S3/Cloud Storage)
- [ ] User consent for recording before call
- [ ] GDPR compliance (data retention policy)
- [ ] Monitoring & alerting for failed calls
- [ ] Cost tracking & usage limits set
- [ ] Phone number (if using VAPI phone) is verified
- [ ] Load testing for concurrent calls

---

## 🔟 Cost Estimation

**VAPI Pricing (as of 2026):**
- Inbound calls: $0.10/minute
- Outbound calls: $0.10/minute
- SMS: $0.01 per message
- Recording storage: $0.01/minute/month

**Example for 100 users:**
- 100 interviews × 20 minutes each
- Cost: 100 × 20 × $0.10 = **$200/month**
- With storage: ~**$250/month**

**Cost Optimization:**
- Set max call duration (e.g., 30 min)
- Use voice provider with lower rates
- Archive old recordings
- Monitor and set usage alerts

---

## 📚 Useful Resources

- VAPI Docs: https://docs.vapi.ai/
- VAPI API Reference: https://docs.vapi.ai/api-reference
- Webhook Guide: https://docs.vapi.ai/guides/webhooks
- System Prompt Examples: https://docs.vapi.ai/guides/system-prompts
- Voice Agents Best Practices: https://docs.vapi.ai/guides/best-practices

---

## 🎯 Next Steps

1. ✅ Create VAPI account
2. ✅ Create voice assistant with system prompt
3. ✅ Update .env.local with VAPI keys
4. ✅ Configure webhook in VAPI dashboard
5. ✅ Test locally with ngrok
6. ✅ Deploy to production
7. ✅ Monitor call quality and costs
8. ✅ Iterate on system prompt based on feedback

---

## 💡 Pro Tips

1. **System Prompt Optimization:**
   - A/B test different prompts
   - Track candidate feedback
   - Adjust difficulty based on responses

2. **Voice Selection:**
   - Test different voices with users
   - Use consistent voice for brand identity
   - Consider accent and pace

3. **Error Recovery:**
   - Implement fallback responses
   - Handle user confusion gracefully
   - Provide contact info if issues occur

4. **Analytics:**
   - Track call duration
   - Monitor transcription quality
   - Measure interview completion rate
   - Analyze candidate satisfaction

---

## 📞 Support

- VAPI Support: support@vapi.ai
- GitHub Issues: https://github.com/vapi-ai/
- Community Discord: https://discord.gg/vapi

---

**Happy interviewing! 🚀**
