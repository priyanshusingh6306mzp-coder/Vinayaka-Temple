import Image from "next/image";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[560px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-temple-charcoal text-white">
      {/* Background Hero Image with Priority (Zero Layout Shift) */}
      <div className="absolute inset-0 select-none">
        <Image
          src="/images/hero-placeholder.svg"
          alt="Shri Vinayaka Temple Sanctum Sanctorum and Chola Architecture Tower"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center opacity-40 mix-blend-luminosity transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Dark linear gradient overlay ensuring WCAG AAA crisp readability for white text */}
        <div className="absolute inset-0 bg-gradient-to-t from-temple-charcoal via-temple-charcoal/85 to-temple-charcoal/60" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        {/* Heritage Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-temple-gold/50 bg-temple-charcoalCard/90 text-temple-goldLight text-xs tracking-wider uppercase font-medium shadow-sm backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-temple-gold" />
          <span>Traditional South Indian Chola Architecture</span>
        </div>

        {/* Primary Headline */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            {SITE_CONFIG.tagline}
          </h1>
          <p className="font-devanagari text-lg sm:text-2xl text-temple-goldLight font-semibold">
            {SITE_CONFIG.taglineHindi}
          </p>
        </div>

        {/* Narrative Subtitle */}
        <p className="text-base sm:text-lg text-temple-sandstone/90 max-w-2xl mx-auto leading-relaxed">
          Sanctified inside the tranquil campus of JSS Academy of Technical Education in Sector 62, Noida.
          A peaceful abode featuring a striking black stone Ganesha idol, untouched by crowd or noise.
        </p>

        {/* Primary & Secondary Call to Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg hover:shadow-xl"
          >
            <a href="#pooja-form" className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Request a Pooja</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-8 text-base font-semibold text-white border-temple-gold/60 hover:bg-temple-gold/20"
          >
            <a href="#location" className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-temple-goldLight" />
              <span>Plan Your Visit</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
