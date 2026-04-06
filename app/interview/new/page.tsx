import InterviewSetupForm from "@/components/InterviewSetupForm";
import AuthGuard from "@/components/AuthGuard";

export default function NewInterviewPage() {
  return (
    <AuthGuard>
      <InterviewSetupForm />
    </AuthGuard>
  );
}