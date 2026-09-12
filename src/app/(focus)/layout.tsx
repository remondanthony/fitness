import type { ReactNode } from "react";

/**
 * Distraction-free chrome for the workout player: no navigation, no footer,
 * just a full-height surface for the session itself.
 */
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="flex min-h-dvh flex-1 flex-col">
      {children}
    </main>
  );
}
