"use server";

/**
 * Consultation requests.
 *
 * STRONGER is a portfolio build with no payments and no membership tiers, so
 * consultation requests are open to anyone signed in. Input is still validated
 * on the server rather than trusted from the dialog.
 *
 * Scheduling is not connected to anything. The result says so plainly rather
 * than reporting a booking that did not happen.
 */

export type ConsultationResult =
  | { status: "error"; message: string }
  | { status: "not-connected"; message: string };

export async function requestConsultationAction(input: {
  coachName: string;
  email: string;
}): Promise<ConsultationResult> {
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
