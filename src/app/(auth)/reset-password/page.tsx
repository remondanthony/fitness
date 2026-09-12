import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Set A New Password",
  description: "Choose a new password for your STRONGER account.",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  // The recovery link establishes a session at /auth/callback. Without one the
  // link was expired or already used, and the form says so.
  const user = await getSessionUser();

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Set A New Password."
      description="Choose something you haven't used before. You'll stay signed in on this device."
    >
      <ResetPasswordForm hasSession={user !== null} />
    </AuthCard>
  );
}
