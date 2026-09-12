"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ImagePlaceholderVariant =
  | "hero"
  | "athlete"
  | "program"
  | "coach"
  | "meal"
  | "generic";

const aspects = {
  hero: "aspect-[4/3] lg:aspect-[5/6]",
  wide: "aspect-[16/9]",
  photo: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  /** Fills its positioned parent instead of setting its own ratio. */
  fill: "h-full w-full",
} as const;

const defaultAlt: Record<ImagePlaceholderVariant, string> = {
  hero: "Illustration of an athlete pressing a barbell overhead in a dark gym",
  athlete: "Illustration of an athlete silhouette",
  program: "Abstract illustration representing a training program",
  coach: "Illustration of a coach portrait",
  meal: "Illustration of a prepared meal bowl",
  generic: "Abstract STRONGER illustration",
};

type ImagePlaceholderProps = {
  variant?: ImagePlaceholderVariant;
  aspect?: keyof typeof aspects;
  /** Accessible description. Pass `""` for purely decorative usage. */
  alt?: string;
  /** Small uppercase chip rendered in the bottom-left corner. */
  caption?: string;
  /** Overlay content rendered above the artwork. */
  children?: ReactNode;
  className?: string;
};

/**
 * Stand-in artwork for every image slot in the product. Pure inline SVG — no
 * network requests, no broken <img> elements — drawn to match the dark
 * athletic aesthetic so it reads as intentional art rather than a missing file.
 */
