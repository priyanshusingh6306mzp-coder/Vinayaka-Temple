import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 bg-temple-ivory text-temple-charcoal border-b border-temple-stoneBorder">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Sacred Sanctuary &amp; Heritage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            About Shri Vinayaka Temple
          </h2>
          <div className="gold-divider max-w-xs mx-auto my-3" />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            परम पावन श्री महागणपति दिव्य दर्शन
          </p>
        </div>

        {/* Two-Column Grid (Image + Text) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Column 1: Artwork / Sculpture Image */}
          <div className="lg:col-span-5 relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-temple-stoneBorder bg-temple-charcoal">
            <Image
              src="/images/about-placeholder.svg"
              alt="Black stone Ganesha idol at Shri Vinayaka Temple Noida"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>

          {/* Column 2: Dignified Text (Only facts provided by client) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-temple-charcoal/90">
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
