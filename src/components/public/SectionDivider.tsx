import React from "react";

interface SectionDividerProps {
  className?: string;
  variant?: "center" | "hero";
}

export function SectionDivider({
  className,
  variant = "center",
}: SectionDividerProps) {
  const defaultClasses =
    variant === "hero"
      ? "my-2 w-full max-w-sm mr-auto"
      : "my-8 sm:my-12 max-w-xs mx-auto";

  const resolvedClass = className || defaultClasses;

  return (
    <div
      className={`flex items-center justify-center gap-3 ${resolvedClass}`}
      aria-hidden="true"
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B8893B]/40 to-[#B8893B]/80" />
      <svg
        className="w-3.5 h-3.5 text-[#B8893B] shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C12 2 8 8 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 8 12 2 12 2Z" />
        <path d="M12 17C10.5 17 6 18.5 4 21C7 21.5 10 20.5 12 19C14 20.5 17 21.5 20 21C18 18.5 13.5 17 12 17Z" />
      </svg>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B8893B]/40 to-[#B8893B]/80" />
    </div>
  );
}
