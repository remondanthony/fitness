/**
 * What counts as an acceptable profile picture.
 *
 * Shared by the browser control and the Server Action so the two cannot drift.
 * The client checks give immediate feedback; the server repeats every one of
 * them because a request need not have come from that control at all.
 *
 * No secrets, no Supabase client — safe to import from a client component.
 */

/** 2 MiB. Mirrored by the bucket's own file_size_limit. */
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const MAX_AVATAR_LABEL = "2 MB";

/** The formats a browser can reliably display without any transcoding. */
export const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AcceptedAvatarType = (typeof ACCEPTED_AVATAR_TYPES)[number];

/** The `accept` attribute for the file input. Never the only gate. */
export const AVATAR_ACCEPT_ATTRIBUTE = ACCEPTED_AVATAR_TYPES.join(",");

const EXTENSION_FOR: Record<AcceptedAvatarType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** The file extension to store a given type under. */
export function extensionFor(type: AcceptedAvatarType): string {
  return EXTENSION_FOR[type];
}

/**
 * Identifies an image from its leading bytes.
 *
 * The point of reading the file itself is that a `Content-Type` header and a
 * filename are both just claims: renaming `payload.svg` to `photo.png` defeats
 * either one. The signature cannot be renamed away.
 *
 * Returns null for anything that is not one of the accepted formats — an SVG,
 * an HTML document and an executable all fail here, because none of them
 * begins with one of these signatures.
 */
export function sniffImageType(bytes: Uint8Array): AcceptedAvatarType | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((byte, i) => bytes[i] === byte)) {
    return "image/png";
  }

  // WebP: "RIFF" .... "WEBP"
  const ascii = (start: number, text: string) =>
    bytes.length >= start + text.length &&
    [...text].every((char, i) => bytes[start + i] === char.charCodeAt(0));

  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";

  return null;
}

export type AvatarRejection = { reason: string };

/**
 * The checks that need only the file's metadata.
 *
 * Split out from the signature check so the browser can run them the instant a
 * file is picked, without reading its contents.
 */
export function checkAvatarMetadata(file: {
  size: number;
  type: string;
}): AvatarRejection | null {
  if (file.size === 0) {
    return { reason: "That file is empty. Choose a different image." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return {
      reason: `That image is larger than ${MAX_AVATAR_LABEL}. Choose a smaller one.`,
    };
  }

  if (!(ACCEPTED_AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return { reason: "Use a JPEG, PNG or WebP image." };
  }

  return null;
}

/** The message shown when the bytes do not match a real JPEG, PNG or WebP. */
export const AVATAR_CONTENT_MISMATCH =
  "That file isn't a JPEG, PNG or WebP image. Choose a different one.";
