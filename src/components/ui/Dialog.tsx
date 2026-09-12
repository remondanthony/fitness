"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Modal built on the native <dialog> element, so focus trapping, Esc handling
 * and inertness come from the platform rather than a dependency.
 */
export function Dialog({ open, onClose, title, description, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (event.target === ref.current) onClose();
      }}
      className="bg-ink-850 text-chalk border-chalk/12 shadow-lift m-auto w-[calc(100vw-2rem)] max-w-lg rounded-3xl border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-chalk text-3xl">{title}</h2>
            {description ? (
              <p className="text-mist mt-3 text-sm leading-relaxed">{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="border-chalk/12 bg-chalk/5 text-mist hover:border-chalk/30 hover:text-chalk inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7">{children}</div>
      </div>
    </dialog>
  );
}
