import { cn } from "@/lib/cn";
import type { SeriesPoint } from "@/data/progress";

type LineChartProps = {
  /** Unique within the page — namespaces the fill gradient. */
  id: string;
  data: SeriesPoint[];
  /** Appended to point tooltips. */
  unit?: string;
  /** Overrides the auto-fitted y domain. */
  domain?: { min: number; max: number };
  /** Number of horizontal grid lines (and y-axis labels). */
  ticks?: number;
  formatValue?: (value: number) => string;
  className?: string;
};

const WIDTH = 720;
const HEIGHT = 280;
const PAD_Y = 16;
// Keeps the first and last dots from being clipped by the viewBox edge.
const PAD_X = 10;

/**
 * Dependency-free line/area chart. The plot is a fixed-viewBox SVG that scales
 * uniformly — so dots stay round and strokes stay even — while axis labels are
 * real HTML, positioned as a percentage of the plot height so they line up with
 * the grid exactly at any width.
 */
export function LineChart({
  id,
  data,
  unit = "",
  domain,
  ticks = 4,
  formatValue = (value) => String(value),
  className,
}: LineChartProps) {
  const gradientId = `line-fill-${id}`;
  const values = data.map((point) => point.value);

  // Pad the auto domain so the line never touches the frame.
  const rawMin = domain?.min ?? Math.min(...values);
  const rawMax = domain?.max ?? Math.max(...values);
  const span = rawMax - rawMin || 1;
  const min = domain?.min ?? rawMin - span * 0.18;
  const max = domain?.max ?? rawMax + span * 0.18;

  const plotHeight = HEIGHT - PAD_Y * 2;

  const plotWidth = WIDTH - PAD_X * 2;
  const x = (index: number) =>
    data.length === 1
      ? WIDTH / 2
      : PAD_X + (index / (data.length - 1)) * plotWidth;
  const y = (value: number) =>
    PAD_Y + plotHeight - ((value - min) / (max - min)) * plotHeight;

  const linePath = data
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.value)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1)} ${HEIGHT} L ${x(0)} ${HEIGHT} Z`;

  const gridValues = Array.from(
    { length: ticks },
    (_, index) => min + ((max - min) / (ticks - 1)) * index,
  ).reverse();

  return (
    <figure className={cn("flex flex-col gap-4", className)}>
      <div className="relative">
        {/* Y axis, aligned to the grid by percentage */}
        <div className="absolute inset-y-0 left-0 w-9" aria-hidden="true">
          {gridValues.map((value) => (
            <span
              key={value}
              style={{ top: `${(y(value) / HEIGHT) * 100}%` }}
              className="text-fog absolute right-1.5 -translate-y-1/2 text-[10px] font-semibold tabular-nums"
            >
              {formatValue(value)}
            </span>
          ))}
        </div>

        <div className="pl-9">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`Line chart with ${data.length} points, from ${formatValue(
              values[0],
            )}${unit} to ${formatValue(values[values.length - 1])}${unit}`}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
              </linearGradient>
            </defs>

            {gridValues.map((value) => (
              <line
                key={value}
                x1="0"
                x2={WIDTH}
                y1={y(value)}
                y2={y(value)}
                stroke="currentColor"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                className="text-chalk/8"
              />
            ))}

            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="#ff5a1f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />

            {data.map((point, index) => {
              const isLast = index === data.length - 1;
              return (
                <g key={point.label}>
                  <circle
                    cx={x(index)}
                    cy={y(point.value)}
                    r={isLast ? 6 : 4}
                    fill={isLast ? "#ff5a1f" : "#0b0b0d"}
                    stroke="#ff5a1f"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Generous transparent hit area for the native tooltip */}
                  <circle cx={x(index)} cy={y(point.value)} r="16" fill="transparent">
                    <title>{`${point.label}: ${formatValue(point.value)}${unit}`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* X axis — only the ends on phones, every point from sm up */}
      <ul className="text-fog flex items-center justify-between pl-9 text-[10px] font-semibold tracking-[0.1em] uppercase">
        {data.map((point, index) => (
          <li
            key={point.label}
            className={cn(
              index !== 0 && index !== data.length - 1 && "hidden sm:block",
              index === data.length - 1 && "text-accent-400",
            )}
          >
            {point.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}
