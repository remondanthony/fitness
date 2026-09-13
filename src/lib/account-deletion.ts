/**
 * Shared values for account deletion.
 *
 * Separate from the Server Action because a `"use server"` file may only
 * export async functions — a constant exported alongside the action fails the
 * build. Keeping them here also means the dialog and the action check the same
 * phrase rather than each spelling it out.
 *
 * No secrets and no Supabase client: safe to import from a client component.
 */

/** The word a member types to confirm. Compared case-insensitively. */
export const DELETE_CONFIRMATION_PHRASE = "DELETE";

/**
 * A deletion attempt only ever returns on failure — success redirects, so
 * there is no success shape to model.
 */
export type DeleteAccountResult = { status: "error"; message: string };
