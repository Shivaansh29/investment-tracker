import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account · Investment Tracker" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Track all your investments in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthCard>
  );
}
