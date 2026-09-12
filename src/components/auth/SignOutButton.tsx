"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { cn } from "@/lib/cn";
import { signOutAction } from "@/lib/auth/actions";

/**
 * Ends the Supabase session server-side, which clears the auth cookies and
 * redirects home. Nothing is removed from localStorage because nothing was
 * ever stored there.
 */
export function SignOutButton({
  className,
  variant = "button",
}: {
  className?: string;
  variant?: "button" | "menu";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void signOutAction())}
      className={cn(
        "press inline-flex items-center gap-2 font-semibold disabled:opacity-60",
        variant === "menu"
          ? "border-chalk/10 bg-chalk/[0.04] text-mist hover:border-chalk/25 hover:text-chalk min-h-12 w-full justify-center rounded-xl border px-4 text-sm"
          : "border-chalk/12 bg-chalk/5 text-mist hover:border-chalk/30 hover:text-chalk h-9 rounded-xl border px-3.5 text-xs",
        className,
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
      {pending ? "Signing out…" : "Log Out"}
    </button>
  );
}
