import { AlertCircle, ArrowRight, Check, Compass } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { WorkoutCard } from "@/components/workouts/WorkoutCard";
import { REASON_LABEL, type MatchReason } from "@/lib/recommendations/rules";
import type { Recommendations } from "@/lib/data/recommendations";

/** How many of each to show. A shortlist, not the catalogue. */
const PROGRAM_COUNT = 3;
const WORKOUT_COUNT = 3;

/**
 * "Recommended for you" on the dashboard.
 *
 * A presentation layer only: the ranking arrives already decided, and nothing
 * here re-scores or re-sorts it. Every badge comes from the engine's own list
 * of reasons, so the page can only claim a match the scoring actually made —
 * which is why workout cards carry no "matches your goal" badge. The workout
 * catalogue has no goal classification, so the engine never produces that
 * reason for one.
 */
export function RecommendedShelf({
  recommendations,
}: {
  recommendations: Recommendations;
}) {
  const { programs, workouts, personalized, loadError } = recommendations;
  const topPrograms = programs.slice(0, PROGRAM_COUNT);
  const topWorkouts = workouts.slice(0, WORKOUT_COUNT);
  const nothingToShow = topPrograms.length === 0 && topWorkouts.length === 0;

  return (
    <section className="border-chalk/8 bg-ink-900 border-y py-12 lg:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-fog text-[11px] font-semibold tracking-[0.28em] uppercase">
              Recommended For You
            </h2>
            <p className="text-mist mt-3 max-w-xl text-sm leading-relaxed">
              {personalized
                ? "Picked from the STRONGER catalogue using the answers you saved. Nothing here needs equipment you don't have."
                : "A general starting point. Tell us what you're training for and this becomes yours."}
            </p>
          </div>

          {!personalized && !loadError ? (
            <Button href="/onboarding" variant="secondary" className="shrink-0">
              Personalize This
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </Button>
          ) : null}
        </div>

        {loadError ? (
          <p
            role="alert"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            We couldn&apos;t read your preferences, so these aren&apos;t personalized right
            now. Refresh to try again.
          </p>
        ) : null}

        {nothingToShow ? (
          <div className="mt-8">
            <EmptyState
              icon={Compass}
              title="Nothing to recommend yet"
              description="No programs or workouts in the catalogue match what you can train with right now."
              action={
                <Button href="/programs" variant="secondary">
                  Browse Everything
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              }
            />
          </div>
        ) : null}

        {topPrograms.length > 0 ? (
          <div className="mt-8">
            {/* A label rather than a heading: the cards below already render
                their titles as h3, so a heading here would sit at the same
                level as its own contents. `aria-labelledby` names the group
                without flattening the outline. */}
            <p
              id="recommended-programs-label"
              className="text-chalk text-[11px] font-semibold tracking-[0.2em] uppercase"
            >
              Programs
            </p>
            <ul
              aria-labelledby="recommended-programs-label"
              className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {topPrograms.map((entry, index) => (
                <li key={entry.item.slug} className="flex flex-col gap-3">
                  {/* The `full` variant, because `preview` renders the title
                      as plain text — a recommendation has to be clickable. */}
                  <ProgramCard program={entry.item} variant="full" index={index} />
                  <ReasonList reasons={entry.reasons} subject={entry.item.title} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {topWorkouts.length > 0 ? (
          <div className="mt-10">
            <p
              id="recommended-workouts-label"
              className="text-chalk text-[11px] font-semibold tracking-[0.2em] uppercase"
            >
              Single Sessions
            </p>
            <ul
              aria-labelledby="recommended-workouts-label"
              className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {topWorkouts.map((entry, index) => (
                <li key={entry.item.slug} className="flex flex-col gap-3">
                  <WorkoutCard workout={entry.item} index={index} />
                  <ReasonList reasons={entry.reasons} subject={entry.item.title} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/**
 * Why this one was suggested.
 *
 * Rendered as a list with text on every chip, so the reasons survive without
 * colour and are read out in order by a screen reader rather than appearing as
 * decoration next to the card.
 */
function ReasonList({
  reasons,
  subject,
}: {
  reasons: MatchReason[];
  subject: string;
}) {
  if (reasons.length === 0) return null;

  return (
    <ul aria-label={`Why ${subject} is recommended`} className="flex flex-wrap gap-2">
      {reasons.map((reason) => (
        <li key={reason}>
          <Badge variant="default" size="sm" className="inline-flex items-center gap-1.5">
            <Check className="text-accent-400 h-3 w-3 shrink-0" aria-hidden="true" />
            {REASON_LABEL[reason]}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
