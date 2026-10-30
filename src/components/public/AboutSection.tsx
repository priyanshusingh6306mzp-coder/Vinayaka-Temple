import Image from "next/image";
import { SITE_CONFIG } from "@/content/site";

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 bg-temple-ivory text-temple-charcoal border-b border-temple-stoneBorder">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-2">
          <span className="text-xs uppercase font-semibold tracking-widest text-temple-gold block">
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
              alt="Hand-carved black granite stone idol of Lord Ganesha at Shri Vinayaka Temple Noida"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>

          {/* Column 2: Dignified Text (Only facts from site.ts) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-temple-charcoal/90">
              <p>
                <strong className="font-serif text-xl font-bold text-temple-charcoal block mb-1">
                  A Solitary Sanctuary for Quiet Reflection
                </strong>
                Nestled inside the leafy academic campus of JSS Academy of Technical Education in Sector 62, Noida,
                <strong> {SITE_CONFIG.name}</strong> stands as a serene spiritual refuge from the rush of the surrounding city.
              </p>

              <p>
                The temple enshrines a striking <strong>black granite stone Ganesha idol (Kala Shilpa)</strong>,
                meticulously sculpted in the timeless tradition of <strong>South Indian Chola architecture</strong>.
                Carved with classical Dravidian precision, Lord Vinayaka is depicted in a graceful blessing posture,
                symbolizing the removal of obstacles, the bestowal of intellect, and protection for all devotees.
              </p>

              <p>
                Unlike large pilgrimage centres, this temple is cherished by devotees for its <strong>clean, uncrowded, and serene atmosphere</strong>.
                Filled with the scent of natural stone, fresh incense, and lamp-oil at dawn and dusk, the peaceful courtyard provides an ideal haven
                for meditation, heartfelt prayers, and students seeking quiet fortitude.
              </p>
            </div>

            {/* Quick Fact Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-temple-sandstone/60 border border-temple-stoneBorder">
                <span className="text-xs uppercase font-bold text-temple-gold block mb-1">
                  Architectural Style
                </span>
                <span className="text-sm font-medium text-temple-charcoal">
                  Traditional South Indian Chola Dravidian Heritage
                </span>
              </div>

              <div className="p-4 rounded-lg bg-temple-sandstone/60 border border-temple-stoneBorder">
                <span className="text-xs uppercase font-bold text-temple-gold block mb-1">
                  Sacred Deity
                </span>
                <span className="text-sm font-medium text-temple-charcoal">
                  Carved Black Granite Stone Shri Maha Ganapati
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
