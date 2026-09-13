"use client";

import { AlertCircle, ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup } from "@/components/onboarding/ChoiceGroup";
import { completeOnboardingAction } from "@/lib/actions/onboarding";
import { cn } from "@/lib/cn";
import {
  equipmentOptions,
  goalOptions,
  levelOptions,
  trainingDayOptions,
  unitOptions,
  type PersonalizationAnswers,
} from "@/lib/personalization";

type StepId = keyof PersonalizationAnswers;

type Step = {
  id: StepId;
  /** Short name for the progress indicator. */
  name: string;
  eyebrow: string;
  title: string;
  description: string;
};

const STEPS: readonly Step[] = [
  {
    id: "goal",
    name: "Goal",
    eyebrow: "Step one",
    title: "What are you training for?",
    description:
      "Pick the one that matters most right now. You can change it whenever it changes.",
  },
  {
    id: "level",
    name: "Experience",
    eyebrow: "Step two",
    title: "Where are you starting from?",
    description: "This sets the difficulty of what we put in front of you. Be honest, not modest.",
  },
  {
    id: "equipment",
    name: "Equipment",
    eyebrow: "Step three",
    title: "What can you train with?",
    description: "Whatever you can reach on a normal day. A good plan works with what you have.",
  },
  {
    id: "trainingDays",
    name: "Frequency",
    eyebrow: "Step four",
    title: "How many days a week?",
    description:
      "Sessions per week, not particular days. Choose the number you can keep to on a bad week.",
  },
  {
    id: "units",
    name: "Units",
    eyebrow: "Step five",
    title: "How should we show numbers?",
    description: "Weights, distances and measurements across the app.",
  },
];

/**
 * The onboarding flow.
 *
 * Answers are held here and written once, at the end. Five taps is short
 * enough that a single save is the simplest thing that cannot half-finish —
 * there is no state where the goal saved but the equipment did not.
 *
 * A member who has already answered arrives here prefilled and in review mode:
 * the flow is theirs to revisit, and nothing is overwritten until they submit.
 */
