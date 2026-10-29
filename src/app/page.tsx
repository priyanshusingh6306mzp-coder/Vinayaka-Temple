import Link from "next/link";
import { Phone, Clock, MapPin, Calendar, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-temple-ivory text-temple-charcoal">
      {/* Top Bar with Chola motif accent */}
      <header className="border-b border-temple-stoneBorder bg-temple-ivory/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-temple-gold font-serif select-none">ॐ</span>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-temple-charcoal leading-none">
                {SITE_CONFIG.name}
              </h1>
              <p className="text-xs text-temple-gold font-devanagari font-semibold">
                {SITE_CONFIG.nameHindi}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={SITE_CONFIG.contact.telHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-temple-charcoal hover:text-temple-kumkum transition-colors h-11 px-3"
            >
              <Phone className="w-4 h-4 text-temple-kumkum" />
              <span className="hidden sm:inline">{SITE_CONFIG.contact.displayPhone}</span>
            </a>
            <Button asChild variant="default" size="default">
              <a href="#pooja-form">Request Pooja</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Showcase */}
      <section className="relative py-20 px-4 bg-temple-charcoal text-temple-ivory overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-temple-charcoalCard via-temple-charcoal to-black opacity-90" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-temple-gold/40 bg-temple-charcoalCard text-temple-goldLight text-xs tracking-wider uppercase font-medium">
            <span>Chola Architecture &amp; Black Stone Sanctum</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            {SITE_CONFIG.tagline}
          </h2>

          <p className="font-devanagari text-lg sm:text-xl text-temple-goldLight">
            {SITE_CONFIG.taglineHindi}
          </p>

          <p className="text-base sm:text-lg text-temple-sandstone/85 max-w-2xl mx-auto leading-relaxed">
            Located inside the calm greens of JSS Academy in Sector 62, Noida. A clean, sacred, and uncrowded sanctuary for quiet devotion.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
              <a href="#pooja-form" className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Request a Pooja
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-temple-ivory border-temple-gold/50 hover:bg-temple-gold/20">
              <a href="#visit" className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Plan Your Visit
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Information Strip */}
      <section id="visit" className="py-12 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Timings */}
          <div className="p-6 rounded-lg border border-temple-stoneBorder bg-temple-sandstone/40 space-y-3">
            <div className="flex items-center gap-2 text-temple-gold font-serif text-lg font-bold">
              <Clock className="w-5 h-5 text-temple-kumkum" />
              <h3>Darshan Timings</h3>
            </div>
            {SITE_CONFIG.timings.map((t, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-temple-charcoal block">{t.session} ({t.sessionHindi})</span>
                <span className="text-temple-kumkum font-medium block">{t.time}</span>
                <span className="text-xs text-temple-warmGrey">{t.description}</span>
              </div>
            ))}
          </div>

          {/* Location */}
          <div className="p-6 rounded-lg border border-temple-stoneBorder bg-temple-sandstone/40 space-y-3">
            <div className="flex items-center gap-2 text-temple-gold font-serif text-lg font-bold">
              <MapPin className="w-5 h-5 text-temple-kumkum" />
              <h3>Temple Location</h3>
            </div>
            <p className="text-sm text-temple-charcoal leading-relaxed">
              {SITE_CONFIG.location.fullAddress}
            </p>
            <div className="pt-2 text-xs text-temple-warmGrey">
              <strong>Nearest Metro:</strong> {SITE_CONFIG.transit.nearestMetro}
            </div>
          </div>

          {/* Peace & Amenities */}
          <div className="p-6 rounded-lg border border-temple-stoneBorder bg-temple-sandstone/40 space-y-3">
            <div className="flex items-center gap-2 text-temple-gold font-serif text-lg font-bold">
              <ShieldCheck className="w-5 h-5 text-temple-kumkum" />
              <h3>Devotee Amenities</h3>
            </div>
            <ul className="text-sm text-temple-charcoal space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-temple-gold font-bold">•</span>
                <span>Free on-site parking inside JSS campus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-temple-gold font-bold">•</span>
                <span>Clean restrooms and foot-washing taps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-temple-gold font-bold">•</span>
                <span>Serene meditation courtyard, quiet environment</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-temple-stoneBorder py-8 px-4 bg-temple-sandstone/20 text-center text-sm text-temple-warmGrey">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/admin/login" className="hover:text-temple-charcoal underline">
              Priest / Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
