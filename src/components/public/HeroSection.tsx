import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";
import { DarshanStatusBadge } from "./DarshanStatusBadge";

export function HeroSection() {
  return (
    <section className="relative w-full bg-temple-ivory text-temple-charcoal flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 px-4 lg:px-12 overflow-hidden">
      {/* Single subtle traditional South Indian Chola toran motif along top edge (watermark gold #B8893B, opacity 20%, purely visual, desktop-only) */}
      <div
        className="absolute top-0 inset-x-0 hidden lg:block pointer-events-none overflow-hidden h-9 opacity-20 text-[#B8893B]"
        aria-hidden="true"
      >
        <svg
          className="w-full h-9"
          width="100%"
          height="36"
          viewBox="0 0 1000 36"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="chola-toran-bell"
              width="80"
              height="36"
              patternUnits="userSpaceOnUse"
            >
              {/* Top lintel cord */}
              <line x1="0" y1="2" x2="80" y2="2" stroke="currentColor" strokeWidth="1.2" />
              {/* Scalloped festoon arc */}
              <path
                d="M 0,2 Q 40,20 80,2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M 0,5 Q 40,23 80,5"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
              {/* Mango leaf accents at joints */}
              <path
                d="M 0,2 C 2.5,7 2.5,12 0,16 C -2.5,12 -2.5,7 0,2 Z"
                fill="currentColor"
              />
              {/* Hanging Temple Bell (Ghanta) at festoon apex */}
              <line x1="40" y1="20" x2="40" y2="24" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="24.5" r="1" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <path
                d="M 36,29 C 36,25 44,25 44,29 L 45,31.5 C 45,32.5 43,33.5 40,33.5 C 37,33.5 35,32.5 35,31.5 Z"
                fill="currentColor"
              />
              <circle cx="40" cy="34.5" r="1.2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="36" fill="url(#chola-toran-bell)" />
        </svg>
      </div>

      <div className="w-full max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_auto_auto_1fr] gap-2.5 sm:gap-3.5 lg:gap-x-12 lg:gap-y-3.5 items-center text-center lg:text-left">
        {/* 1. H1 Heading (DOM 1st: mobile row 1, desktop col 1 row 2) */}
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-temple-charcoal leading-tight lg:col-start-1 lg:row-start-2 lg:text-left m-0">
          {SITE_CONFIG.name}
        </h1>

        {/* 2. Idol Photo (DOM 2nd: mobile row 2, desktop col 2 rows 1-6 vertically centered) */}
        <div className="relative flex justify-center items-center my-1 lg:my-0 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:justify-end translate-y-[14px]">
          <Image
            src="/images/temple.jpg"
            alt="Shri Vinayaka Temple"
            width={780}
            height={1040}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRn4AAABXRUJQVlA4IHIAAABQBACdASoQABUAPzmEuVOvKKWisAgB4CcJagCdINiC9WWawishEYiDfMWAAP6MQkIp90hiIqVkkomrh25xQ6Gi30AbLaAREUA/WK49Qqgf+HGy81dk55vQaHhHOWcSjqDBmTRGRwSiCNvNmlvEGzaAAAA="
            sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 480px"
            className="max-h-[46vh] sm:max-h-[48vh] lg:max-h-[min(540px,calc(100svh-120px))] w-auto h-auto object-contain rounded-2xl border border-[#B8893B]/25"
          />
        </div>

        {/* 3. Subtitle 1 (DOM 3rd: mobile row 3, desktop col 1 row 3) */}
        <p className="font-serif text-sm sm:text-base lg:text-lg tracking-wide text-temple-goldText max-w-xl font-medium lg:col-start-1 lg:row-start-3 lg:text-left m-0">
          {SITE_CONFIG.tagline}
        </p>

        {/* 4. Subtitle 2 (DOM 4th: mobile row 4, desktop col 1 row 4) */}
        <p
          lang="hi"
          className="font-devanagari text-xs sm:text-sm lg:text-base text-temple-charcoal tracking-wide lg:col-start-1 lg:row-start-4 lg:text-left m-0"
        >
          {SITE_CONFIG.taglineHindi}
        </p>

        {/* 5. Open-Now Badge (DOM 5th: mobile row 5, desktop col 1 row 5) */}
        <div className="pt-1 lg:col-start-1 lg:row-start-5 flex justify-center lg:justify-start">
          <DarshanStatusBadge />
        </div>
      </div>
    </section>
  );
}
