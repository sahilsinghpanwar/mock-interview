"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import DemoOne from "@/components/ui/features-demo";
import SectionWithMockup from "@/components/ui/section-with-mockup";
import {
  Mic,
  Brain,
  Sparkles,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Target,
  ChevronDown,
  ChevronUp,
  Volume2,
  Play,
  RefreshCw,
  Star,
  CheckCircle2,
  Lock,
  MessageSquare,
  Timer,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Types
type DemoState = "idle" | "connecting" | "speaking" | "listening" | "grading" | "results";

// Job Roles for Interactive Simulator
const demoRoles = [
  {
    id: "frontend",
    title: "Frontend Engineer",
    icon: Sparkles,
    color: "from-cyan-500 to-blue-500",
    glowColor: "rgba(6, 182, 212, 0.15)",
    question: "Can you explain how React's Virtual DOM optimizes rendering, and when you would use the useMemo hook to prevent performance bottlenecks?",
    userAnswer: "The Virtual DOM is an in-memory representation of the real DOM. When state changes, React creates a new tree and diffs it with the old one, only updating changed parts. I use useMemo to cache expensive computations between renders, ensuring they only recalculate when dependencies actually change, which keeps complex components highly responsive.",
    metrics: {
      technical: 94,
      communication: 88,
      pacing: 92,
      overall: 91,
    },
    feedback: {
      strengths: [
        "Clear and precise explanation of the Virtual DOM diffing process.",
        "Excellent architectural callout about caching expensive calculations with useMemo.",
      ],
      improvements: [
        "Could briefly mention the memory trade-offs when overusing useMemo.",
        "Try to reduce transitional filler words ('well', 'so') when moving between concepts.",
      ],
    },
  },
  {
    id: "backend",
    title: "Backend Architect",
    icon: Brain,
    color: "from-violet-500 to-indigo-500",
    glowColor: "rgba(124, 58, 237, 0.15)",
    question: "How would you design a distributed, highly-scalable system with eventual consistency, and which message broker would you choose for stream processing?",
    userAnswer: "I would design the system with microservices connected via Apache Kafka for event-driven stream processing. For eventual consistency, I'd apply the Saga pattern using orchestrators to manage distributed transactions. Databases would be optimized for reads using CQRS, leveraging Redis caches to reduce read loads on the primary database.",
    metrics: {
      technical: 96,
      communication: 90,
      pacing: 85,
      overall: 92,
    },
    feedback: {
      strengths: [
        "Superb usage of distributed design patterns (Saga, CQRS) to achieve reliability.",
        "Solid justification for choosing Apache Kafka for high-throughput stream processing.",
      ],
      improvements: [
        "Consider outlining how you would handle dead-letter queues (DLQ) for failed events.",
        "Slightly slow pace in the middle; speak with a bit more structural flow.",
      ],
    },
  },
  {
    id: "pm",
    title: "Product Manager",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
    question: "You are launching a new AI feature. How do you define its launch success, and what metrics would you track in the first 30 days?",
    userAnswer: "I would define success by both user activation and high-value retention. For metrics, I'd track first-week adoption rates, the completion rate of the AI user journey, and user satisfaction via NPS. Crucially, I'd monitor the feature retention rate at day 30 to verify if it provides persistent value.",
    metrics: {
      technical: 90,
      communication: 95,
      pacing: 90,
      overall: 93,
    },
    feedback: {
      strengths: [
        "Strong focus on customer retention (Day 30) rather than just initial vanity metrics.",
        "Highly structured delivery, transitioning clearly between activation, metrics, and long-term value.",
      ],
      improvements: [
        "Could expand on how you'd collect qualitative feedback to complement the quantitative NPS.",
        "Add a brief statement on cost-to-serve metrics given it is an AI resource-heavy feature.",
      ],
    },
  },
];


// Steps
const steps = [
  {
    num: "01",
    title: "Define Target Profile",
    description:
      "Input your target job title, job description, experience level, and select focus topics. Gemini analyzes these parameters to construct a fully customized syllabus.",
    icon: Target,
  },
  {
    num: "02",
    title: "Engage in Voice Practice",
    description:
      "Launch a live phone-like session with our AI voice avatar. Speak naturally to answer questions, and the AI listens, structures, and adapts to your pacing.",
    icon: Mic,
  },
  {
    num: "03",
    title: "Analyze & Optimize",
    description:
      "Review a comprehensive scorecard showing your exact percentages on technical accuracy, clarity, speech filler-word count, and step-by-step structural suggestions.",
    icon: BarChart3,
  },
];

// Stats
const stats = [
  { value: "8+", label: "Specialized Roles" },
  { value: "Gemini", label: "Intelligence Core" },
  { value: "< 25s", label: "Feedback Delivery" },
  { value: "100%", label: "Secure Firebase Storage" },
];

// Testimonials
const testimonials = [
  {
    quote: "Mock.ai felt exactly like my actual engineering interview at Stripe. The voice pacing, the follow-up questions, and the feedback on my articulation were spot on.",
    name: "Alex Rivera",
    role: "Senior Frontend Engineer",
    avatar: "AR",
    company: "Stripe",
    rating: 5,
  },
  {
    quote: "I used this to practice product metrics scenarios. The instant Vapi voice flow is extremely realistic and forces you to think clearly on your feet.",
    name: "Sarah Chen",
    role: "L6 Product Manager",
    avatar: "SC",
    company: "Google",
    rating: 5,
  },
  {
    quote: "The detailed feedback breakdown is the best part. It identified my over-use of technical acronyms without defining them first. Game changer.",
    name: "Marcus Thorne",
    role: "Distributed Systems Architect",
    avatar: "MT",
    company: "Netflix",
    rating: 5,
  },
];

// FAQ items
const faqItems = [
  {
    question: "How does the AI voice conversation work?",
    answer: "Our system integrates the advanced conversational Vapi SDK. When you start an interview, an audio channel is securely established. The AI speaks to ask custom questions, listens to your input using advanced speech-to-text, and responds in real-time, just like a standard phone or video call.",
  },
  {
    question: "Is my personal practice data private?",
    answer: "Yes, completely. Your recordings, audio transcripts, and grading dashboards are stored securely in your individual Firebase database. We never share, sell, or use your private conversations to train public models.",
  },
  {
    question: "Can I practice for non-technical or niche roles?",
    answer: "Absolutely. In addition to our pre-built fields (Frontend, Backend, System Design, Product Management), you can type any custom job title or paste a specific job description. Gemini will analyze the text and draft exact, highly relevant questions for that specific role.",
  },
  {
    question: "How is the performance feedback calculated?",
    answer: "As soon as you finish your interview, your voice transcript is evaluated by Gemini. It grades your answers against standard rubrics for technical accuracy, structure, pacing, vocabulary, and communication clarity, and returns structured feedback within seconds.",
  },
  {
    question: "Is Mock.ai free to use?",
    answer: "Yes! Currently, you can create an account and practice interviews completely free of charge. We want to make high-quality, realistic professional practice accessible to every developer globally.",
  },
];

// Custom Logo Component
const Logo = () => (
  <div className="flex items-center gap-3.5 group cursor-pointer">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black dark:bg-neutral-900 border border-black/10 dark:border-white/10 overflow-hidden shadow-inner transition-all duration-500 group-hover:border-violet-500/40 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.25)]">
      {/* Subtle glowing mesh */}
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-400 opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
      
      {/* Sleek geometric audio wave + neural node SVG */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-black dark:text-white relative z-10"
      >
        <path d="M7 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
        <path d="M11 12V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-70 group-hover:stroke-cyan-400 transition-colors" />
        <path d="M15 8V24" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 12V20" stroke="url(#logo-gradient)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 10V22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-80 group-hover:stroke-violet-400 transition-colors" />
        <path d="M27 16V16.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-40" />
        <defs>
          <linearGradient id="logo-gradient" x1="15" y1="8" x2="19" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
      Mock<span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">.ai</span>
    </span>
  </div>
);

// Grid Background with light leak blobs
const GridBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
    {/* Clean, high-tech grid overlay */}
    <svg className="absolute h-full w-full stroke-neutral-900/[0.03] dark:stroke-white/[0.02] [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]" fill="none">
      <defs>
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M.5 40V.5H40" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
    {/* Floating color meshes */}
    <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/10 dark:bg-violet-600/8 blur-3xl animate-float" />
    <div className="absolute top-20 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/8 dark:bg-cyan-500/5 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-[350px] w-[700px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/3 blur-3xl" />
  </div>
);

