"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import type { SaveResult } from "@/lib/actions/account";
import { deleteAvatarObject, uploadAvatar } from "@/lib/data/avatars";
import { getCurrentProfile, updateCurrentProfile } from "@/lib/data/profiles";
import {
  AVATAR_CONTENT_MISMATCH,
  checkAvatarMetadata,
  sniffImageType,
} from "@/lib/avatar-rules";

/**
 * Profile picture actions.
 *
 * Every check the browser control performs is repeated here, because a request
 * need not have come from that control. On top of them the file's own leading
 * bytes are read: the declared type and the filename are claims, the signature
 * is not.
 */

/**
 * Replaces the member's profile picture.
 *
 * The order matters and is the whole point of the design:
 *
 *   1. validate  2. upload the new file  3. point the profile at it
 *   4. only then delete the file it used to point at
 *
 * A failure at step 2 or 3 leaves the stored reference untouched, so a member
 * whose upload fails still has the avatar they arrived with. If step 3 fails
 * after step 2 succeeded, the orphan just uploaded is removed rather than left
 * behind.
 */
export async function uploadAvatarAction(formData: FormData): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return { status: "error", message: "Choose an image to upload." };
  }

  const metadataProblem = checkAvatarMetadata({ size: file.size, type: file.type });
  if (metadataProblem) {
    return { status: "error", message: metadataProblem.reason };
  }

  const bytes = await file.arrayBuffer();

  // The declared type has to match what the file actually is. A renamed SVG or
  // script claiming to be a PNG fails here, not on somebody's screen later.
  const actualType = sniffImageType(new Uint8Array(bytes.slice(0, 16)));

  if (actualType === null || actualType !== file.type) {
    return { status: "error", message: AVATAR_CONTENT_MISMATCH };
  }

  // Read the current reference before anything changes, so the old file can be
  // cleaned up afterwards — and so a failure can leave it exactly as it was.
  const before = await getCurrentProfile();
  if (before.error) {
    return { status: "error", message: "We couldn't reach your profile. Please try again." };
  }
  const previousPath = before.data?.avatar_url ?? null;

  const uploaded = await uploadAvatar(bytes, actualType);
  if (uploaded.error || !uploaded.path) {
    return {
      status: "error",
      message: uploaded.error ?? "We couldn't upload that image. Please try again.",
    };
  }

  const saved = await updateCurrentProfile({ avatar_url: uploaded.path });

  if (saved.error || !saved.data) {
    // The profile still points at the old file, so the new one is an orphan.
    await deleteAvatarObject(uploaded.path);
    return {
      status: "error",
      message: "We uploaded the image but couldn't save it to your profile. Please try again.",
    };
  }

  // Now that nothing refers to it, the previous picture can go. A failure here
  // costs a stray file, not the member's avatar, so it is not worth an error.
  if (previousPath && previousPath !== uploaded.path) {
    await deleteAvatarObject(previousPath);
  }

  revalidatePath("/", "layout");

  return { status: "success", message: "Profile picture updated" };
}

/**
 * Removes the member's profile picture.
 *
 * Clears the reference first: once nothing points at the file, a failed delete
 * leaves an unreferenced object rather than a profile pointing at something
 * that is no longer there.
 */
export async function removeAvatarAction(): Promise<SaveResult> {
  const user = await getSessionUser();
  if (!user) return { status: "error", message: "Please sign in again." };

  const before = await getCurrentProfile();
  if (before.error) {
    return { status: "error", message: "We couldn't reach your profile. Please try again." };
  }

  const path = before.data?.avatar_url ?? null;
  if (!path) return { status: "success", message: "No profile picture to remove" };

  const cleared = await updateCurrentProfile({ avatar_url: null });
  if (cleared.error || !cleared.data) {
    return { status: "error", message: "We couldn't remove your picture. Please try again." };
  }

  await deleteAvatarObject(path);

  revalidatePath("/", "layout");

  return { status: "success", message: "Profile picture removed" };
}
