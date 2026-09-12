"use client";

import { Mail, Trash2, User } from "lucide-react";
import { useState } from "react";

import { SaveBar } from "@/components/settings/SaveBar";
import { TextField } from "@/components/ui/TextField";

/**
 * Name, email and password.
 *
 * Prefilled from the real session; saving is still a placeholder until Part 12
 * wires profile persistence.
 */
export function AccountSettings({
  initialName = "",
  initialEmail = "",
}: {
  initialName?: string;
  initialEmail?: string;
}) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
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
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          icon={Mail}
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

      <SaveBar />

      <div className="border-chalk/8 mt-2 border-t pt-6">
        <p className="text-chalk text-sm font-semibold">Delete account</p>
        <p className="text-fog mt-1.5 max-w-lg text-xs leading-relaxed">
          Permanently removes your account, training history and logged data. This cannot
          be undone.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 text-xs font-semibold text-red-300 transition-colors hover:border-red-500/60 hover:bg-red-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