// Interactive Waveform component
const Waveform = ({ active, colorClass = "bg-violet-500 dark:bg-violet-400" }: { active: boolean; colorClass?: string }) => {
  const bars = Array.from({ length: 16 });
  return (
    <div className="flex items-center justify-center gap-1 h-10 w-full max-w-[200px] mx-auto">
      {bars.map((_, i) => (
        <div
          key={i}
          className={`w-1 h-6 rounded-full ${colorClass}`}
          style={{
            animation: active ? `pulse-bar 1s ease-in-out infinite` : "none",
            animationDelay: `${i * 0.05}s`,
            transform: active ? undefined : "scaleY(0.2)",
            transition: "transform 0.3s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(demoRoles[0]);
  const [demoState, setDemoState] = useState<DemoState>("idle");
  const [simulatedTranscript, setSimulatedTranscript] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [typedProgress, setTypedProgress] = useState(0);
  const textIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop simulated text typing
  const clearTyping = () => {
    if (textIntervalRef.current) {
      clearInterval(textIntervalRef.current);
      textIntervalRef.current = null;
    }
  };

  // Simulate text typing
  const typeText = (fullText: string, onComplete: () => void, speed = 25) => {
    clearTyping();
    setSimulatedTranscript("");
    let currentIdx = 0;
    textIntervalRef.current = setInterval(() => {
      if (currentIdx < fullText.length) {
        setSimulatedTranscript((prev) => prev + fullText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearTyping();
        onComplete();
      }
    }, speed);
  };

  // Reset simulator
  const handleResetDemo = () => {
    clearTyping();
    setDemoState("idle");
    setSimulatedTranscript("");
  };

  // Simulator flow orchestrator
  const startDemoCall = () => {
    setDemoState("connecting");
    setSimulatedTranscript("Establishing Vapi secure audio stream...");
    
    // Step 1: Connecting
    setTimeout(() => {
      setDemoState("speaking");
      // Step 2: AI speaking question
      typeText(selectedRole.question, () => {
        // Wait 2.5 seconds after speaking question, then simulate user answering
        setTimeout(() => {
          setDemoState("listening");
          // Step 3: User answering (typing transcription)
          typeText(selectedRole.userAnswer, () => {
            // Wait 2 seconds, then transition to grading
            setTimeout(() => {
              setDemoState("grading");
              setSimulatedTranscript("Analyzing voice recording metrics...");
              
              // Simulated loading phases
              setTimeout(() => {
                setSimulatedTranscript("Evaluating technical knowledge...");
              }, 1200);
              setTimeout(() => {
                setSimulatedTranscript("Computing delivery clarity & speech pace...");
              }, 2400);

              setTimeout(() => {
                setDemoState("results");
              }, 3800);
            }, 2000);
          }, 20); // User types faster
        }, 1500);
      }, 30);
    }, 1800);
  };

  useEffect(() => {
    return () => clearTyping();
  }, []);

  // Circular progress renderer for metrics
  const renderCircularScore = (score: number, label: string) => {
    const radius = 30;
    const circ = 2 * Math.PI * radius;
    const strokeOffset = circ - (score / 100) * circ;

    return (
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.01] border border-black/5 dark:border-white/5">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-neutral-200 dark:stroke-neutral-800 fill-none"
              strokeWidth="4"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-violet-600 dark:stroke-violet-400 fill-none transition-all duration-1000 ease-out"
              strokeWidth="4"
              strokeDasharray={circ}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-black text-neutral-900 dark:text-white">{score}%</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold text-center">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-neutral-200 overflow-x-hidden selection:bg-violet-500 selection:text-white">
      
      {/* Sticky Header Nav */}
      <nav className="sticky top-0 z-50 border-b border-dashed border-neutral-900 bg-black/80 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3.5">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-neutral-400 hover:text-white hover:bg-neutral-900">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="relative overflow-hidden group bg-neutral-950 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 border border-neutral-800 dark:border-neutral-200">
              <Link href="/sign-up" className="flex items-center gap-1">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Premium Hero Mockup Section */}
      <SectionWithMockup
        title={
          <>
            Ace your next
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-500 to-cyan-400 bg-clip-text text-transparent animate-gradient font-black">
              tech panels.
            </span>
          </>
        }
        description={
          <div className="space-y-8">
            <p className="text-[#868f97] text-base md:text-lg leading-relaxed">
              Practice speaking naturally with a specialized AI voice avatar. Talk through solutions, receive active coding/architectural prompts, and review immediate analytical grading sheets.
            </p>
            <div className="flex flex-wrap items-center gap-4 w-full pt-2">
              <Button size="lg" asChild className="h-12 px-6 text-sm bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-violet-500/20">
                <Link href="/sign-up" className="flex items-center gap-2 font-bold">
                  Start Practicing Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="h-12 px-6 text-sm text-neutral-200 border-neutral-800 hover:bg-neutral-900 rounded-xl transition-all">
                <Link href="/sign-in" className="font-semibold">I have an account</Link>
              </Button>
            </div>
          </div>
        }
        primaryImageSrc="/primary-mockup.png"
        secondaryImageSrc="/secondary-mockup.png"
      />

      {/* Dynamic Animated Feature Grid Section */}
      <DemoOne />

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-20 md:py-28 px-6 border-b border-dashed border-neutral-900 bg-black overflow-hidden">
        {/* Cohesive background grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-4xl mx-auto relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Methodology</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              How it works.
            </h2>
            <p className="text-[#868f97] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Three simple phases between you and full structural confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-900 border border-dashed border-neutral-900 rounded-3xl overflow-hidden bg-neutral-950/40 backdrop-blur-md">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative overflow-hidden p-6 md:p-8 flex flex-col items-start gap-4 hover:bg-neutral-900/10 transition-colors"
                >
                  {/* Inner grid overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
                  
                  <span className="text-violet-500 font-extrabold tracking-widest text-[10px] uppercase">Phase {step.num}</span>
                  
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base sm:text-lg font-black text-white">{step.title}</h3>
                    <Icon className="w-4 h-4 text-neutral-500 shrink-0" />
                  </div>
                  
                  <p className="text-[#868f97] text-xs md:text-sm font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* How It Works Action */}
          <div className="text-center mt-16">
            <Button size="lg" asChild className="h-13 px-10 text-base bg-white text-black font-extrabold rounded-2xl hover:scale-102 active:scale-98 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-neutral-200 transition-all duration-300">
              <Link href="/sign-up" className="flex items-center gap-2">
                <span>Start Your Initial Session</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

        </div>
      </section>

      {/* Testimonials section */}
      <section className="relative py-20 md:py-28 px-6 border-b border-dashed border-neutral-900 bg-black overflow-hidden transition-colors duration-300">
        {/* Cohesive background grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">User Reviews</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              Validated by developers.
            </h2>
            <p className="text-[#868f97] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Read how software engineers and product specialists prep using our AI core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dashed divide-neutral-900 border border-dashed border-neutral-900 rounded-3xl overflow-hidden bg-neutral-950/40 backdrop-blur-md">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden p-6 md:p-8 flex flex-col justify-between hover:bg-neutral-900/10 transition-all duration-300"
              >
                {/* Inner grid overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />

                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 italic leading-relaxed font-light">
                    {t.quote}
                  </p>
                </div>

                {/* Profile card details */}
                <div className="flex items-center gap-3.5 border-t border-dashed border-neutral-900 pt-5 mt-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-violet-600/10">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-neutral-800 dark:text-white">{t.name}</h4>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">{t.role} @ {t.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="relative py-20 md:py-28 px-6 border-b border-dashed border-neutral-900 bg-black overflow-hidden">
        {/* Cohesive background grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

        <div className="max-w-3xl mx-auto relative z-10">
          
          <div className="text-center max-w-xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">FAQ</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
              Frequently asked questions.
            </h2>
            <p className="text-[#868f97] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Find instant explanations for how our audio engine and algorithms run.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 backdrop-blur-md overflow-hidden transition-all duration-300"
                >
                  {/* Inner grid overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808003_1px,transparent_1px),linear-gradient(to_bottom,#80808003_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4.5 flex items-center justify-between text-left hover:bg-neutral-900/40 transition-colors relative z-10"
                  >
                    <span className="text-xs sm:text-sm font-black text-white">{item.question}</span>
                    <div className="shrink-0 ml-4 p-1 rounded-lg border border-dashed border-neutral-800 bg-neutral-900/50">
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {/* FAQ Content Box */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-56 opacity-100 border-t border-dashed border-neutral-800" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="p-5 text-xs sm:text-sm text-neutral-400 leading-relaxed font-light bg-neutral-950/20 relative z-10">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* GDPR / Trust Indicators */}
      <section className="py-12 border-b border-dashed border-neutral-900 bg-black">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest bg-neutral-950 px-3.5 py-1.5 rounded-full border border-dashed border-neutral-850">
            <Shield className="w-3.5 h-3.5 text-violet-500" />
            <span>GDPR COMPLIANT & END-TO-END SECURE</span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500 max-w-xl mx-auto leading-relaxed font-medium">
            All transcript records are isolated inside your individual client-side Firebase dashboard. Live telephony node streams are processed in end-to-end encrypted tunnels. We store zero audio file files after active processing completes.
          </p>
        </div>
      </section>

      {/* Large Closing Call To Action Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Shifting visual blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-br from-violet-600/15 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative overflow-hidden z-10 max-w-4xl mx-auto rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white/20 dark:bg-neutral-950/20 backdrop-blur-md p-8 md:p-12 text-center shadow-lg dark:shadow-neutral-950/30">
          {/* Cohesive background grid pattern inside CTA */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 dark:opacity-30" />

          <div className="max-w-xl mx-auto space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-500">Accelerate Your Prep</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
                Ready to ace your <br />tech panels?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                Join thousands of software engineering, architecture, and product professionals practicing voice responses. Build natural confidence and receive instantaneous feedback reports.
              </p>
            </div>

            <Button size="lg" asChild className="h-13 px-10 text-base bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-2xl shadow-xl shadow-violet-600/20 hover:shadow-violet-600/30 hover:scale-102 active:scale-98 transition-all border border-violet-500/20">
              <Link href="/sign-up" className="flex items-center gap-2">
                <span>Start Practice Session Free</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="border-t border-dashed border-neutral-200 dark:border-neutral-900 py-12 px-6 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />
          
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Interactive Demo</a>
            <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">FAQ</a>
            <Link href="/sign-in" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold">
            © {new Date().getFullYear()} Mock.ai. Fabricated with Next.js, Gemini & Vapi.
          </p>
        </div>
      </footer>

    </div>
  );
}
