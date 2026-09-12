import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your STRONGER account and start training.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      eyebrow="Get started"
      title="Create Account."
      description="Free to start. No card required, and you can change plan whenever you like."
      footer={
        <p className="text-mist">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
          >
            Log in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
