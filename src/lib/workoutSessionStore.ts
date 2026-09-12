import type { WorkoutSession } from "@/lib/useWorkoutSession";

/**
 * Tiny external store over localStorage, so React can subscribe to the
 * persisted session instead of mirroring it into component state. Falls back to
 * memory when storage is unavailable (private mode, blocked cookies, full quota).
 */

type Listener = () => void;

const listeners = new Set<Listener>();
const memory = new Map<string, string>();

const storageKey = (slug: string) => `stronger:workout-session:${slug}`;

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** Raw snapshot. Returns a string so React can compare it by value. */
export function getSnapshot(slug: string): string | null {
  return readRaw(storageKey(slug));
}

export function parseSession(raw: string | null, slug: string): WorkoutSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as WorkoutSession;
    if (parsed?.slug !== slug || typeof parsed.startedAt !== "number") return null;
    return {
      ...parsed,
      log: parsed.log ?? {},
      currentIndex: parsed.currentIndex ?? 0,
      finishedAt: parsed.finishedAt ?? null,
    };
  } catch {
    return null;
  }
}

export function createSession(slug: string): WorkoutSession {
  return { slug, startedAt: Date.now(), currentIndex: 0, log: {}, finishedAt: null };
}

export function saveSession(session: WorkoutSession) {
  writeRaw(storageKey(session.slug), JSON.stringify(session));
  emit();
}

/** Creates and stores a session only when one is not already saved. */
export function ensureSession(slug: string) {
  if (!parseSession(getSnapshot(slug), slug)) saveSession(createSession(slug));
}

export function resetSession(slug: string) {
  saveSession(createSession(slug));
}
