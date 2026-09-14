"use server";

import { requireEntitlement } from "@/lib/data/membership";

/**
 * Consultation requests.
 *
 * The entitlement is enforced here rather than in the dialog. Hiding a button
 * stops the button being pressed; it does not stop the action being called, so
 * the check that matters runs on the server against a tier read from the
 * session. Nothing about membership is taken from the request.
 *
 * Scheduling itself is still not connected — that is unchanged from before,
 * and the result says so plainly rather than reporting a booking that did not
 * happen. What Part 17 adds is the gate; Part 18 and later can fill in the
 * booking behind it without moving the gate.
 */

export type ConsultationResult =
  | { status: "locked"; message: string }
  | { status: "error"; message: string }
  | { status: "not-connected"; message: string };

export async function requestConsultationAction(input: {
  coachName: string;
  email: string;
}): Promise<ConsultationResult> {
  // First, before anything is validated or read. A denial here is the whole
  // point of the action existing.
  const entitled = await requireEntitlement("coach-consultation");

  if (!entitled.allowed) {
    return { status: "locked", message: entitled.message };
  }

  const email = input.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const coachName = input.coachName.trim();
  if (coachName.length === 0 || coachName.length > 120) {
    return { status: "error", message: "That coach isn't recognised." };
  }

  return {
    status: "not-connected",
    message: `Consultations with ${coachName} open when scheduling is connected. Nothing was sent or stored.`,
  };
}
