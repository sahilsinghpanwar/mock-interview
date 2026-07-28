"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FIELD_CONFIGS, LEVEL_CONFIGS, TechnicalField, InterviewLevel } from "@/lib/types/interview";
import { createInterview } from "@/lib/interview.actions";
import { getQuestionCountForDifficulty } from "@/lib/interviewDifficulty";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Search, X, ChevronDown, Sparkles, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewSetupProps {
  onSessionCreated?: (sessionId: string) => void;
}

function levelToDifficulty(level: InterviewLevel): string {
  switch (level) {
    case "junior":
      return "Junior";
    case "mid":
      return "Mid";
    case "senior":
      return "Senior";
  }
}

export default function InterviewSetupForm({ onSessionCreated }: InterviewSetupProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedField, setSelectedField] = useState<TechnicalField | null>(null);
  const [customField, setCustomField] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fieldSearch, setFieldSearch] = useState("");
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const fieldDropdownRef = useRef<HTMLDivElement>(null);
  const fieldInputRef = useRef<HTMLInputElement>(null);

  const hasField = selectedField !== null || customField.trim().length > 0;

  const resolvedRole = selectedField
    ? FIELD_CONFIGS[selectedField].label
    : customField.trim();

  const resolvedFocusArea = selectedField
    ? FIELD_CONFIGS[selectedField].commonQuestionPatterns[0] ?? "General"
    : "General";

  const filteredFields = Object.entries(FIELD_CONFIGS).filter(([, config]) => {
    if (!fieldSearch) return true;
    const q = fieldSearch.toLowerCase();
    return (
      config.label.toLowerCase().includes(q) ||
      config.description.toLowerCase().includes(q) ||
      config.technologies.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(e.target as Node)) {
      setIsFieldDropdownOpen(false);
      if (!selectedField && fieldSearch.trim()) {
        setCustomField(fieldSearch.trim());
        setFieldSearch("");
      }
    }
  }, [selectedField, fieldSearch]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleFieldSelect = (key: TechnicalField) => {
    setSelectedField(key);
    setCustomField("");
    setFieldSearch("");
    setIsFieldDropdownOpen(false);
  };

  const handleUseCustomField = () => {
    if (!fieldSearch.trim()) return;
    setSelectedField(null);
    setCustomField(fieldSearch.trim());
    setFieldSearch("");
    setIsFieldDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFields.length === 1) {
        handleFieldSelect(filteredFields[0][0] as TechnicalField);
      } else if (fieldSearch.trim()) {
        handleUseCustomField();
      }
    }
    if (e.key === "Escape") {
      setIsFieldDropdownOpen(false);
    }
  };

  const handleClearField = () => {
    setSelectedField(null);
    setCustomField("");
    setSelectedLevel(null);
    setFieldSearch("");
    setTimeout(() => fieldInputRef.current?.focus(), 0);
  };

  const getEstimatedDuration = () => {
    if (!selectedLevel) return 0;
    return LEVEL_CONFIGS[selectedLevel].estimatedDuration;
  };

  const fieldInfo = selectedField ? FIELD_CONFIGS[selectedField] : null;
  const estimatedDuration = getEstimatedDuration();

  const displayFieldLabel = selectedField
    ? FIELD_CONFIGS[selectedField].label
    : customField;

  const displayFieldDescription = selectedField
    ? FIELD_CONFIGS[selectedField].description
    : "Custom discipline — Gemini AI will generate tailored questions";

  const handleStartInterview = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!hasField || !selectedLevel || !user) {
        setError("Please select or type a field, and choose a level to continue");
        return;
      }

      setIsLoading(true);

      const difficulty = levelToDifficulty(selectedLevel);
      const numQuestions = getQuestionCountForDifficulty(difficulty);

      const result = await createInterview(
        user.uid,
        resolvedRole,
        "Technical",
        difficulty,
        numQuestions,
        resolvedFocusArea
      );

      if (!result.success || !result.interviewId) {
        throw new Error(result.message);
      }

      setSuccess(`✓ Interview session created with ${numQuestions} questions!`);

      setTimeout(() => {
        if (onSessionCreated) {
          onSessionCreated(result.interviewId!);
        }
        router.push(`/interview/${result.interviewId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 py-12 px-6 overflow-x-hidden relative">
      {/* Blueprint Grid pattern in background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <div className="border-b border-dashed border-neutral-200 dark:border-neutral-900 pb-8 space-y-1.5 text-center sm:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-650 dark:text-violet-400">Session Configurator</span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Configure Your AI Interview
          </h1>
          <p className="text-xs sm:text-sm text-neutral-605 dark:text-neutral-400 leading-relaxed font-light">
            Search from common tech stacks or enter a custom role — Mock.ai constructs personalized telemetry questions.
          </p>
        </div>

        {/* Step 1: Select Field */}
        <div className="relative rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
          
          <div className="space-y-4 relative z-10">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-violet-655 dark:text-violet-400 block mb-1">Step 1 of 3</span>
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Select your tech sector</h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                Type any custom discipline or pick from the dynamic preset array.
              </p>
            </div>

            <div className="relative" ref={fieldDropdownRef}>
              {/* Search Bar */}
              <div
                className={cn(
                  "flex items-center gap-2.5 border border-dashed rounded-xl px-4 py-3 transition-all cursor-text",
                  isFieldDropdownOpen
                    ? "border-violet-500 bg-white dark:bg-black"
                    : "border-neutral-200 dark:border-neutral-850 bg-neutral-100/40 dark:bg-neutral-900/10 hover:border-neutral-400 dark:hover:border-neutral-750",
                  hasField && !isFieldDropdownOpen && "bg-neutral-100/20 dark:bg-neutral-900/20"
                )}
                onClick={() => {
                  setIsFieldDropdownOpen(true);
                  fieldInputRef.current?.focus();
                }}
              >
                <Search className="h-4 w-4 text-neutral-500 shrink-0" />

                {hasField && !isFieldDropdownOpen ? (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {!selectedField && (
                        <Sparkles className="h-3.5 w-3.5 text-violet-650 dark:text-violet-400 shrink-0" />
                      )}
                      <span className="font-extrabold text-xs text-neutral-900 dark:text-white truncate uppercase tracking-wider">
                        {displayFieldLabel}
                      </span>
                      <span className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate hidden sm:inline font-light">
                        — {displayFieldDescription}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearField();
                      }}
                      className="ml-2 p-1 rounded-lg hover:bg-neutral-105 dark:hover:bg-neutral-900 transition-colors shrink-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      aria-label="Clear selection"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <input
                    ref={fieldInputRef}
                    type="text"
                    placeholder="Search or enter stack... (e.g. Blockchain, Python, UI Designer)"
                    value={fieldSearch}
                    onChange={(e) => {
                      setFieldSearch(e.target.value);
                      setIsFieldDropdownOpen(true);
                      setSelectedField(null);
                      setCustomField("");
                    }}
                    onFocus={() => setIsFieldDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                  />
                )}

                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-neutral-500 shrink-0 transition-transform",
                    isFieldDropdownOpen && "rotate-180"
                  )}
                />
              </div>

              {/* Dropdown Menu */}
              {isFieldDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-950 border border-dashed border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl max-h-72 overflow-y-auto">
                  {fieldSearch.trim() && (
                    <button
                      onClick={handleUseCustomField}
                      className="w-full text-left px-4 py-3 transition-colors border-b border-dashed border-neutral-200 dark:border-neutral-900 bg-neutral-100/20 dark:bg-neutral-900/10 hover:bg-neutral-100/40 dark:hover:bg-neutral-900/40"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="h-4 w-4 text-violet-650 dark:text-violet-400 shrink-0" />
                        <div>
                          <h3 className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">
                            Use &quot;{fieldSearch.trim()}&quot;
                          </h3>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                            Gemini AI will synthesize custom telemetry questions specifically tailored for this.
                          </p>
                        </div>
                      </div>
                    </button>
                  )}

                  {filteredFields.length > 0 && (
                    <>
                      {fieldSearch.trim() && (
                        <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-violet-650 dark:text-violet-400 font-bold bg-neutral-50/60 dark:bg-neutral-900/20 border-b border-dashed border-neutral-200 dark:border-neutral-900">
                          Matching Presets
                        </div>
                      )}
                      {filteredFields.map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => handleFieldSelect(key as TechnicalField)}
                          className={cn(
                            "w-full text-left px-4 py-3.5 transition-colors border-b border-dashed border-neutral-200 dark:border-neutral-900 last:border-b-0",
                            selectedField === key
                              ? "bg-neutral-100/60 dark:bg-neutral-900/40 text-neutral-900 dark:text-white"
                              : "hover:bg-neutral-50/40 dark:hover:bg-neutral-900/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider">{config.label}</h3>
                            {selectedField === key && (
                              <CheckCircle2 className="h-4 w-4 text-violet-655 dark:text-violet-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-light mt-1">{config.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {config.technologies.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[9px] font-bold uppercase tracking-wide"
                              >
                                {tech}
                              </span>
                            ))}
                            {config.technologies.length > 4 && (
                              <span className="text-[9px] text-neutral-500 self-center font-bold pl-1">
                                +{config.technologies.length - 4} MORE
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {filteredFields.length === 0 && !fieldSearch.trim() && (
                    <div className="px-4 py-6 text-center text-xs text-neutral-500 font-light italic">
                      Start typing to filter presets or define custom stack
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Level Selection */}
        {hasField && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
            
            <div className="space-y-5 relative z-10">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-655 dark:text-violet-400 block mb-1">Step 2 of 3</span>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Select Experience Grade</h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  Pick the targeting challenge range suitable for your goals.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {(["junior", "mid", "senior"] as InterviewLevel[]).map((level) => {
                  const levelConfig = LEVEL_CONFIGS[level];
                  const isSelected = selectedLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={cn(
                        "p-5 rounded-2xl border border-dashed text-left space-y-2.5 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01]",
                        isSelected
                          ? "border-violet-500 bg-violet-550/5 shadow-md shadow-violet-550/5"
                          : "border-neutral-200 dark:border-neutral-850 bg-neutral-100/40 dark:bg-neutral-900/10 hover:border-neutral-400 dark:hover:border-neutral-750"
                      )}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808002_1px,transparent_1px),linear-gradient(to_bottom,#80808002_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
                      <h3 className="font-extrabold capitalize text-sm text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors uppercase tracking-wider">{level}</h3>
                      <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">{levelConfig.description}</p>
                      <div className="pt-2.5 space-y-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-t border-dashed border-neutral-200 dark:border-neutral-900 group-hover:border-neutral-300 dark:group-hover:border-neutral-800 transition-colors">
                        <p>📝 {levelConfig.questionsCount} questions</p>
                        <p>⏱️ ~{levelConfig.estimatedDuration} minutes</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Start */}
        {hasField && selectedLevel && (
          <div className="relative overflow-hidden rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40 backdrop-blur-md p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] opacity-35 dark:opacity-20" />
            
            <div className="space-y-6 relative z-10">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-violet-655 dark:text-violet-400 block mb-1">Step 3 of 3</span>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Review &amp; Initiate</h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light mt-0.5">
                  Confirm telemetry setup settings before activating voice transceiver.
                </p>
              </div>

              {/* Review Panel */}
              <div className="border border-dashed border-neutral-200 dark:border-neutral-900 bg-neutral-100/40 dark:bg-neutral-900/10 rounded-2xl p-4.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Tech Discipline</p>
                    <p className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mt-1 flex items-center gap-1.5 truncate">
                      {!selectedField && <Sparkles className="h-3.5 w-3.5 text-violet-650 dark:text-violet-400 shrink-0" />}
                      {displayFieldLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Experience Grade</p>
                    <p className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mt-1 capitalize">{selectedLevel}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Estimated duration</p>
                    <p className="font-extrabold text-xs text-neutral-900 dark:text-white uppercase tracking-wider mt-1">~{estimatedDuration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Preset Topics details */}
              {fieldInfo && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Focus Question Patterns:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fieldInfo.commonQuestionPatterns.map((pattern) => (
                      <span
                        key={pattern}
                        className="px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 rounded text-[9px] font-bold uppercase tracking-wide"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies presets */}
              {fieldInfo && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Targeted Technologies:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fieldInfo.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-violet-650 dark:text-violet-400 rounded text-[9px] font-bold uppercase tracking-wide"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom stack notification */}
              {!selectedField && customField && (
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-100/20 dark:bg-neutral-900/20 border border-dashed border-neutral-200 dark:border-neutral-850">
                  <Sparkles className="h-4.5 w-4.5 text-violet-650 dark:text-violet-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-xs font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">Custom Stack Synthesis Active</p>
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-light mt-1 leading-relaxed">
                      Mock.ai&apos;s Gemini AI engine will map, infer, and synthesize custom technical topics and behavioral patterns for the customized stack &quot;{customField}&quot; on-demand.
                    </p>
                  </div>
                </div>
              )}

              {/* Errors/Success Notifications */}
              {error && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-500/5 border border-dashed border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-emerald-500/5 border border-dashed border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <p className="text-xs font-extrabold uppercase tracking-wider">{success}</p>
                </div>
              )}

              {/* Initiate Trigger Button */}
              <Button
                onClick={handleStartInterview}
                disabled={isLoading}
                size="lg"
                className="w-full h-11 bg-neutral-950 hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black font-extrabold rounded-2xl text-xs hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all duration-300 relative z-10 border border-neutral-900 dark:border-neutral-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synthesizing interview parameters...
                  </>
                ) : (
                  "Initiate AI Technical Interview"
                )}
              </Button>

              <p className="text-[9px] text-center text-neutral-500 font-bold uppercase tracking-wider">
                Telemetry checkpoint: Session state is autosaved locally
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
