import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";
import { DarshanStatusBadge } from "./DarshanStatusBadge";

export function HeroSection() {
  return (
    <section className="relative w-full bg-temple-ivory text-temple-charcoal flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 px-4 lg:px-12 overflow-hidden">
      {/* Subtle traditional South Indian Chola-style decorative elements (watermark gold #B8893B, purely visual, desktop-only) */}
      {/* 1. Hanging temple bell (toran) motif along the top edge */}
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

      {/* 2. Subtle stone-carved Chola pillar motif framing left margin */}
      <div
        className="absolute left-2 xl:left-8 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none opacity-20 text-[#B8893B]"
        aria-hidden="true"
      >
        <svg
          className="w-8 xl:w-10 h-auto max-h-[460px]"
          viewBox="0 0 44 480"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Capital: Bodhigai (Corbel / Bracket) */}
          <path d="M 6,12 L 38,12 L 38,20 C 33,23 27,23 22,23 C 17,23 11,23 6,20 Z" strokeWidth="1.2" />
          <path d="M 22,23 L 22,30" strokeWidth="1" />
          <circle cx="22" cy="30" r="1.5" fill="currentColor" />

          {/* Palagai (Abacus plate) */}
          <rect x="8" y="32" width="28" height="6" rx="1" strokeWidth="1.2" />

          {/* Idal / Padmabandha (Lotus necking) */}
          <path d="M 12,38 C 10,44 14,50 22,50 C 30,50 34,44 32,38 Z" strokeWidth="1.2" />

          {/* Kumbha (Bulbous cushion / pot) */}
          <path d="M 15,50 C 8,58 8,64 14,70 L 30,70 C 36,64 36,58 29,50 Z" strokeWidth="1.2" />
          <line x1="13" y1="60" x2="31" y2="60" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

          {/* Neck band */}
          <rect x="15" y="70" width="14" height="8" rx="0.5" strokeWidth="1" />

          {/* Main Shaft (Stambha) with fluting and ornamental bands */}
          <line x1="16" y1="78" x2="16" y2="400" strokeWidth="1.2" />
          <line x1="28" y1="78" x2="28" y2="400" strokeWidth="1.2" />
          <line x1="20" y1="78" x2="20" y2="400" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="24" y1="78" x2="24" y2="400" strokeWidth="0.8" strokeDasharray="3,3" />

          {/* Central Ratna-patta (Jeweled lozenge medallion) */}
          <line x1="14" y1="226" x2="30" y2="226" strokeWidth="1" />
          <polygon points="22,228 30,239 22,250 14,239" strokeWidth="1.2" />
          <circle cx="22" cy="239" r="2.5" fill="currentColor" />
          <line x1="14" y1="252" x2="30" y2="252" strokeWidth="1" />

          {/* Lower Shaft Band */}
          <rect x="14" y="400" width="16" height="12" rx="0.5" strokeWidth="1" />
          <line x1="14" y1="406" x2="30" y2="406" strokeWidth="0.8" />

          {/* Base: Adhishthana (Padma, Kumuda, Upana plinth) */}
          <path d="M 14,412 C 10,422 10,428 12,434 L 32,434 C 34,428 34,422 30,412 Z" strokeWidth="1.2" />
          <path d="M 10,434 C 7,440 7,446 10,450 L 34,450 C 37,446 37,440 34,434 Z" strokeWidth="1.2" />
          <path d="M 8,450 L 36,450 L 38,460 L 6,460 Z" strokeWidth="1.2" />
          <rect x="4" y="460" width="36" height="10" rx="1" strokeWidth="1.2" />
        </svg>
      </div>

      {/* 3. Subtle stone-carved Chola pillar motif framing right margin (mirrored) */}
      <div
        className="absolute right-2 xl:right-8 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none opacity-20 text-[#B8893B] scale-x-[-1]"
        aria-hidden="true"
      >
        <svg
          className="w-8 xl:w-10 h-auto max-h-[460px]"
          viewBox="0 0 44 480"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Capital: Bodhigai (Corbel / Bracket) */}
          <path d="M 6,12 L 38,12 L 38,20 C 33,23 27,23 22,23 C 17,23 11,23 6,20 Z" strokeWidth="1.2" />
          <path d="M 22,23 L 22,30" strokeWidth="1" />
          <circle cx="22" cy="30" r="1.5" fill="currentColor" />

          {/* Palagai (Abacus plate) */}
          <rect x="8" y="32" width="28" height="6" rx="1" strokeWidth="1.2" />

          {/* Idal / Padmabandha (Lotus necking) */}
          <path d="M 12,38 C 10,44 14,50 22,50 C 30,50 34,44 32,38 Z" strokeWidth="1.2" />

          {/* Kumbha (Bulbous cushion / pot) */}
          <path d="M 15,50 C 8,58 8,64 14,70 L 30,70 C 36,64 36,58 29,50 Z" strokeWidth="1.2" />
          <line x1="13" y1="60" x2="31" y2="60" strokeWidth="0.8" strokeDasharray="1.5,1.5" />

          {/* Neck band */}
          <rect x="15" y="70" width="14" height="8" rx="0.5" strokeWidth="1" />

          {/* Main Shaft (Stambha) with fluting and ornamental bands */}
          <line x1="16" y1="78" x2="16" y2="400" strokeWidth="1.2" />
          <line x1="28" y1="78" x2="28" y2="400" strokeWidth="1.2" />
          <line x1="20" y1="78" x2="20" y2="400" strokeWidth="0.8" strokeDasharray="3,3" />
          <line x1="24" y1="78" x2="24" y2="400" strokeWidth="0.8" strokeDasharray="3,3" />

          {/* Central Ratna-patta (Jeweled lozenge medallion) */}
          <line x1="14" y1="226" x2="30" y2="226" strokeWidth="1" />
          <polygon points="22,228 30,239 22,250 14,239" strokeWidth="1.2" />
          <circle cx="22" cy="239" r="2.5" fill="currentColor" />
          <line x1="14" y1="252" x2="30" y2="252" strokeWidth="1" />

          {/* Lower Shaft Band */}
          <rect x="14" y="400" width="16" height="12" rx="0.5" strokeWidth="1" />
          <line x1="14" y1="406" x2="30" y2="406" strokeWidth="0.8" />

          {/* Base: Adhishthana (Padma, Kumuda, Upana plinth) */}
          <path d="M 14,412 C 10,422 10,428 12,434 L 32,434 C 34,428 34,422 30,412 Z" strokeWidth="1.2" />
          <path d="M 10,434 C 7,440 7,446 10,450 L 34,450 C 37,446 37,440 34,434 Z" strokeWidth="1.2" />
          <path d="M 8,450 L 36,450 L 38,460 L 6,460 Z" strokeWidth="1.2" />
          <rect x="4" y="460" width="36" height="10" rx="1" strokeWidth="1.2" />
        </svg>
      </div>
      <div className="w-full max-w-3xl lg:max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_auto_auto_1fr] gap-2.5 sm:gap-3.5 lg:gap-x-12 lg:gap-y-3.5 items-center text-center lg:text-left">
        {/* 1. H1 Heading (DOM 1st: mobile row 1, desktop col 1 row 2) */}
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-temple-charcoal leading-tight lg:col-start-1 lg:row-start-2 lg:text-left m-0">
          {SITE_CONFIG.name}
        </h1>

        {/* 2. Idol Photo (DOM 2nd: mobile row 2, desktop col 2 rows 1-6 vertically centered) */}
        <div className="relative flex justify-center items-center my-1 lg:my-0 lg:col-start-2 lg:row-start-1 lg:row-span-6 lg:justify-end">
          <Image
            src="/images/hero-ganesha.webp"
            alt="Black stone idol of Lord Ganesha at Shri Vinayaka Temple"
            width={960}
            height={1280}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoQABUAPzmEuVOvKKWisAgB4CcJbACdMoACjbb9wMGEUoCGOoAA/i42TFIZiGQKCsqs7cewQwkThY3/Aex5z99XKag2BRyKxlSBoSbwv+V2+wLmR1C4qMewLkqeIMsYrjXO0Ew2fUls7tfUsAlXV4fu1iDwAXUNaFv8hn3PjepXf3cdNWNcgAAA"
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
