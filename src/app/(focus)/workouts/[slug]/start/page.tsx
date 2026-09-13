import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { WorkoutPlayer } from "@/components/workouts/player/WorkoutPlayer";
import { getWorkout, workouts } from "@/data/workouts";
import { getOpenSession } from "@/lib/data/workout-sessions";

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
}: PageProps<"/workouts/[slug]/start">) {
  const { slug } = await params;
  const workout = getWorkout(slug);

  if (!workout) notFound();

  // Resolved on the server so a refresh mid-workout restores immediately,
  // with no client round trip and no risk of opening a second session.
  const { data: openSession } = await getOpenSession(slug);

  return <WorkoutPlayer workout={workout} initialRemote={openSession} />;
}
