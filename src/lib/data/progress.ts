import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database";

/** Server-only. See src/lib/data/README.md. */

/**
 * A member's history for one metric, oldest first — the order charts want.
 * `metricType` is free text, e.g. "body_weight" or "waist_cm".
 */
export async function getMetricHistory(
  userId: string,
  metricType: string,
  limit = 180,
) {
  const supabase = await createClient();

  return supabase
    .from("progress_metrics")
    .select("*")
    .eq("user_id", userId)
    .eq("metric_type", metricType)
    .order("recorded_at", { ascending: true })
    .limit(limit);
}

/** Records a single measurement. */
export async function recordMetric(entry: TablesInsert<"progress_metrics">) {
  const supabase = await createClient();

  return supabase.from("progress_metrics").insert(entry).select().single();
}

/** Milestones the member has unlocked. */
export async function getAchievements(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });
}
