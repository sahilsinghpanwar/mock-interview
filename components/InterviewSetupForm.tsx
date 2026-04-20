"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { FIELD_CONFIGS, LEVEL_CONFIGS, TechnicalField, InterviewLevel } from "@/lib/types/interview";
import { createInterview } from "@/lib/interview.actions";
import { getQuestionCountForDifficulty } from "@/lib/interviewDifficulty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Search, X, ChevronDown, Sparkles } from "lucide-react";


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


  const searchMatchesPreset = filteredFields.length > 0;

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

  // Handlers

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

  // Handle Enter key to use custom field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFields.length === 1) {
        // If exactly one match, select it
        handleFieldSelect(filteredFields[0][0] as TechnicalField);
      } else if (fieldSearch.trim()) {
        // Otherwise use as custom
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

  // Derived display info

  const getEstimatedDuration = () => {
    if (!selectedLevel) return 0;
    return LEVEL_CONFIGS[selectedLevel].estimatedDuration;
  };

  const fieldInfo = selectedField ? FIELD_CONFIGS[selectedField] : null;
  const estimatedDuration = getEstimatedDuration();

  // The display label for the chosen field
  const displayFieldLabel = selectedField
    ? FIELD_CONFIGS[selectedField].label
    : customField;

  const displayFieldDescription = selectedField
    ? FIELD_CONFIGS[selectedField].description
    : "Custom field — Gemini will generate tailored questions";

  // Start Interview

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

  // Render

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Start Your Interview</h1>
          <p className="text-lg text-muted-foreground">
            Type any field or choose from suggestions, then pick your level
          </p>
        </div>

       
        <Card>
          <CardHeader>
            <CardTitle>1. Select Your Field</CardTitle>
            <CardDescription>
              Search from suggestions or type any role / technology — Gemini generates questions for anything
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative" ref={fieldDropdownRef}>
              {/* Search Input */}
              <div
                className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2.5 transition-all cursor-text ${
                  isFieldDropdownOpen
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                } ${hasField && !isFieldDropdownOpen ? "bg-primary/5" : "bg-card"}`}
                onClick={() => {
                  setIsFieldDropdownOpen(true);
                  fieldInputRef.current?.focus();
                }}
              >
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />

                {hasField && !isFieldDropdownOpen ? (
                  /* Selected state */
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {!selectedField && (
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {displayFieldLabel}
                      </span>
                      <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                        — {displayFieldDescription}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearField();
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-muted transition-colors shrink-0"
                      aria-label="Clear selection"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  /* Input state */
                  <input
                    ref={fieldInputRef}
                    type="text"
                    placeholder="Type any field... (e.g. Blockchain, Game Dev, React, Python)"
                    value={fieldSearch}
                    onChange={(e) => {
                      setFieldSearch(e.target.value);
                      setIsFieldDropdownOpen(true);
                      // Clear previous selections while typing
                      setSelectedField(null);
                      setCustomField("");
                    }}
                    onFocus={() => setIsFieldDropdownOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  />
                )}

                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                    isFieldDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown */}
              {isFieldDropdownOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-card border-2 border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {/* Custom field option — shown when user has typed something */}
                  {fieldSearch.trim() && (
                    <button
                      onClick={handleUseCustomField}
                      className="w-full text-left px-4 py-3 transition-colors border-b-2 border-border bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <h3 className="font-semibold text-sm">
                            Use &quot;{fieldSearch.trim()}&quot;
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Gemini will generate custom interview questions for this field
                          </p>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Preset suggestions */}
                  {filteredFields.length > 0 && (
                    <>
                      {fieldSearch.trim() && (
                        <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">
                          Suggestions
                        </div>
                      )}
                      {filteredFields.map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => handleFieldSelect(key as TechnicalField)}
                          className={`w-full text-left px-4 py-3 transition-colors border-b border-border/50 last:border-b-0 ${
                            selectedField === key
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{config.label}</h3>
                            {selectedField === key && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {config.technologies.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="px-1.5 py-0.5 bg-secondary/50 text-secondary-foreground rounded text-[10px]"
                              >
                                {tech}
                              </span>
                            ))}
                            {config.technologies.length > 4 && (
                              <span className="text-[10px] text-muted-foreground self-center">
                                +{config.technologies.length - 4} more
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Empty state — no presets match, but custom is available above */}
                  {filteredFields.length === 0 && !fieldSearch.trim() && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Start typing to search or enter a custom field
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Level Selection */}
        {hasField && (
          <Card>
            <CardHeader>
              <CardTitle>2. Select Your Level</CardTitle>
              <CardDescription>Choose the difficulty level that matches your experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {(["junior", "mid", "senior"] as InterviewLevel[]).map((level) => {
                  const levelConfig = LEVEL_CONFIGS[level];
                  return (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-6 rounded-lg border-2 transition-all text-left space-y-2 ${
                        selectedLevel === level
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border hover:border-primary/50 bg-card hover:bg-muted/50"
                      }`}
                    >
                      <h3 className="font-semibold capitalize text-lg">{level}</h3>
                      <p className="text-sm text-muted-foreground">{levelConfig.description}</p>
                      <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                        <p>📝 {levelConfig.questionsCount} questions</p>
                        <p>⏱️ ~{levelConfig.estimatedDuration} minutes</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/*  Step 3: Summary */}
        {hasField && selectedLevel && (
          <Card>
            <CardHeader>
              <CardTitle>3. Review &amp; Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Technical Field</p>
                    <p className="font-semibold flex items-center gap-1.5">
                      {!selectedField && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                      {displayFieldLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty Level</p>
                    <p className="font-semibold capitalize">{selectedLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">~{estimatedDuration} min</p>
                  </div>
                </div>
              </div>

              {/* Topics — only for preset fields */}
              {fieldInfo && (
                <div>
                  <p className="text-sm font-semibold mb-2">Topics You&apos;ll Be Asked About:</p>
                  <div className="flex flex-wrap gap-2">
                    {fieldInfo.commonQuestionPatterns.map((pattern) => (
                      <span
                        key={pattern}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies — only for preset fields */}
              {fieldInfo && (
                <div>
                  <p className="text-sm font-semibold mb-2">Technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {fieldInfo.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info for custom fields */}
              {!selectedField && customField && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Custom Field: {customField}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gemini AI will generate tailored interview questions specific to this field.
                      Topics and technologies will be inferred automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}

              {/* Start Button */}
              <Button
                onClick={handleStartInterview}
                disabled={isLoading}
                size="lg"
                className="w-full mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your interview...
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You can pause and resume your interview at any time
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
