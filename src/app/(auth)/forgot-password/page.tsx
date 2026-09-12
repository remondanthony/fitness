import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a link to reset your STRONGER password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Password reset"
      title="Forgot Password."
      description="Enter the email you signed up with and we'll send you a link to set a new password."
      footer={
        <p className="text-mist">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-accent-400 hover:text-accent-300 font-semibold transition-colors"
          >
            Back to log in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
