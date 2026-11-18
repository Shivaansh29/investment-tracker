import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLink } from "@/components/auth/auth-link";

export const metadata: Metadata = { title: "Create account · Investment Tracker" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      // Honest about today's scope: the dashboard shows the sample portfolio for now
      description="All it takes is an email and a password. Your dashboard opens on a sample portfolio for now."
      footer={
        <>
          Already have an account? <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      {/* Same reason as the login page: the form reads the URL, which happens per request */}
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthCard>
  );
}
