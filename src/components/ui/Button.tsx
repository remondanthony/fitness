import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { LinkPending } from "@/components/ui/LinkPending";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-accent-500 text-white shadow-glow hover:bg-accent-400 active:bg-accent-600",
  secondary:
    "border border-chalk/15 bg-chalk/5 text-chalk hover:border-chalk/30 hover:bg-chalk/10",
  ghost: "text-mist hover:bg-chalk/5 hover:text-chalk",
  link: "text-accent-400 hover:text-accent-300 px-0 py-0 h-auto",
} as const;

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-[15px]",
} as const;

type BaseProps = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Renders full width on small screens, auto from `sm` up. */
  block?: boolean;
  /**
   * Label shown while the navigation this link starts is in flight, e.g.
   * "Starting…". Links only; reflects real navigation state.
   */
  pendingLabel?: string;
  children?: ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: never;
  };

type ButtonAsLink = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function buttonClasses({ variant = "primary", size = "md", block, className }: BaseProps) {
  return cn(
    "group/btn inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold tracking-tight whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    variant === "link" ? "" : sizes[size],
    block && "w-full sm:w-auto",
    className,
  );
}

/**
 * Primary action element. Renders a Next `Link` when `href` is provided and a
 * native `button` otherwise, so semantics always match behaviour.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    block,
    className,
    children,
    pendingLabel,
    ...rest
  } = props;

  const classes = buttonClasses({ variant, size, block, className });

  if ("href" in rest && rest.href) {
    const { href, ...anchorProps } = rest as { href: string } & Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "href"
    >;

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {pendingLabel ? (
          <LinkPending label={pendingLabel}>{children}</LinkPending>
        ) : (
          children
        )}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