export function OnboardingFlow({
  initial,
  alreadyComplete,
  loadError,
}: {
  initial: PersonalizationAnswers;
  alreadyComplete: boolean;
  loadError: boolean;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<PersonalizationAnswers>(initial);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const step = STEPS[index];
  const answered = answers[step.id] !== "";
  const isLast = index === STEPS.length - 1;

  function choose(id: StepId, value: string) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setError(null);
  }

  function goBack() {
    setDirection("prev");
    setIndex((current) => Math.max(0, current - 1));
  }

  async function goForward() {
    if (!answered || pending) return;

    if (!isLast) {
      setDirection("next");
      setIndex((current) => current + 1);
      return;
    }

    setPending(true);
    setError(null);

    const result = await completeOnboardingAction(answers);

    setPending(false);

    if (result.status === "error") {
      // Answers stay exactly as they are so the member can retry without
      // re-entering anything.
      setError(result.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return <CompletionCard onContinue={() => router.push("/dashboard")} />;
  }

  return (
    <div className="w-full">
      <StepProgress index={index} steps={STEPS} />

      {alreadyComplete ? (
        <p className="border-chalk/10 bg-chalk/[0.03] text-fog mt-6 rounded-xl border px-4 py-3 text-xs leading-relaxed">
          You&apos;ve set this up before — your answers are filled in below. Nothing changes
          until you finish, and you can edit these any time in{" "}
          <span className="text-mist">Settings</span>.
        </p>
      ) : null}

      {loadError ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          We couldn&apos;t load your saved answers, so the steps below may start blank.
          Anything you choose here will still be saved.
        </p>
      ) : null}

      {/* The slide transition moves content horizontally; clip it so a step
          mid-animation can never widen the page. */}
      <div className="mt-8 overflow-x-clip">
        <div
          key={step.id}
          className={cn(
            "min-w-0",
            direction === "next"
              ? "motion-safe:animate-slide-next"
              : "motion-safe:animate-slide-prev",
          )}
        >
          <p className="text-accent-400 text-[11px] font-semibold tracking-[0.28em] uppercase">
            {step.eyebrow}
          </p>
          <h1 className="font-display text-chalk mt-4 text-3xl leading-[1.05] break-words sm:text-4xl lg:text-5xl">
            {step.title}
          </h1>
          <p className="text-mist mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
            {step.description}
          </p>

          <div className="mt-8">
            <StepControl id={step.id} answers={answers} onChoose={choose} />
          </div>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className="border-chalk/8 mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={index === 0 || pending}
          className={cn(index === 0 && "invisible")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        <Button type="button" onClick={goForward} disabled={!answered || pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              {isLast ? (alreadyComplete ? "Save Changes" : "Finish Setup") : "Continue"}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </Button>
      </div>

      {!answered ? (
        <p className="text-fog mt-4 text-xs">Choose an option to continue.</p>
      ) : null}
    </div>
  );
}

/** Renders the control for one step, keeping each option list's type exact. */
function StepControl({
  id,
  answers,
  onChoose,
}: {
  id: StepId;
  answers: PersonalizationAnswers;
  onChoose: (id: StepId, value: string) => void;
}) {
  switch (id) {
    case "goal":
      return (
        <ChoiceGroup
          name="goal"
          legend="Primary goal"
          options={goalOptions}
          value={answers.goal}
          onChange={(value) => onChoose("goal", value)}
        />
      );
    case "level":
      return (
        <ChoiceGroup
          name="level"
          legend="Experience level"
          options={levelOptions}
          value={answers.level}
          onChange={(value) => onChoose("level", value)}
          columns={1}
        />
      );
    case "equipment":
      return (
        <ChoiceGroup
          name="equipment"
          legend="Equipment access"
          options={equipmentOptions}
          value={answers.equipment}
          onChange={(value) => onChoose("equipment", value)}
        />
      );
    case "trainingDays":
      return (
        <ChoiceGroup
          name="trainingDays"
          legend="Sessions per week"
          options={trainingDayOptions}
          value={answers.trainingDays}
          onChange={(value) => onChoose("trainingDays", value)}
        />
      );
    case "units":
      return (
        <ChoiceGroup
          name="units"
          legend="Units"
          options={unitOptions}
          value={answers.units}
          onChange={(value) => onChoose("units", value)}
        />
      );
  }
}

/** Where the member is in the flow, as a labelled bar and a spoken count. */
function StepProgress({ index, steps }: { index: number; steps: readonly Step[] }) {
  const current = index + 1;
  const percent = Math.round((current / steps.length) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-fog text-[11px] font-semibold tracking-[0.2em] uppercase">
          Step {current} of {steps.length} · {steps[index].name}
        </p>
        <p className="text-fog text-[11px] font-semibold tracking-[0.2em] uppercase">
          {percent}%
        </p>
      </div>

      <div
        className="bg-chalk/8 mt-3 flex h-1.5 w-full gap-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`Step ${current} of ${steps.length}: ${steps[index].name}`}
      >
        {steps.map((step, i) => (
          <span
            key={step.id}
            className={cn(
              "block h-full flex-1 rounded-full transition-colors duration-300",
              i <= index ? "bg-accent-500" : "bg-transparent",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Shown only after the save is confirmed on the server. */
function CompletionCard({ onContinue }: { onContinue: () => void }) {
  return (
    <Card tone="raised" className="motion-safe:animate-scale-in p-8 text-center sm:p-12">
      <span className="border-accent-500/40 bg-accent-500/10 text-accent-400 mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl border">
        <Check className="motion-safe:animate-check-pop h-7 w-7" aria-hidden="true" />
      </span>

      <h1 className="font-display text-chalk mt-7 text-4xl leading-[1.05] sm:text-5xl">
        You&apos;re Ready.
      </h1>
      <p className="text-mist mx-auto mt-4 max-w-md text-sm leading-relaxed sm:text-base">
        Your answers are saved to your account. They shape what STRONGER puts in front of
        you, and you can change any of them in Settings.
      </p>

      <div className="mt-9">
        <Button type="button" onClick={onContinue} size="lg">
          Go to Dashboard
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1"
            aria-hidden="true"
          />
        </Button>
      </div>
    </Card>
  );
}
