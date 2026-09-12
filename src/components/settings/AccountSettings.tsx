"use client";

import { Mail, Trash2, User } from "lucide-react";
import { useState } from "react";

import { SaveBar } from "@/components/settings/SaveBar";
import { TextField } from "@/components/ui/TextField";
import { updateAccountAction } from "@/lib/actions/account";

/**
 * Name and password, loaded from the member's profile row.
 *
 * Email is shown but not editable here: it lives in Supabase Auth rather than
 * the profiles table, and changing it starts its own confirmation flow.
 */
export function AccountSettings({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Name"
          value={name}
          onChange={setName}
          autoComplete="name"
          icon={User}
          placeholder="Your name"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={() => {}}
          autoComplete="email"
          icon={Mail}
          disabled
          hint="Managed by your sign-in and can't be changed here yet."
        />
      </div>

      <TextField
        label="New Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        hint="Leave blank to keep your current password."
      />

      <SaveBar
        hint="Saved to your account."
        onSave={async () => {
          const result = await updateAccountAction({
            displayName: name,
            newPassword: password || undefined,
          });
          if (result.status === "success") setPassword("");
          return result;
        }}
      />

      <div className="border-chalk/8 mt-2 border-t pt-6">
        <p className="text-chalk text-sm font-semibold">Delete account</p>
        <p className="text-fog mt-1.5 max-w-lg text-xs leading-relaxed">
          Permanently removes your account, training history and logged data. This cannot
          be undone.
        </p>
        <button
          type="button"
          disabled
          title="Account deletion arrives with account management"
          className="mt-4 inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-5 text-xs font-semibold text-red-300/60"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
