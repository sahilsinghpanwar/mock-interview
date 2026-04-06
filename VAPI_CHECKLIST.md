# ✅ VAPI Setup Checklist
## Quick Reference for Creating & Configuring VAPI Voice Agent

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create VAPI Account (2 min)
- [ ] Go to https://vapi.ai
- [ ] Sign up with email/Google/GitHub
- [ ] Verify email
- [ ] Log in to dashboard

### Step 2: Get API Keys (1 min)
- [ ] Click Settings → API Keys
- [ ] Create new API key
- [ ] Copy to `.env.local` as `VAPI_API_KEY`
- [ ] Copy Public Key to `.env.local` as `NEXT_PUBLIC_VAPI_PUBLIC_KEY`

### Step 3: Create Assistant (2 min)
- [ ] Go to Assistants
- [ ] Click "Create Assistant"
- [ ] Fill in name: "Technical Interview Bot"
- [ ] Select voice: "Alloy" or "Nova"
- [ ] Model: gpt-4-turbo
- [ ] Copy system prompt from `VAPI_SETUP_GUIDE.md`
- [ ] Save and copy Assistant ID
- [ ] Add to `.env.local` as `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

### Step 4: Test Locally (0 min)
- [ ] Restart dev server: `npm run dev`
- [ ] Go to http://localhost:3000
- [ ] Start an interview
- [ ] Click "Start Interview"
- [ ] Allow microphone access
- [ ] VAPI calls you!

---

## 📋 Complete Setup Workflow

### Phase 1: Account & Billing (10 min)

**Tasks:**
- [ ] Create VAPI account at https://vapi.ai
- [ ] Verify email
- [ ] Complete profile setup
- [ ] Add payment method (required)
- [ ] Check free credits available
- [ ] Set usage limits/alerts

**Expected Result:** Account ready with available credits

---

### Phase 2: API Key Management (5 min)

**Tasks:**
- [ ] Go to Settings → API Keys
- [ ] Create API key named "mock-interview-prod"
- [ ] Copy API key (secret, keep safe!)
- [ ] Copy Public Key
- [ ] Create Personal Access Token
- [ ] Save all keys in password manager
- [ ] Add to `.env.local`:
  ```bash
  VAPI_API_KEY="your_api_key"
  NEXT_PUBLIC_VAPI_PUBLIC_KEY="your_public_key"
  ```

**Expected Result:** All keys stored securely

---

### Phase 3: Create Voice Assistant (15 min)

**Tasks:**
- [ ] Navigate to Assistants section
- [ ] Click "Create Assistant"
- [ ] Fill Basic Info:
  - [ ] Name: "Technical Interview Bot"
  - [ ] Description: "AI-powered technical interview conductor"
- [ ] Select Voice:
  - [ ] Provider: OpenAI
  - [ ] Voice: Alloy (professional & clear)
  - [ ] Speed: 1.0
  - [ ] Test by clicking speaker icon
- [ ] Configure Model:
  - [ ] Provider: OpenAI
  - [ ] Model: gpt-4-turbo
  - [ ] Temperature: 0.7
  - [ ] Max tokens: 1000
- [ ] Add System Prompt:
  - [ ] Copy from `VAPI_SETUP_GUIDE.md` section "System Prompt"
  - [ ] Customize with your field list
  - [ ] Paste into system prompt field
- [ ] Advanced Settings:
  - [ ] Enable recording: YES
  - [ ] Enable transcription: YES
  - [ ] Max call duration: 45 minutes
  - [ ] Silence timeout: 30 seconds
- [ ] Save Assistant
- [ ] Copy Assistant ID from URL or details panel
- [ ] Add to `.env.local`:
  ```bash
  NEXT_PUBLIC_VAPI_ASSISTANT_ID="assistant_xyz123"
  ```

**Expected Result:** Voice assistant created and ready to use

---

### Phase 4: Configure Webhooks (10 min)

**Tasks:**
- [ ] In VAPI Assistant settings
- [ ] Scroll to "Webhooks" section
- [ ] Enable webhook events:
  - [ ] Call Started
  - [ ] Call Ended ✓ (IMPORTANT)
  - [ ] Recording Available ✓ (IMPORTANT)
  - [ ] Message Received (optional)
- [ ] Set webhook URL:
  - [ ] Local: `http://localhost:3000/api/interview/complete`
  - [ ] Production: `https://yourdomain.com/api/interview/complete`
