"use client";

import { useState } from "react";

import { Toggle } from "@/components/ui/Toggle";
import type { ToggleSetting } from "@/data/profile";

/**
 * A list of switch settings.
 *
 * These channels have no column in the current schema — `user_preferences`
 * carries a single `notifications_enabled` flag, not one per channel — so the
 * choices are held in the browser and the caller says so. Persisting them
 * needs a schema change, which is deliberately not made here.
 */
export function ToggleGroup({ settings }: { settings: ToggleSetting[] }) {
  const [enabled, setEnabled] = useState<string[]>(() =>
    settings.filter((setting) => setting.defaultOn).map((setting) => setting.id),
  );

  const toggle = (id: string, next: boolean) =>
    setEnabled((current) =>
      next ? [...current, id] : current.filter((entry) => entry !== id),
    );

  return (
    <>
      <p className="text-fog border-chalk/10 bg-chalk/[0.03] mb-5 rounded-xl border px-4 py-3 text-xs leading-relaxed">
        These choices aren&apos;t saved to your account yet — they reset on reload.
      </p>

      <ul className="divide-chalk/8 flex flex-col divide-y">
      {settings.map((setting) => (
        <li
          key={setting.id}
          className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="text-chalk text-sm font-semibold">{setting.label}</p>
            <p className="text-fog mt-1 text-xs leading-relaxed">{setting.description}</p>
          </div>
          <Toggle
            checked={enabled.includes(setting.id)}
            onChange={(next) => toggle(setting.id, next)}
            label={setting.label}
          />
        </li>
      ))}
      </ul>
    </>
  );
}
