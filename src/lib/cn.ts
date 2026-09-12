import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, letting later Tailwind utilities win.
 * Every component takes a `className` prop that is merged with this.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