export function ImagePlaceholder({
  variant = "generic",
  aspect = "wide",
  alt,
  caption,
  children,
  className,
}: ImagePlaceholderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const description = alt ?? defaultAlt[variant];

  return (
    <div
      className={cn(
        "bg-ink-900 border-chalk/8 relative isolate overflow-hidden rounded-2xl border",
        aspects[aspect],
        className,
      )}
      role={description ? "img" : undefined}
      aria-label={description || undefined}
      aria-hidden={description ? undefined : true}
    >
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={id("base")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#131317" />
            <stop offset="55%" stopColor="#0c0c0f" />
            <stop offset="100%" stopColor="#070708" />
          </linearGradient>

          <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.42" />
            <stop offset="55%" stopColor="#ff5a1f" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={id("steel")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3a44" />
            <stop offset="100%" stopColor="#16161a" />
          </linearGradient>

          <linearGradient id={id("ember")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff8038" />
            <stop offset="100%" stopColor="#ff5a1f" />
          </linearGradient>

          <radialGradient id={id("vignette")} cx="50%" cy="45%" r="72%">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.72" />
          </radialGradient>

          <pattern
            id={id("mesh")}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0V40"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Base plate + technical mesh */}
        <rect width="800" height="600" fill={`url(#${id("base")})`} />
        <rect width="800" height="600" fill={`url(#${id("mesh")})`} />

        {variant === "hero" ? <HeroArt id={id} /> : null}
        {variant === "athlete" ? <AthleteArt id={id} /> : null}
        {variant === "program" ? <ProgramArt id={id} /> : null}
        {variant === "coach" ? <CoachArt id={id} /> : null}
        {variant === "meal" ? <MealArt id={id} /> : null}
        {variant === "generic" ? <GenericArt id={id} /> : null}

        {/* Cinematic falloff */}
        <rect width="800" height="600" fill={`url(#${id("vignette")})`} />
      </svg>

      {caption ? (
        <span className="border-chalk/10 bg-ink-950/70 text-mist absolute bottom-4 left-4 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase backdrop-blur-md">
          {caption}
        </span>
      ) : null}

      {children}
    </div>
  );
}

type ArtProps = { id: (name: string) => string };

/** Backlit gym interior: light shafts, a rack and an athlete pressing overhead. */
function HeroArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="400" cy="300" r="300" fill={`url(#${id("glow")})`} />

      {/* Light shafts from the ceiling */}
      <g fill={`url(#${id("sheen")})`} opacity="0.75">
        <path d="M150 0 L250 0 L360 600 L210 600 Z" />
        <path d="M520 0 L580 0 L690 600 L600 600 Z" opacity="0.55" />
      </g>

      {/* Background squat rack */}
      <g stroke={`url(#${id("steel")})`} strokeWidth="14" strokeLinecap="round" opacity="0.85">
        <path d="M120 180 V500" />
        <path d="M232 180 V500" />
        <path d="M660 200 V500" />
        <path d="M748 200 V500" />
      </g>
      <g stroke="#2a2a31" strokeWidth="9" strokeLinecap="round" opacity="0.8">
        <path d="M120 236 H232" />
        <path d="M660 252 H748" />
      </g>

      {/* Floor */}
      <path d="M0 500 H800 V600 H0 Z" fill="#0a0a0c" />
      <path d="M0 500 H800" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="2" />

      {/* Athlete silhouette, overhead press */}
      <g fill="#050506" stroke="#050506" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="400" cy="242" r="22" />
        <rect x="390" y="256" width="20" height="32" rx="9" />
        <path d="M356 296 L444 296 L418 386 L382 386 Z" strokeWidth="26" />
        <g strokeWidth="23" fill="none">
          <path d="M362 302 L336 252 L366 214" />
          <path d="M438 302 L464 252 L434 214" />
        </g>
        <g strokeWidth="29" fill="none">
          <path d="M386 382 L374 440 L368 492" />
          <path d="M414 382 L426 440 L432 492" />
        </g>
        <rect x="342" y="484" width="48" height="17" rx="8" />
        <rect x="410" y="484" width="48" height="17" rx="8" />
      </g>

      {/* Barbell */}
      <g>
        <rect x="250" y="198" width="300" height="11" rx="5.5" fill="#3d3d47" />
        <rect x="250" y="198" width="300" height="4" rx="2" fill="#5a5a68" opacity="0.7" />
        <rect x="226" y="162" width="22" height="84" rx="8" fill="#1d1d22" />
        <rect x="552" y="162" width="22" height="84" rx="8" fill="#1d1d22" />
        <rect x="204" y="176" width="18" height="56" rx="7" fill="#141418" />
        <rect x="578" y="176" width="18" height="56" rx="7" fill="#141418" />
      </g>

      {/* Accent rim on the bar */}
      <rect x="250" y="196" width="300" height="3" rx="1.5" fill={`url(#${id("ember")})`} opacity="0.85" />

      {/* Atmosphere */}
      <g fill="#ffffff" opacity="0.06">
        <circle cx="690" cy="120" r="46" />
        <circle cx="596" cy="78" r="22" />
        <circle cx="104" cy="96" r="30" />
      </g>
    </>
  );
}

/** Cropped, powerful upper-body silhouette with a rim light. */
function AthleteArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="430" cy="280" r="280" fill={`url(#${id("glow")})`} opacity="0.85" />
      <path d="M0 0 L220 0 L420 600 L180 600 Z" fill={`url(#${id("sheen")})`} opacity="0.5" />

      <g fill="#050506" stroke="#050506" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="382" cy="178" r="50" />
        <rect x="360" y="218" width="44" height="56" rx="14" />
        {/* Shoulders + torso */}
        <path d="M282 318 Q382 248 482 318 L512 600 L252 600 Z" />
        {/* Flexed arm */}
        <g strokeWidth="48" fill="none">
          <path d="M478 336 L566 380" />
          <path d="M566 380 L556 276" />
        </g>
        <circle cx="556" cy="268" r="28" />
      </g>

      {/* Rim light along the silhouette edge */}
      <g fill="none" stroke={`url(#${id("ember")})`} strokeWidth="4" opacity="0.5" strokeLinecap="round">
        <path d="M478 320 Q382 252 326 288" />
        <path d="M500 350 L572 386" />
      </g>

      <rect x="0" y="0" width="800" height="600" fill="#000" opacity="0.12" />
    </>
  );
}

/** Abstract program artwork: angled load bars, a weight plate and chevrons. */
function ProgramArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="620" cy="140" r="260" fill={`url(#${id("glow")})`} opacity="0.7" />

      {/* Angled load bars */}
      <g transform="rotate(-24 400 300)">
        <rect x="130" y="240" width="540" height="34" rx="17" fill="#ffffff" opacity="0.07" />
        <rect x="180" y="300" width="440" height="34" rx="17" fill="#ffffff" opacity="0.05" />
        <rect x="230" y="360" width="300" height="34" rx="17" fill={`url(#${id("ember")})`} opacity="0.9" />
      </g>

      {/* Weight plate */}
      <g transform="translate(596 404)">
        <circle r="112" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="30" />
        <circle r="112" fill="none" stroke={`url(#${id("ember")})`} strokeWidth="6" strokeDasharray="120 560" strokeLinecap="round" opacity="0.9" />
        <circle r="34" fill="#0a0a0c" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="4" />
      </g>

      {/* Chevrons */}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
        <path d="M64 468 L112 516 L64 564" />
        <path d="M124 468 L172 516 L124 564" opacity="0.6" />
        <path d="M184 468 L232 516 L184 564" opacity="0.3" />
      </g>
    </>
  );
}

