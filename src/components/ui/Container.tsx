import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
} as const;

type ContainerProps = HTMLAttributes<HTMLElement> & {
  /** Element to render. Defaults to a plain `div`. */
  as?: ElementType;
  size?: keyof typeof sizes;
};

/** Horizontal gutter + max width used by every section on the site. */
export function Container({
  as: Tag = "div",
  size = "xl",
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full px-5 sm:px-8 lg:px-10", sizes[size], className)}
      {...props}
    />
  );
}
