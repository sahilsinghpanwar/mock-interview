"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { FaRobot } from "react-icons/fa";

// Features

const features = [
  {
    icon: Brain,
    title: "AI-Generated Questions",
    description:
      "Gemini crafts role-specific questions tailored to your field, level, and tech stack — no two interviews are the same.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: Mic,
    title: "Voice Interview",
    description:
      "Talk to a real AI interviewer via Vapi. Practice your verbal communication, pacing, and confidence.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Sparkles,
    title: "Instant Feedback",
    description:
      "Get a detailed score, strengths, improvements, and actionable tips within seconds of finishing.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description:
      "See your performance trends over time, identify weak areas, and measure your growth.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

// How It Works

const steps = [
  {
    num: "01",
    title: "Choose Your Field",
    description:
      "Select from 8+ preset technical fields or type any custom role — React, Blockchain, Data Science, anything.",
    icon: Target,
  },
  {
    num: "02",
    title: "Start the Voice Interview",
    description:
      "AI generates tailored questions and an AI voice interviewer conducts a realistic session in real time.",
    icon: Mic,
  },
  {
    num: "03",
    title: "Get Your Score & Feedback",
    description:
      "Receive a detailed performance report with scores, strengths, improvement areas, and actionable next steps.",
    icon: BarChart3,
  },
];

// Stats

const stats = [
  { value: "8+", label: "Technical Fields" },
  { value: "AI", label: "Voice Interviewer" },
  { value: "< 30s", label: "Feedback Time" },
  { value: "100%", label: "Free to Use" },
];

// Component

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="relative z-20 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <FaRobot className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight">Mock + AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="gap-1">
              <Link href="/sign-up">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6">
        {/* Background decoration */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl animate-float" />
          <div className="absolute top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-indigo-500/6 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/50 backdrop-blur text-sm text-muted-foreground mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Powered by Gemini AI & Vapi Voice
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Ace Your Next
            <br />
            <span className="gradient-text">Tech Interview</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            Practice with an AI voice interviewer that asks role-specific
            questions, listens to your answers, and gives you instant,
            detailed feedback.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center justify-center gap-4 animate-fade-in"
            style={{ animationDelay: "300ms" }}
          >
            <Button size="lg" asChild className="h-12 px-8 text-base gap-2">
              <Link href="/sign-up">
                Start Practicing Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="/sign-in">I have an account</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="gradient-text">prepare</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From question generation to voice practice to performance tracking
              — all in one platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 stagger-children">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to a better interview performance.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative flex items-start gap-6 animate-fade-in"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Number circle */}
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {step.num}
                    </span>
                  </div>

                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className="absolute left-7 top-14 w-px h-8 bg-gradient-to-b from-primary/30 to-transparent"
                      aria-hidden
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="h-12 px-10 text-base gap-2">
              <Link href="/sign-up">
                Get Started Now <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Security / Trust */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Shield className="w-4 h-4" />
            Your data is private & secure
          </div>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            All transcripts are stored in your personal Firebase account.
            Voice calls are processed via Vapi with end-to-end encryption.
            We never share your data.
          </p>
        </div>
      </section>

      {/*  Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <FaRobot className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold">Mock + AI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mock + AI. Built with Next.js, Gemini
            & Vapi.
          </p>
        </div>
      </footer>
    </div>
  );
}