/** Studio portrait framing for coach cards. */
function CoachArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="400" cy="250" r="250" fill={`url(#${id("glow")})`} opacity="0.75" />
      <circle cx="400" cy="262" r="186" fill="#ffffff" opacity="0.04" />
      <circle
        cx="400"
        cy="262"
        r="186"
        fill="none"
        stroke={`url(#${id("ember")})`}
        strokeWidth="5"
        strokeDasharray="300 900"
        strokeLinecap="round"
        opacity="0.8"
      />

      <g fill="#050506">
        <circle cx="400" cy="236" r="76" />
        <path d="M262 600 Q262 418 400 400 Q538 418 538 600 Z" />
      </g>

      <g fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round">
        <path d="M336 178 Q400 140 464 178" />
      </g>

      <path d="M0 520 H800 V600 H0 Z" fill="#060607" opacity="0.7" />
    </>
  );
}

/** Overhead nutrition bowl built from arcs and garnish dots. */
function MealArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="400" cy="300" r="260" fill={`url(#${id("glow")})`} opacity="0.5" />

      <g transform="translate(400 300)">
        <circle r="208" fill="#101014" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="3" />
        <circle r="176" fill="#0b0b0e" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />

        {/* Portions */}
        <path d="M0 0 L0 -168 A168 168 0 0 1 145 84 Z" fill={`url(#${id("ember")})`} opacity="0.78" />
        <path d="M0 0 L145 84 A168 168 0 0 1 -145 84 Z" fill="#ffffff" opacity="0.09" />
        <path d="M0 0 L-145 84 A168 168 0 0 1 0 -168 Z" fill="#ffffff" opacity="0.05" />

        {/* Garnish */}
        <g fill="#ffffff" opacity="0.22">
          <circle cx="66" cy="-78" r="15" />
          <circle cx="104" cy="-30" r="9" />
          <circle cx="28" cy="-116" r="7" />
        </g>
        <g fill="#0a0a0c" opacity="0.65">
          <ellipse cx="-74" cy="96" rx="38" ry="22" transform="rotate(-18 -74 96)" />
          <ellipse cx="6" cy="124" rx="30" ry="18" transform="rotate(12 6 124)" />
        </g>
        <circle r="18" fill="#0a0a0c" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
      </g>

      {/* Utensil */}
      <g stroke="#ffffff" strokeOpacity="0.14" strokeWidth="8" strokeLinecap="round" fill="none">
        <path d="M688 168 V432" />
        <path d="M660 168 V236 Q660 262 688 262" />
      </g>
    </>
  );
}

/** Neutral fallback: orbiting geometry around a dumbbell glyph. */
function GenericArt({ id }: ArtProps) {
  return (
    <>
      <circle cx="400" cy="300" r="270" fill={`url(#${id("glow")})`} opacity="0.6" />

      <g fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2">
        <circle cx="400" cy="300" r="248" />
        <circle cx="400" cy="300" r="182" />
      </g>

      <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2">
        <path d="M0 300 H800" />
        <path d="M400 0 V600" />
      </g>

      {/* Dumbbell glyph */}
      <g transform="translate(400 300)">
        <rect x="-132" y="-13" width="264" height="26" rx="13" fill={`url(#${id("ember")})`} opacity="0.9" />
        <g fill="#1b1b21" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3">
          <rect x="-192" y="-58" width="44" height="116" rx="16" />
          <rect x="148" y="-58" width="44" height="116" rx="16" />
        </g>
        <g fill="#121216">
          <rect x="-226" y="-38" width="30" height="76" rx="12" />
          <rect x="196" y="-38" width="30" height="76" rx="12" />
        </g>
      </g>

      <g fill="#ffffff" opacity="0.07">
        <circle cx="128" cy="122" r="26" />
        <circle cx="676" cy="478" r="34" />
      </g>
    </>
  );
}
