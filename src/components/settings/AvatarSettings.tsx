"use client";

import { AlertCircle, Camera, Loader2, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useToast } from "@/components/ui/Toast";
import { removeAvatarAction, uploadAvatarAction } from "@/lib/actions/avatar";
import {
  AVATAR_ACCEPT_ATTRIBUTE,
  AVATAR_CONTENT_MISMATCH,
  checkAvatarMetadata,
  MAX_AVATAR_LABEL,
  sniffImageType,
} from "@/lib/avatar-rules";
import { cn } from "@/lib/cn";

/**
 * Profile picture: upload, replace and remove.
 *
 * The picked file is previewed locally while it uploads, so the change is
 * visible immediately, and the preview is discarded the moment the server
 * confirms — from then on the avatar shown is the one actually stored. A
 * failure puts the previous picture straight back; nothing here reports a save
 * the server did not make.
 */
export function AvatarSettings({
  initialUrl,
  displayName,
}: {
  /** Signed link to the stored picture, or null when there isn't one. */
  initialUrl: string | null;
  displayName: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  // `initialUrl` seeds this and nothing more. Once the member starts making
  // changes their own actions are what this reflects, and a later navigation
  // remounts the control with a fresh signed link from the server.
  const [storedUrl, setStoredUrl] = useState(initialUrl);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Object URLs are a resource. They are held until the control goes away
  // rather than revoked as each one is replaced, because the picture just
  // uploaded stays on screen after the preview has served its purpose —
  // revoking eagerly would leave a broken image behind.
  const objectUrls = useRef<string[]>([]);
  useEffect(() => {
    const created = objectUrls.current;
    return () => created.forEach(URL.revokeObjectURL);
  }, []);

  function localPreview(file: File): string {
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    return url;
  }

  const shown = preview ?? storedUrl;
  const busy = pending !== null;

  async function handleFile(file: File) {
    setError(null);

    const problem = checkAvatarMetadata({ size: file.size, type: file.type });
    if (problem) {
      setError(problem.reason);
      return;
    }

    // The same signature check the action runs, so an unusable file is caught
    // before it is sent rather than after a round trip.
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (sniffImageType(head) !== file.type) {
      setError(AVATAR_CONTENT_MISMATCH);
      return;
    }

    const previewUrl = localPreview(file);
    setPreview(previewUrl);
    setPending("upload");

    const body = new FormData();
    body.append("avatar", file);

    const result = await uploadAvatarAction(body);

    setPending(null);

    if (result.status === "error") {
      // Back to the picture they had. Nothing was changed on the server, and
      // `storedUrl` still points at a link that works.
      setPreview(null);
      setError(result.message);
      return;
    }

    // Confirmed. The file the member picked is now what the server holds, so
    // it becomes the stored picture — which is also what reveals "Remove
    // photo" for someone who had no avatar a moment ago.
    setStoredUrl(previewUrl);
    setPreview(null);
    notify({ tone: "success", title: result.message });
  }

  async function handleRemove() {
    setError(null);
    setPending("remove");

    const result = await removeAvatarAction();

    setPending(null);

    if (result.status === "error") {
      setError(result.message);
      return;
    }

    setPreview(null);
    setStoredUrl(null);
    notify({ tone: "success", title: result.message });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0 self-start sm:self-auto">
          <div
            className="bg-accent-500/20 absolute -inset-2 -z-10 rounded-full blur-xl"
            aria-hidden="true"
          />

          {shown ? (
            // Not next/image: the source is a short-lived signed URL to a
            // private object, which the optimiser cannot usefully cache.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={`Profile picture for ${displayName}`}
              width={96}
              height={96}
              className={cn(
                "border-chalk/12 h-24 w-24 rounded-full border object-cover transition-opacity duration-300",
                busy && "opacity-60",
              )}
            />
          ) : (
            <span
              className="border-chalk/12 bg-chalk/5 text-mist font-display flex h-24 w-24 items-center justify-center rounded-full border text-3xl"
              aria-hidden="true"
            >
              {initials(displayName)}
            </span>
          )}

          {busy ? (
            <span
              className="bg-ink-950/50 absolute inset-0 flex items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <Loader2 className="text-chalk h-6 w-6 animate-spin" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-chalk text-sm font-semibold">
            {shown ? "Your profile picture" : "No profile picture yet"}
          </p>
          <p className="text-fog mt-1.5 text-xs leading-relaxed">
            JPEG, PNG or WebP, up to {MAX_AVATAR_LABEL}. It&apos;s cropped to a circle
            automatically — nothing to line up.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* A real file input, labelled. The label is the control: it is
                focusable, activates on Enter or Space, and needs no script. */}
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={AVATAR_ACCEPT_ATTRIBUTE}
              disabled={busy}
              // `peer`, not a descendant selector: the input sits beside its
              // label rather than inside it, so `has-[:focus-visible]` would
              // never match and keyboard focus would be invisible.
              className="peer sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                // Clear the input so picking the same file again still fires.
                event.target.value = "";
                if (file) void handleFile(file);
              }}
            />
            <label
              htmlFor={inputId}
              className={cn(
                "border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10 press inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-xs font-semibold transition-colors",
                "peer-focus-visible:outline-accent-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2",
                busy && "pointer-events-none opacity-60",
              )}
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
              {pending === "upload"
                ? "Uploading…"
                : shown
                  ? "Change photo"
                  : "Upload photo"}
            </label>

            {/* Only offered when there is something stored to remove — a local
                preview mid-upload is not yet a picture anyone can delete. */}
            {storedUrl ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="text-fog hover:text-chalk focus-visible:outline-accent-500 press inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {pending === "remove" ? "Removing…" : "Remove photo"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** "Alex Carter" → "AC". Falls back to a single letter, then to nothing. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
