import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";
import { DarshanStatusBadge } from "./DarshanStatusBadge";

export function HeroSection() {
  return (
    <section className="relative w-full bg-temple-ivory text-temple-charcoal flex flex-col items-center justify-center py-4 sm:py-6 lg:py-8 px-4 lg:px-12 overflow-hidden">
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
