"use client";

import { useAuth } from "@/app/hooks/useAuth";
import LandingPage from "@/components/LandingPage";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      redirect("/dashboard");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return null; 

  return <LandingPage />;
}
