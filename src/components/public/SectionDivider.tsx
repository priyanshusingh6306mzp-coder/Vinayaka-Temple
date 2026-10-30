interface SectionDividerProps {
  className?: string;
}

export function SectionDivider({ className = "my-4 max-w-xs mx-auto" }: SectionDividerProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      aria-hidden="true"
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/30 to-amber-700/60" />
      <svg
        className="w-3.5 h-3.5 text-amber-700/70 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3c-1.5 3-4 6-4 9a4 4 0 0 0 8 0c0-3-2.5-6-4-9z" />
        <path d="M8 12c-2.5-1.5-5-1-6 1 1 3 4 4 6 3" />
        <path d="M16 12c2.5-1.5 5-1 6 1-1 3-4 4-6 3" />
        <path d="M10 18c1 1 3 1 4 0" />
      </svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-700/30 to-amber-700/60" />
    </div>
  );
}