- [ ] Set webhook auth (optional but recommended):
  - [ ] Authorization header: `Bearer YOUR_API_KEY`
  - [ ] Content-Type: `application/json`
- [ ] Save webhook configuration

**Expected Result:** Webhooks configured to send data after interview

---

### Phase 5: Local Testing (15 min)

**Tasks:**
- [ ] Update `.env.local` with all keys
- [ ] Restart dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Sign in or create account
- [ ] Go to dashboard
- [ ] Click "Start New Interview"
- [ ] Select field: JavaScript
- [ ] Select level: Junior
- [ ] Click "Continue"
- [ ] Click "Start Interview"
- [ ] Allow microphone when browser asks
- [ ] Wait for VAPI to call you
- [ ] Listen to first question
- [ ] Speak your answer clearly
- [ ] Complete interview
- [ ] Check feedback page

**Expected Result:** End-to-end interview works!

---

### Phase 6: Authorized Domains (5 min)

**For Production/Deployment:**

- [ ] In VAPI dashboard → Settings
- [ ] Go to "Authorized Domains"
- [ ] Add your domains:
  - [ ] `localhost:3000` (development)
  - [ ] `yourdomain.com` (production)
  - [ ] `*.vercel.app` (if using Vercel)
  - [ ] Any other domains

**Expected Result:** VAPI works on all your domains

---

### Phase 7: Error Handling & Monitoring (20 min)

**Setup Monitoring:**
- [ ] Enable call logs in VAPI dashboard
- [ ] Test failed call scenarios:
  - [ ] No microphone permission
  - [ ] Network failure
  - [ ] Call timeout
- [ ] Check error messages in browser console
- [ ] Verify webhook receives error data
- [ ] Add error tracking (e.g., Sentry)

**Tasks:**
- [ ] Review call logs in VAPI dashboard
- [ ] Check recording quality
- [ ] Verify transcription accuracy
- [ ] Monitor API usage

**Expected Result:** Error handling works, monitoring in place

---

## 🧪 Testing Scenarios

### ✅ Success Case
```
1. User signs in
2. Creates new interview
3. Clicks "Start Interview"
4. Browser asks for microphone → Allow
5. VAPI calls within 3 seconds
6. Hears greeting: "Hello, I'm your technical interviewer..."
7. Responds to questions
8. After 20-30 min, interview ends
9. Sees feedback page with score
```

### ❌ Error Cases

**Error: "Invalid API Key"**
- [ ] Check `.env.local` has correct key
- [ ] No extra spaces in key
- [ ] Restart dev server
- [ ] Verify key in VAPI dashboard hasn't changed

**Error: "Assistant Not Found"**
- [ ] Verify Assistant ID is correct format: `assistant_xyz`
- [ ] Check Assistant is published/enabled
- [ ] Copy ID again from VAPI dashboard

**Error: "Call Failed"**
- [ ] Check internet connection
- [ ] Check microphone permissions
- [ ] Try different browser
- [ ] Check VAPI account has credit

**Error: "No Audio"**
- [ ] Test microphone in browser settings
- [ ] Try different device/microphone
- [ ] Check volume levels
- [ ] Restart browser

**Error: "Webhook Not Called"**
- [ ] Check webhook URL is correct
- [ ] Ensure URL is publicly accessible (use ngrok if local)
- [ ] Check API endpoint in browser DevTools Network tab
- [ ] Verify webhook auth headers if configured

---

## 🔧 Configuration Reference

### Minimum Required .env.local
```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY="pk_..."
VAPI_API_KEY="sk_..."
NEXT_PUBLIC_VAPI_ASSISTANT_ID="assistant_..."
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Optional .env.local
```bash
NEXT_PUBLIC_VAPI_WEBHOOK_SECRET="webhook_secret"
VAPI_PHONE_NUMBER_ID="pn_..."  # If using VAPI phone calls
VAPI_MAX_CALL_DURATION="2700"   # 45 minutes in seconds
```

### Environment Variables by Provider

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable (NEXT_PUBLIC_ ones visible to browser)
3. Redeploy

**Local (.env.local):**
```bash
NEXT_PUBLIC_VAPI_PUBLIC_KEY="..."
VAPI_API_KEY="..."  # Server-side only
NEXT_PUBLIC_VAPI_ASSISTANT_ID="..."
```

---

## 📞 VAPI Assistant Configuration Template

**System Prompt for Technical Interviews:**
```
You are a professional technical interview conductor.

