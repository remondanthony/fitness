"use client";

import { useState } from "react";

import { Toggle } from "@/components/ui/Toggle";
import type { ToggleSetting } from "@/data/profile";

/** A list of switch settings. State only — nothing is persisted yet. */
export function ToggleGroup({ settings }: { settings: ToggleSetting[] }) {
  const [enabled, setEnabled] = useState<string[]>(() =>
    settings.filter((setting) => setting.defaultOn).map((setting) => setting.id),
  );

  const toggle = (id: string, next: boolean) =>
    setEnabled((current) =>
      next ? [...current, id] : current.filter((entry) => entry !== id),
    );

  return (
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
  );
}
