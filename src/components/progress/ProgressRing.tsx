interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ progress, size = 80, strokeWidth = 4 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center border-2 border-border bg-card p-2 shadow-brutal-sm">
      <svg width={size} height={size}>
        {/* Background */}
        <rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={size - strokeWidth}
          height={size - strokeWidth}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress bar (horizontal fill) */}
        <rect
          x={strokeWidth / 2}
          y={size - strokeWidth * 3}
          width={(progress / 100) * (size - strokeWidth)}
          height={strokeWidth * 2}
          fill="hsl(var(--primary))"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-display text-sm font-bold text-foreground">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
