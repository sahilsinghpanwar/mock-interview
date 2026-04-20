"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0–100
  size?: number;
  className?: string;
}

export default function ScoreGauge({
  score,
  size = 120,
  className,
}: ScoreGaugeProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ≈ 283
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? "stroke-emerald-400"
      : score >= 50
        ? "stroke-amber-400"
        : "stroke-rose-400";

  const textColor =
    score >= 75
      ? "text-emerald-400"
      : score >= 50
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        {/* Score arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={cn(color, "transition-all duration-1000 ease-out")}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            animation: "score-fill 1.2s ease-out",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-2xl font-bold tabular-nums", textColor)}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          / 100
        </span>
      </div>
    </div>
  );
}
