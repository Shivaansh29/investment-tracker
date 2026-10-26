import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in · Investment Tracker" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to see your portfolio."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
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
