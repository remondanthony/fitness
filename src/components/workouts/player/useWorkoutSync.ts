"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  completeWorkoutAction,
  logSetAction,
  startWorkoutAction,
} from "@/lib/actions/workouts";
import type { RemoteSession } from "@/lib/data/workout-sessions";

/**
 * Mirrors the player's local session into Supabase.
 *
 * The local engine stays authoritative for what is on screen so the player
 * never stalls on a network round trip; this layer records the same events in
 * the background and reports when a write fails, rather than letting a set be
 * silently lost.
 */
export function useWorkoutSync(workoutSlug: string, initial: RemoteSession | null) {
  const [sessionId, setSessionId] = useState<string | null>(initial?.id ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingWrites, setPendingWrites] = useState(0);

  // Guards against React's development double-invoke and any re-mount opening
  // a second session. The action is idempotent server-side as well.
  const startRequested = useRef(Boolean(initial));
  const sessionIdRef = useRef<string | null>(initial?.id ?? null);
  const completed = useRef(false);

  useEffect(() => {
    if (startRequested.current) return;
    startRequested.current = true;

    let cancelled = false;
    (async () => {
      const result = await startWorkoutAction(workoutSlug);
      if (cancelled) return;

      if (result.status === "error") {
        setSaveError(result.message);
        return;
      }

      sessionIdRef.current = result.session.id;
      setSessionId(result.session.id);
    })();

    return () => {
      cancelled = true;
    };
  }, [workoutSlug]);

  const track = useCallback(async (run: () => Promise<{ error?: string }>) => {
    setPendingWrites((n) => n + 1);
    const { error } = await run();
    setPendingWrites((n) => Math.max(0, n - 1));
    setSaveError(error ?? null);
  }, []);

  const recordSet = useCallback(
    (entry: { exerciseId: string; setNumber: number; weight: number; reps: number }) => {
      const id = sessionIdRef.current;
      if (!id) {
        setSaveError("Your session hasn't started yet — this set wasn't saved.");
        return;
      }

      void track(async () => {
        const result = await logSetAction({ sessionId: id, workoutSlug, ...entry });
        return { error: result.status === "error" ? result.message : undefined };
      });
    },
    [track, workoutSlug],
  );

  const recordCompletion = useCallback(
    (totals: { durationSeconds: number; totalVolume: number }) => {
      const id = sessionIdRef.current;
      if (!id || completed.current) return;
      completed.current = true;

      void track(async () => {
        const result = await completeWorkoutAction({ sessionId: id, ...totals });
        return { error: result.status === "error" ? result.message : undefined };
      });
    },
    [track],
  );

  /** Lets a restart open a fresh session for the same workout. */
  const reset = useCallback(() => {
    completed.current = false;
    startRequested.current = false;
    sessionIdRef.current = null;
    setSessionId(null);
    setSaveError(null);
  }, []);

  return {
    sessionId,
    saving: pendingWrites > 0,
    saveError,
    dismissError: () => setSaveError(null),
    recordSet,
    recordCompletion,
    reset,
  };
}
