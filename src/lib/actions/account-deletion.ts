"use server";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AVATAR_BUCKET } from "@/lib/data/avatars";
import {
  DELETE_CONFIRMATION_PHRASE,
  type DeleteAccountResult,
} from "@/lib/account-deletion";

/**
 * Deleting your own account.
 *
 * Ownership comes from the session and nowhere else. The action takes no user
 * id, and the SQL function it calls takes no arguments either — the account
 * removed is always `auth.uid()`. No service-role key is involved, so there is
 * no credential here that could delete anyone else's account.
 *
 * See supabase/migrations/20260914090000_delete_own_account.sql for why the
 * privileged step is a SECURITY DEFINER function rather than the Admin API.
 */

const GENERIC_FAILURE =
  "We couldn't delete your account. Nothing has been changed — please try again.";

/**
 * Removes the member's avatar files.
 *
 * Best effort, and deliberately so. It runs first, while the session is
 * certainly still valid, and a failure here never blocks the deletion: an
 * unreachable file in a private bucket is housekeeping, whereas refusing to
 * delete an account because the storage API had a bad minute is not something
 * a member can work around. The trade-off is the narrow case where cleanup
 * succeeds and the deletion below then fails — the member keeps their account
 * but loses their picture, which they can simply upload again.
 */
async function removeOwnAvatarFiles(userId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // Listing is scoped to the member's own folder, and the bucket's policies
    // would refuse anything else even if this path were wrong.
    const { data: files, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(userId);

    if (error || !files?.length) return;

    await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(files.map((file) => `${userId}/${file.name}`));
  } catch {
    // Swallowed on purpose — see the note above.
  }
}

/**
 * Permanently deletes the signed-in member's account.
 *
 * On success this never returns: it redirects. On failure it returns a message
 * and the account is untouched, so the member can try again.
 */
export async function deleteAccountAction(input: {
  confirmation: string;
}): Promise<DeleteAccountResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  // Re-checked here because the request need not have come from the dialog.
  if (input.confirmation.trim().toUpperCase() !== DELETE_CONFIRMATION_PHRASE) {
    return {
      status: "error",
      message: `Type ${DELETE_CONFIRMATION_PHRASE} to confirm.`,
    };
  }

  await removeOwnAvatarFiles(user.id);

  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    // The database's own wording is not shown: it would leak schema detail and
    // would mean nothing to a member.
    return { status: "error", message: GENERIC_FAILURE };
  }

  // The row is gone, so the access token no longer resolves to a user and
  // `getUser()` — which the proxy calls on every request — starts returning
  // null. This clears the cookies as well, so nothing stale is left behind.
  // Local scope: a server round-trip would be answered 401 now that the user
  // does not exist, and would leave the cookies in place.
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Cookie clearing is a courtesy; the account is already gone and the
    // proxy will reject the session on the next request regardless.
  }

  // Home, matching where signOutAction lands. Must sit outside any try/catch:
  // redirect() signals by throwing.
  redirect("/");
}
