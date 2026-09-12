/** Formatting helpers shared across the workout experience. */

/** Seconds → `M:SS` (or `MM:SS` when padded), e.g. 2538 → "42:18". */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** 4820 → "4,820". */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString("en-US");
}

/** 1 → "01" — used for exercise numbering. */
export function padIndex(value: number): string {
  return String(value).padStart(2, "0");
}
