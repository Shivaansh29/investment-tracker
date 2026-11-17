import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLink } from "@/components/auth/auth-link";

export const metadata: Metadata = { title: "Log in · Investment Tracker" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Log in"
      description="Enter your email and password to open your dashboard."
      footer={
        <>
          New here? <AuthLink href="/signup">Create an account</AuthLink>
        </>
      }
    >
      {/* The form reads ?next= and ?error= from the URL, which happens per request */}
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthCard>
  );
}
