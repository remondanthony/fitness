import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your STRONGER account.",
};

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
      <LoginForm />
    </AuthCard>
  );
}
