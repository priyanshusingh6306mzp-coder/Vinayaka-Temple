import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "./SectionDivider";

export function AboutSection() {
  return (
    <section id="about" className="bg-temple-ivory text-temple-charcoal border-b border-temple-stoneBorder">
      {/* Intro Action Bar directly below Hero */}
      <div className="border-b border-temple-stoneBorder bg-stone-100/70 py-4 sm:py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-sm text-temple-charcoal font-medium">
            <MapPin className="w-4 h-4 text-temple-kumkum shrink-0" aria-hidden="true" />
            <span>Inside the JSS Academy campus, Sector 62, Noida</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
            <Button
              asChild
              variant="default"
              size="default"
              className="bg-temple-kumkum hover:bg-temple-kumkum/90 text-white font-medium shadow-sm h-11 px-5 focus-visible:ring-2 focus-visible:ring-temple-gold"
            >
              <a href="#pooja-form" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Request a Pooja</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="default"
              className="border-stone-300 hover:bg-stone-200/60 text-temple-charcoal font-medium h-11 px-5 focus-visible:ring-2 focus-visible:ring-temple-gold"
            >
              <a href="#location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-600" aria-hidden="true" />
                <span>Plan Your Visit</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="py-14 sm:py-20 md:py-24 px-4 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Sacred Sanctuary &amp; Heritage
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            About Shri Vinayaka Temple
          </h2>
          <SectionDivider />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            परम पावन श्री महागणपति दिव्य दर्शन
          </p>
        </div>

        {/* Two-Column Grid (Image + Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Column 1: Deity Photo */}
          <div className="lg:col-span-5 relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-temple-stoneBorder bg-temple-charcoal">
            <Image
              src="/images/hero-ganesha.webp"
              alt="Black stone Ganesha idol at Shri Vinayaka Temple Noida"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain bg-black/40 p-2"
            />
          </div>

          {/* Column 2: Dignified Text (Restrained measure <65 chars/line, 17-18px) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-base sm:text-lg leading-[1.7] text-temple-charcoal/90 max-w-prose">
              <p>
                <strong className="font-serif text-xl font-bold text-temple-charcoal block mb-1">
                  A Quiet Sanctuary for Prayer and Darshan
                </strong>
                Situated inside the campus of JSS Academy of Technical Education, C-20/1, C Block, Phase 2, Industrial Area, Sector 62, Noida,
                <strong> {SITE_CONFIG.name}</strong> offers a calm, clean, and uncrowded place of worship.
              </p>

              <p>
                The temple enshrines a <strong>black stone Ganesha idol</strong>, sculpted in the traditional style of <strong>South Indian Chola architecture</strong>.
              </p>

              <p>
                Devotees visit for its <strong>calm, clean, and uncrowded atmosphere</strong>, which provides a serene setting for prayer, meditation, and spiritual reflection.
              </p>
            </div>

            {/* Quick Fact Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-temple-sandstone/60 border border-temple-stoneBorder">
                <span className="text-xs uppercase font-bold text-temple-goldText block mb-1">
                  Architectural Style
                </span>
                <span className="text-sm font-medium text-temple-charcoal">
                  South Indian Chola Architecture
                </span>
              </div>

              <div className="p-4 rounded-lg bg-temple-sandstone/60 border border-temple-stoneBorder">
                <span className="text-xs uppercase font-bold text-temple-goldText block mb-1">
                  Sacred Deity
                </span>
                <span className="text-sm font-medium text-temple-charcoal">
                  Black Stone Ganesha Idol
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
