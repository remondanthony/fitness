"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Fades page content in on navigation.
 *
 * Opacity only, deliberately: a transform here would create a containing
 * block and break the sticky sidebars inside page content. Keyed on the
 * pathname so it replays per route, and short enough never to delay input.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
