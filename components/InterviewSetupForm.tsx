"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { FIELD_CONFIGS, LEVEL_CONFIGS, TechnicalField, InterviewLevel } from "@/lib/types/interview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Interview Setup Component
 * 
 * Allows users to:
 * 1. Select their technical field
 * 2. Choose interview difficulty level
 * 3. Review estimated duration
 * 4. Start the interview session
 */
interface InterviewSetupProps {
  onSessionCreated?: (sessionId: string) => void;
}

export default function InterviewSetupForm({ onSessionCreated }: InterviewSetupProps) {
  const router = useRouter();
  const { user } = useAuth();

  // State Management
  const [selectedField, setSelectedField] = useState<TechnicalField | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InterviewLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get estimated duration
  const getEstimatedDuration = () => {
    if (!selectedLevel) return 0;
    const levelConfig = LEVEL_CONFIGS[selectedLevel];
    return levelConfig.estimatedDuration;
  };

  // Get selected field info
  const getFieldInfo = () => {
    if (!selectedField) return null;
    return FIELD_CONFIGS[selectedField];
  };

  // Handle start interview
  const handleStartInterview = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validation
      if (!selectedField || !selectedLevel || !user) {
        setError("Please select both field and level to continue");
        return;
      }

      setIsLoading(true);

      // Create interview session
      const response = await fetch("/api/interview/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          field: selectedField,
          level: selectedLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create interview session");
      }

      const data = await response.json();
      setSuccess(`✓ Interview session created with ${data.questionsCount} questions!`);

      // Redirect to interview session
      setTimeout(() => {
        if (onSessionCreated) {
          onSessionCreated(data.sessionId);
        }
        router.push(`/interview/${data.sessionId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const fieldInfo = getFieldInfo();
  const estimatedDuration = getEstimatedDuration();

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-muted/50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Start Your Interview</h1>
          <p className="text-lg text-muted-foreground">
            Select your field and difficulty level to begin
          </p>
        </div>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Your Field</CardTitle>
            <CardDescription>Choose the technical area you want to practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(FIELD_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedField(key as TechnicalField)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedField === key
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50 bg-card hover:bg-muted/50"
                  }`}
                >
                  <h3 className="font-semibold text-sm mb-1">{config.label}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Level Selection */}
        {selectedField && (
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

        {/* Summary */}
        {selectedField && selectedLevel && (
          <Card>
            <CardHeader>
              <CardTitle>3. Review & Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Technical Field</p>
                    <p className="font-semibold">{fieldInfo?.label}</p>
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

              {/* Topics */}
              <div>
                <p className="text-sm font-semibold mb-2">Topics You&apos;ll Be Asked About:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldInfo?.commonQuestionPatterns.map((pattern) => (
                    <span
                      key={pattern}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <p className="text-sm font-semibold mb-2">Technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {fieldInfo?.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

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