Interview Context:
- Field: {{candidateField}} (JavaScript, Python, Java, etc.)
- Level: {{candidateLevel}} (junior, mid, senior)

Interview Workflow:
1. Greet candidate warmly and introduce yourself
2. Ask each provided question one at a time
3. Listen carefully to responses
4. Ask follow-up questions for clarity (max 2 per main question)
5. Be supportive and professional
6. Summarize strengths at end

Questions to Ask:
{{interviewQuestions}}

Important Guidelines:
- Speak clearly with natural pauses
- Wait for complete answers
- Encourage candidates to explain thinking
- Don't rush - let candidate think
- Be constructive and supportive
- End with: "Thank you for your time. You showed good understanding..."
```

---

## 💰 Cost Tracking

**Monitor Usage:**
- [ ] Go to VAPI Settings → Billing
- [ ] Check current month's charges
- [ ] Set monthly spend limit
- [ ] Enable usage alerts
- [ ] Review call logs for optimization

**Estimate Costs:**
- 100 users × 25 min per interview = 41.67 hours
- 41.67 hours × $0.10/min = ~$250/month
- Plus storage: ~$25/month
- **Total: ~$275/month for 100 users**

---

## 🚀 Launch Checklist

Before going to production:

- [ ] All environment variables set
- [ ] Error handling in place
- [ ] Webhook receiving data
- [ ] Recording storage configured
- [ ] GDPR consent shown to users
- [ ] Call recording disclosure
- [ ] Data retention policy set
- [ ] Billing alerts configured
- [ ] Rate limiting on API endpoints
- [ ] Monitoring & alerting setup
- [ ] User support email configured
- [ ] Tested with 5+ real users
- [ ] Performance acceptable (<3s to start call)
- [ ] Transcription quality verified
- [ ] Feedback accuracy verified

---

## 📚 Useful Links

- **VAPI Dashboard:** https://vapi.ai/dashboard
- **VAPI Docs:** https://docs.vapi.ai
- **API Reference:** https://docs.vapi.ai/api-reference
- **System Prompt Guide:** https://docs.vapi.ai/guides/system-prompts
- **Webhook Documentation:** https://docs.vapi.ai/guides/webhooks
- **Status Page:** https://status.vapi.ai
- **Community Discord:** https://discord.gg/vapi
- **Email Support:** support@vapi.ai

---

## 🎯 Next Steps After Setup

1. **Monitor call quality** - Check VAPI dashboard for audio quality scores
2. **Optimize system prompt** - A/B test different prompts based on feedback
3. **Integrate Firestore** - Store interview results long-term
4. **Add analytics** - Track user performance over time
5. **Build recruiter dashboard** - View candidate interviews
6. **Setup email notifications** - Send feedback to candidates
7. **Mobile optimization** - Ensure works on iOS/Android
8. **Multi-language support** - Support interviews in different languages

---

## ✨ Pro Tips

1. **Test Different Voices:**
   - Alloy: Professional, clear
   - Nova: Warm, friendly
   - Echo: Energetic
   - Try each with real users

2. **System Prompt Optimization:**
   - Start simple, add complexity gradually
   - Test with junior/mid/senior users
   - Adjust based on user feedback
   - Version control prompts

3. **Cost Optimization:**
   - Set max call duration (e.g., 35 min)
   - Monitor transcription accuracy
   - Archive old recordings to cheaper storage
   - Batch similar interviews

4. **User Experience:**
   - Show countdown timer
   - Display current question on screen
   - Allow pause/resume
   - Send follow-up email with results

5. **Quality Assurance:**
   - Personally take 5+ test interviews
   - Have team test different scenarios
   - Collect feedback from beta users
   - Continuously refine

---

**You're all set! Happy interviewing! 🎉**
