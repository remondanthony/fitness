import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your STRONGER account.",
};

function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-5" aria-hidden="true">
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="mt-2 h-12 w-full rounded-xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log In."
      description="Pick up where you left off — your programs, logs and streak are waiting."
      footer={
        <p className="text-mist">
          New here?{" "}
          <Link
            href="/register"
            className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {/* The form reads ?next and ?error from the URL, so it opts out of
          prerendering behind a boundary that mirrors its layout. */}
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
