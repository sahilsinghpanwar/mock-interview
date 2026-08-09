"use client";

import { useState } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import type { Interview } from "@/lib/interview.actions";
import {
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Briefcase,
  BarChart3,
  Hash,
  MessageSquareText,
  Trophy,
  Target,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewFeedbackProps {
  interview: Interview;
}

function findQuestionStartIndex(content: string, questionText: string): number {
  const cleanContent = content.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleanContent) return -1;

  const words = questionText.trim().split(/\s+/);
  if (words.length === 0) return -1;

  const candidates: string[] = [];

  // 1. Full question
  candidates.push(questionText);

  // 2. Phrase of 5 words starting at word 0, 1, 2, 3
  for (let startWord = 0; startWord <= 3; startWord++) {
    if (words.length >= startWord + 5) {
      candidates.push(words.slice(startWord, startWord + 5).join(" "));
    }
  }

  // 3. Middle phrase of 5 words
  if (words.length > 8) {
    const mid = Math.floor(words.length / 2);
    candidates.push(words.slice(mid - 2, mid + 3).join(" "));
  }

  // Search for candidates
  for (const candidate of candidates) {
    const cleanCand = candidate.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanCand.length < 10) continue;

    const cleanMatchIdx = cleanContent.indexOf(cleanCand);
    if (cleanMatchIdx !== -1) {
      const originalMatchIdx = mapCleanIndexToOriginal(content, cleanMatchIdx);
      if (originalMatchIdx !== -1) {
        // Look backwards for sentence boundary (. ! ? or newline) to align the split
        let boundaryIdx = -1;
        for (let j = originalMatchIdx - 1; j >= 0; j--) {
          const char = content[j];
          if (char === "." || char === "!" || char === "?" || char === "\n") {
            boundaryIdx = j;
            break;
          }
        }
        return boundaryIdx !== -1 ? boundaryIdx + 1 : 0;
      }
    }
  }

  return -1;
}

function mapCleanIndexToOriginal(originalStr: string, cleanIdx: number): number {
  let cleanCounter = 0;
  for (let i = 0; i < originalStr.length; i++) {
    const char = originalStr[i].toLowerCase();
    if (/[a-z0-9]/.test(char)) {
      if (cleanCounter === cleanIdx) {
        return i;
      }
      cleanCounter++;
    }
  }
  return -1;
}

interface SplitBlock {
  prefix: string;
  content: string;
}

function splitInterviewerBlock(
  content: string,
  questions: { id: string; text: string }[]
): SplitBlock[] {
  interface MatchInfo {
    qNum: number;
    start: number;
  }

  const matches: MatchInfo[] = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const startIdx = findQuestionStartIndex(content, q.text);
    if (startIdx !== -1) {
      matches.push({
        qNum: i + 1,
        start: startIdx,
      });
    }
  }

  if (matches.length === 0) {
    return [{ prefix: "Interviewer", content }];
  }

  // Sort matches by start index ascending
  matches.sort((a, b) => a.start - b.start);

  const result: SplitBlock[] = [];
  let lastIdx = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.start < lastIdx) {
      continue;
    }

    const textBefore = content.slice(lastIdx, match.start).trim();
    if (textBefore) {
      result.push({ prefix: "Interviewer", content: textBefore });
    }

    const nextStart = i + 1 < matches.length ? matches[i + 1].start : content.length;
    const questionText = content.slice(match.start, nextStart).trim();

    result.push({ prefix: `Q${match.qNum} — Interviewer`, content: questionText });
    lastIdx = nextStart;
  }

  return result;
}

function getScoreLabel(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Outstanding", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 75) return { text: "Great Job", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { text: "Good Effort", color: "text-amber-600 dark:text-amber-400" };
  if (score >= 40) return { text: "Needs Work", color: "text-orange-600 dark:text-orange-400" };
  return { text: "Keep Practicing", color: "text-rose-600 dark:text-rose-400" };
}

