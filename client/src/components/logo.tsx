/**
 * Rivers Real Estate logo
 * Gold-gradient geometric house mark on dark/black background.
 * Per brand guide: minimum size 32px, never recolor or distort.
 * The wordmark "RIVERS REAL ESTATE" is set in Cinzel and lives next to the mark.
 */

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  /** "stack" (default) shows mark + wordmark stacked vertically; "row" shows them side-by-side */
  layout?: "stack" | "row" | "mark";
  className?: string;
  /** When true, sets wordmark color to the surrounding sidebar text color (white on dark) */
  invert?: boolean;
}

export function Logo({
  size = 40,
  showWordmark = true,
  layout = "row",
  className,
  invert = false,
}: LogoProps) {
  const gradientId = `rivers-gold-${size}`;

  // Brand mark: tall house outline (trapezoidal/skewed) with 2x2 window grid.
  // Matches the official Rivers Real Estate logo (gold-on-black/white).
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Rivers Real Estate"
      data-testid="logo-mark"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B8893D" />
          <stop offset="38%" stopColor="#D4AF37" />
          <stop offset="58%" stopColor="#F0D785" />
          <stop offset="100%" stopColor="#9C7424" />
        </linearGradient>
      </defs>
      {/* Outer trapezoidal house silhouette — tall, slightly skewed roofline */}
      <path
        d="M16 8 L52 12 L52 56 L16 56 Z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3"
        strokeLinejoin="miter"
      />
      {/* Inner room outline (offset rectangle) */}
      <path
        d="M22 22 L46 24 L46 56 L22 56 Z"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2.4"
        strokeLinejoin="miter"
      />
      {/* 2x2 window grid */}
      <rect x="30" y="34" width="4" height="4" fill={`url(#${gradientId})`} />
      <rect x="35" y="34" width="4" height="4" fill={`url(#${gradientId})`} />
      <rect x="30" y="39" width="4" height="4" fill={`url(#${gradientId})`} />
      <rect x="35" y="39" width="4" height="4" fill={`url(#${gradientId})`} />
    </svg>
  );

  if (layout === "mark") return <span className={className}>{mark}</span>;

  const wordmarkClass = invert ? "text-white" : "text-foreground";

  if (layout === "stack") {
    return (
      <div className={`flex flex-col items-start gap-2 ${className ?? ""}`}>
        {mark}
        {showWordmark && (
          <div className="flex flex-col leading-tight">
            <span
              className={`font-display text-[11px] tracking-[0.22em] ${wordmarkClass}`}
              style={{ fontWeight: 600 }}
            >
              RIVERS
            </span>
            <span
              className={`font-display text-[8.5px] tracking-[0.32em] ${invert ? "text-white/55" : "text-muted-foreground"}`}
            >
              REAL ESTATE
            </span>
          </div>
        )}
      </div>
    );
  }

  // row
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      {mark}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display text-[13px] tracking-[0.22em] ${wordmarkClass}`}
            style={{ fontWeight: 600 }}
          >
            RIVERS
          </span>
          <span
            className={`font-display text-[9px] tracking-[0.32em] mt-1 ${invert ? "text-white/55" : "text-muted-foreground"}`}
          >
            REAL ESTATE
          </span>
        </div>
      )}
    </div>
  );
}
