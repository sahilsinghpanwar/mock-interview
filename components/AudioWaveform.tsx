"use client";

import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  active: boolean;
  className?: string;
  barCount?: number;
}

export default function AudioWaveform({
  active,
  className,
  barCount = 5,
}: AudioWaveformProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-[3px]", className)}
      role="status"
      aria-label={active ? "Voice call active" : "Voice call inactive"}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block w-[3px] rounded-full origin-bottom transition-all",
            active
              ? "bg-gradient-to-t from-violet-500 to-cyan-400"
              : "bg-muted-foreground/30",
            active ? "h-5" : "h-2"
          )}
          style={{
            animation: active
              ? `pulse-bar 1.2s ease-in-out ${i * 0.15}s infinite`
              : "none",
          }}
        />
      ))}
    </div>
  );
}
