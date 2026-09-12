"use client";

import { CalendarCheck, Info } from "lucide-react";
import { useState } from "react";

import { Dialog } from "@/components/ui/Dialog";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const slots = [
  { value: "weekday-morning", label: "Weekday mornings" },
  { value: "weekday-evening", label: "Weekday evenings" },
  { value: "weekend", label: "Weekends" },
];

const goals = [
  { value: "build-muscle", label: "Build muscle" },
  { value: "lose-fat", label: "Lose fat" },
  { value: "get-stronger", label: "Get stronger" },
  { value: "athletic", label: "Athletic performance" },
];

type ConsultationButtonProps = {
  coachName: string;
  size?: "md" | "lg";
  className?: string;
};

/**
 * Opens the consultation request placeholder. The form is complete and
 * validated, but booking is not connected — the dialog says so plainly.
 */
export function ConsultationButton({
  coachName,
  size = "lg",
  className,
}: ConsultationButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [slot, setSlot] = useState(slots[0].value);
  const [goal, setGoal] = useState(goals[0].value);
  const [error, setError] = useState<string>();
  const { notify } = useToast();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    setError(undefined);
    setOpen(false);
    notify({
      tone: "info",
      title: "Booking isn't live yet",
      description: `Consultations with ${coachName} open when scheduling is connected. Nothing was sent.`,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "bg-accent-500 hover:bg-accent-400 active:bg-accent-600 shadow-glow group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap text-white transition-[background-color,transform] duration-200 hover:-translate-y-0.5",
          size === "lg" ? "h-14 px-8 text-[15px]" : "h-11 px-5 text-sm",
          className,
        )}
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Book Consultation
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Book a consultation"
        description={`A 30-minute call with ${coachName} to go through your training history, schedule and equipment.`}
      >
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
            error={error}
          />

          <SelectField
            label="Preferred Times"
            value={slot}
            onChange={setSlot}
            options={slots}
          />

          <SelectField
            label="Main Goal"
            value={goal}
            onChange={setGoal}
            options={goals}
          />

          <p className="text-fog border-chalk/10 bg-chalk/[0.03] flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
              Scheduling is not connected yet, so this request will not be sent or stored.
            </span>
          </p>

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <button
              type="submit"
              className="bg-accent-500 hover:bg-accent-400 shadow-glow inline-flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors"
            >
              Request Consultation
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border-chalk/12 bg-chalk/5 text-chalk hover:border-chalk/30 inline-flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-semibold transition-colors sm:flex-initial"
            >
              Cancel
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
