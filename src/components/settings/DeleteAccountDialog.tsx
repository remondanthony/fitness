"use client";

import { AlertCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { DELETE_CONFIRMATION_PHRASE } from "@/lib/account-deletion";
import { deleteAccountAction } from "@/lib/actions/account-deletion";
import { cn } from "@/lib/cn";

/** What the member is told will go. Mirrors the ON DELETE CASCADE chain. */
const REMOVED = [
  "Your sign-in and profile",
  "Every workout session and logged set",
  "Nutrition, wellness and habit history",
  "Goals, preferences and saved programs",
  "Your profile picture",
];

/**
 * Permanent account deletion, behind a two-step confirmation.
 *
 * Opening the dialog is the first step and deletes nothing. The second is
 * typing the confirmation word, which is what enables the destructive button —
 * an ordinary "are you sure?" is too easy to click through for something with
 * no undo. The same word is checked again on the server.
 */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmed =
    confirmation.trim().toUpperCase() === DELETE_CONFIRMATION_PHRASE;

  function close() {
    if (pending) return;
    setOpen(false);
    setConfirmation("");
    setError(null);
  }

  async function handleDelete() {
    if (!confirmed || pending) return;

    setPending(true);
    setError(null);

    // On success this never returns — the action redirects. Anything that
    // comes back is a failure, and the account is untouched.
    const result = await deleteAccountAction({ confirmation });

    setPending(false);
    setError(result.message);
  }

  return (
    <>
      <p className="text-chalk text-sm font-semibold">Delete account</p>
      <p className="text-fog mt-1.5 max-w-lg text-xs leading-relaxed">
        Permanently removes your account, training history and logged data. This cannot
        be undone.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-visible:outline-accent-500 press mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 text-xs font-semibold text-red-300 transition-colors hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete Account
      </button>

      <Dialog
        open={open}
        onClose={close}
        title="Delete your account?"
        description="This is permanent. Your account and everything below are removed straight away, and there is no way to restore them."
      >
        <ul className="border-chalk/10 bg-chalk/[0.03] flex flex-col gap-2 rounded-2xl border p-5">
          {REMOVED.map((item) => (
            <li key={item} className="text-mist flex items-start gap-2.5 text-xs leading-relaxed">
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400/70"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <label
            htmlFor="delete-confirmation"
            className="text-fog block text-[10px] font-semibold tracking-[0.2em] uppercase"
          >
            Type {DELETE_CONFIRMATION_PHRASE} to confirm
          </label>
          <input
            id="delete-confirmation"
            type="text"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setError(null);
            }}
            disabled={pending}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={DELETE_CONFIRMATION_PHRASE}
            aria-describedby="delete-confirmation-hint"
            className="bg-ink-950 text-chalk placeholder:text-fog/60 border-chalk/12 hover:border-chalk/25 focus:border-red-500/60 focus-visible:outline-accent-500 mt-2.5 h-12 w-full rounded-xl border px-4 text-sm tracking-[0.2em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
          />
          <p id="delete-confirmation-hint" className="text-fog mt-2 text-xs">
            {confirmed
              ? "Confirmed. The button below deletes your account."
              : `The delete button stays disabled until this reads ${DELETE_CONFIRMATION_PHRASE}.`}
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <div className="border-chalk/8 mt-7 flex flex-wrap items-center justify-end gap-3 border-t pt-6">
          <button
            type="button"
            onClick={close}
            disabled={pending}
            className="border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 focus-visible:outline-accent-500 press inline-flex h-11 items-center rounded-full border px-6 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || pending}
            className={cn(
              "focus-visible:outline-accent-500 press inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
              "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {pending ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </Dialog>
    </>
  );
}
