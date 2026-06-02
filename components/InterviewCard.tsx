"use client";

import Link from "next/link";
import {
  Briefcase,
  BarChart3,
  Hash,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface InterviewCardProps {
  id: string;
  role: string;
  type: string;
  difficulty: string;
  numQuestions: number;
  status: "pending" | "in-progress" | "completed";
  createdAt?: string;
  score?: number;
  onDelete?: () => void;
}

// Config
const STATUS_CONFIG: Record<
  "pending" | "in-progress" | "completed",
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: "Not Started",
    icon: Circle,
    className: "text-neutral-500 dark:text-neutral-400 bg-neutral-100/60 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/10 border-amber-500/20 dark:border-amber-400/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-400/10 border-emerald-500/20 dark:border-emerald-400/30",
  },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Junior: "text-emerald-650 dark:text-emerald-400",
  Mid: "text-amber-650 dark:text-amber-400",
  Senior: "text-rose-650 dark:text-rose-400",
};

// Component
export default function InterviewCard({
  id,
  role,
  type,
  difficulty,
  numQuestions,
  status,
  createdAt,
  score,
  onDelete,
}: InterviewCardProps) {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending"];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 transition-all duration-300 group min-h-[220px]">
      {/* Blueprint Grid pattern in card background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />

      <div className="space-y-4 relative z-10 flex-1">
        {/* Role + status header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-violet-650 dark:text-violet-400" />
            </div>
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">{role}</h3>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-dashed shrink-0 uppercase tracking-wider",
              statusCfg.className
            )}
          >
            <StatusIcon className="w-2.5 h-2.5" />
            {statusCfg.label}
          </span>
        </div>

        {/* Technical Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            {type}
          </span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-1 uppercase tracking-wide", DIFFICULTY_COLOR[difficulty])}>
            <BarChart3 className="w-3 h-3" />
            {difficulty}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-550 dark:text-neutral-400 flex items-center gap-1 uppercase tracking-wide">
            <Hash className="w-3 h-3 text-neutral-400 dark:text-neutral-550" />
            {numQuestions} Qs
          </span>
        </div>

        {/* Score gauge bar */}
        {status === "completed" && score !== undefined && score > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <span>Performance Grade</span>
              <span className="font-black text-neutral-900 dark:text-white">{score}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  score >= 75
                    ? "bg-emerald-500"
                    : score >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500"
                )}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
          </div>
        )}

        {/* Calendar Timestamp */}
        {createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-light pt-1">
            <Calendar className="w-3 h-3 text-neutral-400 dark:text-neutral-550" />
            {createdAt}
          </div>
        )}
      </div>

      {/* Button action footer */}
      <div className="pt-4 mt-4 border-t border-dashed border-neutral-200 dark:border-neutral-900 relative z-10 flex gap-2">
        <Link 
          href={`/interview/${id}`}
          className={cn(
            "flex-1 h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-all border",
            status === "completed"
              ? "border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
              : "bg-neutral-950 dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-neutral-100 border-neutral-900 dark:border-neutral-200"
          )}
        >
          {status === "completed"
            ? "View Analytics Feedback"
            : status === "in-progress"
            ? "Resume Practice"
            : "Start AI Interview"}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="w-9 h-9 rounded-xl border border-dashed border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 flex items-center justify-center transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            title="Delete Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}