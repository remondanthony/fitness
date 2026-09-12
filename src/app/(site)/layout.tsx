import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

/** Standard site chrome: skip link, global navigation and footer. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <a
        href="#main"
        className="bg-accent-500 focus:top-4 focus:left-4 sr-only rounded-full px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:z-[100]"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </ToastProvider>
  );
}
