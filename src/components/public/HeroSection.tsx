import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";
import { DarshanStatusBadge } from "./DarshanStatusBadge";

export function HeroSection() {
  return (
    <section className="relative w-full bg-[#12100E] text-[#FBF8F2] flex flex-col items-center justify-center py-4 sm:py-6 px-4 overflow-hidden border-b border-stone-800">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-2.5 sm:space-y-3.5">
        {/* 1. H1 Heading */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FBF8F2] leading-tight">
          {SITE_CONFIG.name}
        </h1>

        {/* 2. Idol Photo: strict vertical center, never crops head or feet */}
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
            className="max-h-[46vh] sm:max-h-[50vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-stone-800/80"
          />
        </div>

        {/* 3. Subtitle 1 (English, elegant serif, muted gold / warm cream) */}
        <p className="font-serif text-sm sm:text-base tracking-wide text-amber-200/90 max-w-xl">
          {SITE_CONFIG.tagline}
        </p>

        {/* 4. Subtitle 2 (Hindi, smaller, lighter warm cream, lang="hi") */}
        <p
          lang="hi"
          className="font-devanagari text-xs sm:text-sm text-stone-300/90 tracking-wide"
        >
          {SITE_CONFIG.taglineHindi}
        </p>

        {/* 5. Open-Now Badge (Asia/Kolkata live status with fixed height) */}
        <div className="pt-1">
          <DarshanStatusBadge />
        </div>
      </div>
    </section>
  );
}
