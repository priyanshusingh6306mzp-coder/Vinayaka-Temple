import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "./SectionDivider";

export function AboutSection() {
  return (
    <section id="about" className="bg-temple-ivory text-temple-charcoal">
      <SectionDivider className="pt-2 pb-1 max-w-xs mx-auto" />

      <div className="py-4 sm:py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2 text-sm text-temple-charcoal font-medium">
            <MapPin className="w-4 h-4 text-temple-kumkum shrink-0" aria-hidden="true" />
            <span>Inside the JSS University campus, Sector 62, Noida</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center">
            <Button
              asChild
              variant="default"
              className="bg-temple-kumkum hover:bg-temple-kumkum/90 text-white font-medium shadow-sm h-11 px-5"
            >
              {/* Changed href from "#pooja-form" to "/pooja" */}
              <a href="/pooja" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span>Request a Pooja</span>
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border border-temple-charcoal hover:bg-stone-200/50 text-temple-charcoal font-medium h-11 px-5"
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
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Temple Architecture
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
            About Shri Vinayaka Temple
          </h2>
          <SectionDivider />
          <p className="font-devanagari text-base text-temple-kumkum font-medium">
            {SITE_CONFIG.nameHindi}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          <div className="lg:col-span-5 relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-[#B8893B]/25 bg-white/70">
            <Image
              src="/images/ganesha.jpg"
              alt="Black stone Ganesha idol at Shri Vinayaka Temple Noida"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain p-2"
            />
          </div>

          <div className="lg:col-span-7 flex flex-col h-full lg:py-2">
            
            <div className="mt-auto mb-8 space-y-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-temple-charcoal">
                Prayer and Darshan
              </h3>
              <p className="text-base sm:text-lg leading-[1.7] text-temple-charcoal max-w-prose">
                Situated inside the campus of JSS University, Noida, <strong>{SITE_CONFIG.name}</strong> features {SITE_CONFIG.architecture.style.toLowerCase()} and a {SITE_CONFIG.architecture.idol.toLowerCase()}, offering a calm and uncrowded atmosphere for prayer and meditation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-temple-goldText block mb-1">
                  Architectural Style
                </span>
                <span className="text-sm font-medium text-temple-charcoal">
                  South Indian Chola Architecture
                </span>
              </div>

              <div className="p-4 rounded-lg bg-white border border-stone-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-temple-goldText block mb-1">
                  Main Idol
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
