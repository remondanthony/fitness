"use client";

import { Mail, User } from "lucide-react";
import { useState } from "react";

import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
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
        <DeleteAccountDialog />
      </div>
    </div>
  );
}
