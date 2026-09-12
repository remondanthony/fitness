/**
 * Guards post-login redirects.
 *
 * Only same-origin application paths are allowed. Anything else — absolute
 * URLs, protocol-relative `//evil.com`, backslash tricks — is rejected, so a
 * crafted `?next=` cannot bounce a member off to another site.
 */
export function safeInternalPath(candidate: string | null | undefined): string | null {
  if (!candidate) return null;

  // Must be a rooted path, and must not start a new authority.
  if (!candidate.startsWith("/")) return null;
  if (candidate.startsWith("//")) return null;
  if (candidate.includes("\\")) return null;
  if (candidate.includes("://")) return null;

  return candidate;
}
