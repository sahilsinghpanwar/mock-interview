"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaRobot, FaGoogle, FaGithub } from "react-icons/fa";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { signIn, signUp, signInWithGoogle, signInWithGithub } from "@/lib/auth.actions";
import {
  signInSchema,
  signUpSchema,
  SignInFormValues,
  SignUpFormValues,
} from "@/lib/validations";

//  Types

type AuthFormType = "sign-in" | "sign-up";

interface AuthFormProps {
  type: AuthFormType;
}

//  Password Input

function PasswordInput({
  id,
  placeholder,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  placeholder?: string;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className={cn("pr-10", error && "border-destructive focus-visible:ring-destructive")}
        autoComplete={id === "confirmPassword" ? "new-password" : id === "password" && props.autoComplete ? props.autoComplete : "current-password"}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

//  Form Field

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(error && "text-destructive")}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

//  Password Strength

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ characters", pass: password.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-destructive", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < score ? colors[score] : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn(
              "text-xs flex items-center gap-1 transition-colors",
              c.pass ? "text-green-500" : "text-muted-foreground"
            )}
          >
            <CheckCircle2 className="h-3 w-3" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

//  Main Component

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const isSignIn = type === "sign-in";

  const [serverMessage, setServerMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  //  Sign-In Form 

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  // Sign-Up Form

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control: signUpForm.control, name: "password" });

  // Handlers

  async function handleSignIn(data: SignInFormValues) {
    setServerMessage(null);
    const result = await signIn(data.email, data.password);
    if (result.success) {
      setServerMessage({ type: "success", text: result.message });
      router.push("/dashboard");
      router.refresh();
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  }

  async function handleSignUp(data: SignUpFormValues) {
    setServerMessage(null);
    const result = await signUp(data.name, data.email, data.password);
    if (result.success) {
      setServerMessage({ type: "success", text: result.message });
      router.push("/dashboard");
      router.refresh();
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  }

  async function handleGoogleSignIn() {
    setServerMessage(null);
    setOauthLoading("google");
    const result = await signInWithGoogle();
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
    setOauthLoading(null);
  }

  async function handleGithubSignIn() {
    setServerMessage(null);
    setOauthLoading("github");
    const result = await signInWithGithub();
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
    setOauthLoading(null);
  }

  const isLoading = isSignIn
    ? signInForm.formState.isSubmitting
    : signUpForm.formState.isSubmitting;


  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm bg-card/95">
      {/* Header */}
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
            <FaRobot className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Mock + AI
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              AI-Powered Interview Prep
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {isSignIn ? "Welcome back" : "Create your account"}
          </h2>
          <CardDescription className="mt-1">
            {isSignIn
              ? "Sign in to continue your interview practice"
              : "Start your AI-powered interview journey today"}
          </CardDescription>
        </div>
      </CardHeader>

      {/* Server feedback */}
      {serverMessage && (
        <div className="px-6 pb-2">
          <Alert
            variant={serverMessage.type === "error" ? "destructive" : "default"}
            className={
              serverMessage.type === "success"
                ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                : ""
            }
          >
            {serverMessage.type === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <AlertDescription>{serverMessage.text}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Form */}
      <CardContent className="pb-4">
        {isSignIn ? (
          /* ── Sign-In ── */
          <form
            onSubmit={signInForm.handleSubmit(handleSignIn)}
            className="space-y-4"
            noValidate
          >
            <FormField
              id="email"
              label="Email address"
              error={signInForm.formState.errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={cn(
                  signInForm.formState.errors.email &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                {...signInForm.register("email")}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={signInForm.formState.errors.password?.message}
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={!!signInForm.formState.errors.password}
                {...signInForm.register("password")}
              />
            </FormField>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        ) : (
          /* ── Sign-Up ── */
          <form
            onSubmit={signUpForm.handleSubmit(handleSignUp)}
            className="space-y-4"
            noValidate
          >
            <FormField
              id="name"
              label="Full name"
              error={signUpForm.formState.errors.name?.message}
            >
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                className={cn(
                  signUpForm.formState.errors.name &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                {...signUpForm.register("name")}
              />
            </FormField>

            <FormField
              id="email"
              label="Email address"
              error={signUpForm.formState.errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={cn(
                  signUpForm.formState.errors.email &&
                    "border-destructive focus-visible:ring-destructive"
                )}
                {...signUpForm.register("email")}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={signUpForm.formState.errors.password?.message}
            >
              <PasswordInput
                id="password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={!!signUpForm.formState.errors.password}
                {...signUpForm.register("password")}
              />
              <PasswordStrength password={passwordValue} />
            </FormField>

            <FormField
              id="confirmPassword"
              label="Confirm password"
              error={signUpForm.formState.errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                error={!!signUpForm.formState.errors.confirmPassword}
                {...signUpForm.register("confirmPassword")}
              />
            </FormField>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        )}
      </CardContent>

      {/* OAuth + Footer */}
      <CardFooter className="flex-col gap-4 pt-2">
        <div className="relative w-full">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading || oauthLoading !== null}
            className="gap-2"
          >
            {oauthLoading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGoogle className="h-4 w-4" />
            )}
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={isLoading || oauthLoading !== null}
            className="gap-2"
          >
            {oauthLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="h-4 w-4" />
            )}
            GitHub
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {isSignIn ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}