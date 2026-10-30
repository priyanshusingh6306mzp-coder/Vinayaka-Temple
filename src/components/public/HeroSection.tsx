import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";
import { DarshanStatusBadge } from "./DarshanStatusBadge";

export function HeroSection() {
  return (
    <section className="relative w-full bg-temple-ivory text-temple-charcoal flex flex-col items-center justify-center py-4 sm:py-6 px-4 overflow-hidden">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-2.5 sm:space-y-3.5">
        {/* 1. H1 Heading (charcoal #16130F) */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-temple-charcoal leading-tight">
          {SITE_CONFIG.name}
        </h1>

        {/* 2. Idol Photo: strict vertical center, never crops head or feet. 1px gold-tinted border, NO shadow */}
        <div className="relative flex justify-center items-center my-1">
          <Image
            src="/images/hero-ganesha.webp"
            alt="Black stone idol of Lord Ganesha at Shri Vinayaka Temple"
            width={960}
            height={1280}
            priority
            fetchPriority="high"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoQABUAPzmEuVOvKKWisAgB4CcJbACdMoACjbb9wMGEUoCGOoAA/i42TFIZiGQKCsqs7cewQwkThY3/Aex5z99XKag2BRyKxlSBoSbwv+V2+wLmR1C4qMewLkqeIMsYrjXO0Ew2fUls7tfUsAlXV4fu1iDwAXUNaFv8hn3PjepXf3cdNWNcgAAA"
            className="max-h-[46vh] sm:max-h-[50vh] w-auto h-auto object-contain rounded-2xl border border-[#B8893B]/25"
          />
        </div>

        {/* 3. Subtitle 1 (English, elegant serif, dark gold text token #7A5310, WCAG AA compliant on ivory) */}
        <p className="font-serif text-sm sm:text-base tracking-wide text-temple-goldText max-w-xl font-medium">
          {SITE_CONFIG.tagline}
        </p>

        {/* 4. Subtitle 2 (Hindi, smaller, charcoal #16130F, lang="hi") */}
        <p
          lang="hi"
          className="font-devanagari text-xs sm:text-sm text-temple-charcoal tracking-wide"
        >
          {SITE_CONFIG.taglineHindi}
        </p>

        {/* 5. Open-Now Badge (light pill with thin border & charcoal text) */}
        <div className="pt-1">
          <DarshanStatusBadge />
        </div>
      </div>
    </section>
  );
}
