/**
 * A single shared 1-second tick exposed as an external store, so components can
 * read the current time during render without calling `Date.now()` themselves.
 * The interval only runs while something is subscribed.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let current = 0;
let timer: number | null = null;

export function subscribeToClock(listener: Listener) {
  listeners.add(listener);

  if (timer === null) {
    current = Date.now();
    timer = window.setInterval(() => {
      current = Date.now();
      for (const entry of listeners) entry();
    }, 1000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

/** Stable between ticks, so React can compare snapshots safely. */
export function getClock() {
  return current;
}

export function getServerClock() {
  return 0;
}

/** Used when the clock should stop, e.g. once a workout is complete. */
export function subscribeToNothing() {
  return () => {};
}
