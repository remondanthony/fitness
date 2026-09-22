import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { WorkoutPlayer } from "@/components/workouts/player/WorkoutPlayer";
import { getWorkout, workouts } from "@/data/workouts";
import { getSessionDetail } from "@/lib/data/progress-analytics";
import { getOpenSession } from "@/lib/data/workout-sessions";
import { applyPrefill, buildPrefill } from "@/lib/progress/repeat";

export function generateStaticParams() {
  return workouts.map((workout) => ({ slug: workout.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/workouts/[slug]/start">): Promise<Metadata> {
  const { slug } = await params;
  const workout = getWorkout(slug);

  return {
    title: workout ? `${workout.title} — In Progress` : "Workout not found",
    robots: { index: false },
  };
}

export default async function WorkoutPlayerPage({
  params,
  searchParams,
}: PageProps<"/workouts/[slug]/start">) {
  const { slug } = await params;
  const { from } = (await searchParams) as { from?: string };
  const workout = getWorkout(slug);

  if (!workout) notFound();

  // Resolved on the server so a refresh mid-workout restores immediately,
  // with no client round trip and no risk of opening a second session.
  const { data: openSession } = await getOpenSession(slug);

  // Repeating a previous session. `from` is a session id off the URL, so it is
  // resolved through getSessionDetail, which scopes the read to the signed-in
  // member and returns null for a session that is missing or somebody else's —
  // the two are indistinguishable. A null simply means no prefill, so a
  // tampered id degrades to an ordinary start rather than an error.
  //
  // This changes the set logger's starting values and nothing else. The
  // exercises and their set counts come from the current catalogue, and no
  // exercise_log is written until the member logs a set themselves.
  let exercises = workout.exercises;

  if (from) {
    const { data: previous } = await getSessionDetail(from);

    if (previous) {
      exercises = applyPrefill(workout.exercises, buildPrefill(previous.sets));
    }
  }

  return (
    <WorkoutPlayer workout={{ ...workout, exercises }} initialRemote={openSession} />
  );
}
