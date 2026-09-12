import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: string;
  href?: string;
};

/** Compact trail for detail pages. The final crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="text-fog flex flex-wrap items-center gap-1 text-xs font-semibold tracking-[0.14em] uppercase">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="hover:text-accent-400 inline-block py-1.5 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-mist" : undefined} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <ChevronRight className="text-chalk/25 h-3.5 w-3.5" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
