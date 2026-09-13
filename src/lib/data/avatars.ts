import { cache } from "react";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { extensionFor, type AcceptedAvatarType } from "@/lib/avatar-rules";

/**
 * Server-only avatar storage.
 *
 * Files live in the private `avatars` bucket at `<user id>/avatar-<ms>.<ext>`.
 * The user id always comes from the session, never from the caller, so there
 * is no path a request could supply that would reach another member's folder —
 * and the bucket's policies enforce the same rule again in the database.
 *
 * `profiles.avatar_url` holds the object path, not a URL. Storing a path keeps
 * the reference valid whichever way the file is later served, and a private
 * bucket has no durable URL to store in the first place.
 */

export const AVATAR_BUCKET = "avatars";

/** How long a generated avatar link stays valid. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** The object path for a fresh upload. Timestamped so each version is its own
 *  object — which is what lets the previous one survive a failed replacement,
 *  and what stops a cached image from outliving a change. */
function newAvatarPath(userId: string, type: AcceptedAvatarType): string {
  return `${userId}/avatar-${Date.now()}.${extensionFor(type)}`;
}

/**
 * A short-lived link to the member's own avatar.
 *
 * Returns null whenever there is nothing to show — no stored reference, or a
 * reference pointing at a file that is no longer there. A broken reference
 * renders as the default avatar rather than a broken image.
 */
export const getAvatarSignedUrl = cache(async (path: string | null | undefined) => {
  if (!path) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return null;

  return data.signedUrl;
});

/**
 * Stores a new avatar for the signed-in member.
 *
 * Uploads first and only then reports the new path. The caller updates the
 * profile and, once that has succeeded, removes the previous file — so a
 * failure at any point leaves the member with the avatar they already had.
 */
export async function uploadAvatar(
  bytes: ArrayBuffer,
  type: AcceptedAvatarType,
): Promise<{ path: string | null; error: string | null }> {
  const user = await getSessionUser();
  if (!user) return { path: null, error: "Please sign in again." };

  const supabase = await createClient();
  const path = newAvatarPath(user.id, type);

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, bytes, {
    contentType: type,
    // A fresh timestamped path every time, so an overwrite would mean two
    // requests collided within the same millisecond. Failing is the right
    // outcome there.
    upsert: false,
  });

  if (error) {
    return { path: null, error: "We couldn't upload that image. Please try again." };
  }

  return { path, error: null };
}

/**
 * Deletes one of the member's own avatar objects.
 *
 * Used for tidying up: the previous file after a successful replacement, or a
 * just-uploaded file when the profile update that should have pointed at it
 * failed. Returns whether it went, so callers can decide whether that matters.
 */
export async function deleteAvatarObject(path: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;

  // Belt and braces with the storage policy: never issue a delete for a path
  // outside the caller's own folder, whatever produced that path.
  if (!path.startsWith(`${user.id}/`)) return false;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);

  return !error;
}