export default function InterviewFeedback({ interview }: InterviewFeedbackProps) {
  const [showTranscript, setShowTranscript] = useState(false);
  const score = interview.score ?? 0;
  const label = getScoreLabel(score);

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-8 flex flex-col items-center justify-center text-center animate-fade-in">
        {/* Blueprint Grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />

        {/* Diagonal Blueprint Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background:
              score >= 75
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : score >= 50
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Score gauge */}
          <ScoreGauge score={score} size={140} />

          {/* Label */}
          <p className={cn("text-xl font-black mt-4 uppercase tracking-widest", label.color)}>
            {label.text}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Briefcase className="w-3.5 h-3.5 text-violet-650 dark:text-violet-400" />
              {interview.role}
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
              {interview.type}
            </span>
            <span className={cn("text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 uppercase tracking-wide", 
              interview.difficulty === "Junior" && "text-emerald-650 dark:text-emerald-400",
              interview.difficulty === "Mid" && "text-amber-650 dark:text-amber-400",
              interview.difficulty === "Senior" && "text-rose-650 dark:text-rose-400"
            )}>
              <BarChart3 className="w-3.5 h-3.5" />
              {interview.difficulty}
            </span>
            <span className="text-[10px] font-bold px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Hash className="w-3.5 h-3.5 text-neutral-500" />
              {interview.questions.length} Qs
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
        
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Sparkles className="w-4 h-4 text-violet-650 dark:text-violet-400" />
          <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Overall Performance Summary</h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light relative z-10">
          {interview.feedbackSummary}
        </p>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 dark:opacity-10" />
          
          <div className="flex items-center gap-2 mb-4 relative z-10 text-emerald-650 dark:text-emerald-400">
            <Trophy className="w-4 h-4" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Strengths Detected</h2>
          </div>
          <div className="relative z-10">
            {interview.strengths && interview.strengths.length > 0 ? (
              <ul className="space-y-3">
                {interview.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded bg-emerald-500 dark:bg-emerald-400" />
                    <span className="text-xs leading-relaxed font-light text-neutral-700 dark:text-neutral-300">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light italic">No specific strengths captured.</p>
            )}
          </div>
        </div>

        {/* Improvements */}
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-amber-500/20 bg-amber-500/5 p-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 dark:opacity-10" />
          
          <div className="flex items-center gap-2 mb-4 relative z-10 text-amber-655 dark:text-amber-400">
            <Target className="w-4 h-4" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">Telemetry Adjustments</h2>
          </div>
          <div className="relative z-10">
            {interview.improvements && interview.improvements.length > 0 ? (
              <ul className="space-y-3">
                {interview.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded bg-amber-555 dark:bg-amber-400" />
                    <span className="text-xs leading-relaxed font-light text-neutral-700 dark:text-neutral-300">{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-light italic">No improvement items compiled.</p>
            )}
          </div>
        </div>
      </div>

      {/* Question & Answer Breakdown */}
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "350ms" }}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
        
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <BookOpen className="w-4 h-4 text-violet-650 dark:text-violet-400" />
          <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Question &amp; Candidate Answer Breakdown</h2>
        </div>

        <div className="space-y-4 relative z-10">
          {interview.questions.map((q, idx) => {
            const analysis = interview.questionAnalysis?.[idx];
            const answer = q.userAnswer || analysis?.userAnswer || "No answer recorded.";
            const rating = q.rating || analysis?.rating || (answer.length > 25 ? "Good" : "Needs Improvement");
            const qFeedback = q.feedback || analysis?.feedback || "";

            const isExcellent = rating.toLowerCase().includes("excellent") || rating.toLowerCase().includes("great");
            const isGood = rating.toLowerCase().includes("good");
            const isUnanswered = rating.toLowerCase().includes("unanswered") || answer === "No answer recorded.";

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black p-5 space-y-3"
              >
                {/* Question Header & Rating Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded bg-violet-500/10 text-violet-650 dark:text-violet-400 uppercase tracking-widest shrink-0">
                      Q{idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white leading-snug">
                      {q.text}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-dashed shrink-0 uppercase tracking-wider flex items-center gap-1",
                      isExcellent
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
                        : isGood
                        ? "text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 border-cyan-500/20"
                        : isUnanswered
                        ? "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/20"
                        : "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/20"
                    )}
                  >
                    {isExcellent || isGood ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {rating}
                  </span>
                </div>

                {/* Candidate Spoken Answer */}
                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/40 p-3.5 border border-dashed border-neutral-200 dark:border-neutral-850 space-y-1">
                  <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">
                    Candidate Answer (Stored in Firebase)
                  </p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-light whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>

                {/* Per-Question Coaching Feedback */}
                {qFeedback && (
                  <div className="flex items-start gap-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                    <span><strong className="font-semibold text-neutral-800 dark:text-neutral-200">Feedback:</strong> {qFeedback}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Feedback */}
      {interview.feedbackDetail && (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
          
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <TrendingUp className="w-4 h-4 text-violet-650 dark:text-violet-400" />
            <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Detailed Analysis Report</h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light whitespace-pre-line relative z-10">
            {interview.feedbackDetail}
          </p>
        </div>
      )}

      {/* Transcript (Collapsible) */}
      {interview.transcriptSummary && (
        <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "450ms" }}>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
          
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between text-left relative z-10"
          >
            <div className="flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-violet-655 dark:text-violet-400" />
              <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Interview Transcript</h2>
            </div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-neutral-500 dark:text-neutral-400">
              {showTranscript ? "Hide" : "Show"}
              {showTranscript ? (
                <ChevronUp className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              )}
            </div>
          </button>
          
          {showTranscript && (
            <div className="pt-5 relative z-10">
              <div className="rounded-2xl bg-white dark:bg-black border border-dashed border-neutral-200 dark:border-neutral-855 p-4.5 max-h-[380px] overflow-y-auto space-y-3.5">
                {(() => {
                  const lines = interview.transcriptSummary.split("\n");
                  const groupedBlocks: SplitBlock[] = [];
                  
                  let currentPrefix: "Interviewer" | "You" | "System" | null = null;
                  let currentText = "";

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    const isInterviewer = trimmed.startsWith("Interviewer:") || trimmed.startsWith("Interviewer: ") || /^Q\d+:/.test(trimmed);
                    const isCandidate = trimmed.startsWith("Candidate:") || trimmed.startsWith("Candidate: ") || trimmed.startsWith("You:") || trimmed.startsWith("You: ") || /^A\d+:/.test(trimmed);

                    let prefix: "Interviewer" | "You" | "System" = "System";
                    let content = trimmed;

                    if (isInterviewer) {
                      prefix = "Interviewer";
                      content = trimmed.replace(/^(Interviewer:\s*|Q\d+:\s*)/i, "").trim();
                    } else if (isCandidate) {
                      prefix = "You";
                      content = trimmed.replace(/^(Candidate:\s*|You:\s*|A\d+:\s*)/i, "").trim();
                    }

                    if (prefix === currentPrefix) {
                      currentText += " " + content;
                    } else {
                      if (currentPrefix && currentText) {
                        groupedBlocks.push({ prefix: currentPrefix, content: currentText.trim() });
                      }
                      currentPrefix = prefix;
                      currentText = content;
                    }
                  }

                  if (currentPrefix && currentText) {
                    groupedBlocks.push({ prefix: currentPrefix, content: currentText.trim() });
                  }

                  const finalBlocks: SplitBlock[] = [];
                  for (const block of groupedBlocks) {
                    if (block.prefix === "Interviewer") {
                      const splits = splitInterviewerBlock(block.content, interview.questions);
                      finalBlocks.push(...splits);
                    } else {
                      finalBlocks.push(block);
                    }
                  }

                  return finalBlocks.map((block, i) => {
                    const isQuestion = block.prefix.startsWith("Q");
                    const isInterviewer = block.prefix === "Interviewer";
                    const isYou = block.prefix === "You";

                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "pl-4 py-3 rounded-xl border-l-2 relative z-10 transition-all",
                          isQuestion
                            ? "border-violet-500 bg-violet-500/10 dark:bg-violet-500/10 text-neutral-900 dark:text-white font-semibold"
                            : isInterviewer
                              ? "border-neutral-300 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-300 font-light"
                              : isYou
                                ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/5 text-neutral-800 dark:text-neutral-200"
                                : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 text-neutral-600 dark:text-neutral-400"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              isQuestion
                                ? "text-violet-650 dark:text-violet-400"
                                : isInterviewer
                                  ? "text-neutral-500 dark:text-neutral-400"
                                  : isYou
                                    ? "text-cyan-600 dark:text-cyan-400"
                                    : "text-neutral-500 dark:text-neutral-400"
                            )}
                          >
                            {block.prefix}
                          </span>
                        </div>
                        <p className={cn(
                          "text-xs sm:text-sm leading-relaxed whitespace-pre-line",
                          isQuestion 
                            ? "text-neutral-900 dark:text-white font-semibold" 
                            : isYou 
                              ? "text-neutral-800 dark:text-neutral-200 font-normal"
                              : "text-neutral-700 dark:text-neutral-300 font-light"
                        )}>
                          {block.content}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
