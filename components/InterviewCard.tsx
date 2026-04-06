"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Briefcase,
  BarChart3,
  Hash,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InterviewCardProps {
  id: string;
  role: string;
  type: string;
  difficulty: string;
  numQuestions: number;
  status: "pending" | "in-progress" | "completed";
  createdAt?: string; // always plain string — never a Date object
  score?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  "pending" | "in-progress" | "completed",
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: "Not Started",
    icon: Circle,
    className: "text-muted-foreground bg-muted border-border",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    className: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  },
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Junior: "text-emerald-400",
  Mid: "text-amber-400",
  Senior: "text-rose-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InterviewCard({
  id,
  role,
  type,
  difficulty,
  numQuestions,
  status,
  createdAt,
  score,
}: InterviewCardProps) {
  // Safe fallback — prevents crash if status is undefined or unexpected value
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending"];
  const StatusIcon = statusCfg.icon;

  return (
    <Card className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card group">
      <CardContent className="pt-5 pb-3 space-y-4">

        {/* Role + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-sm truncate">{role}</h3>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border shrink-0",
              statusCfg.className
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {type}
          </Badge>
          <Badge
            variant="secondary"
            className={cn("text-xs font-semibold", DIFFICULTY_COLOR[difficulty])}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            {difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Hash className="w-3 h-3 mr-1" />
            {numQuestions} questions
          </Badge>
        </div>

        {/* Score bar — only when completed and score exists */}
        {status === "completed" && score !== undefined && score > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Score</span>
              <span className="font-semibold text-foreground">{score}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  score >= 75
                    ? "bg-emerald-400"
                    : score >= 50
                    ? "bg-amber-400"
                    : "bg-rose-400"
                )}
                style={{ width: `${Math.min(100, score)}%` }}
              />
            </div>
          </div>
        )}

        {/* Date */}
        {createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {createdAt}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <Button
          asChild
          variant={status === "completed" ? "outline" : "default"}
          size="sm"
          className="w-full gap-2 group-hover:gap-3 transition-all"
        >
          <Link href={`/interview/${id}`}>
            {status === "completed"
              ? "View Results"
              : status === "in-progress"
              ? "Continue"
              : "Start Interview"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}