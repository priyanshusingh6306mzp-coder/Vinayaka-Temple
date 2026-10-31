import Link from "next/link";
import { Phone, MapPin, Clock, Lock, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-temple-ivory text-temple-charcoal border-t border-[#16130F]/10 pt-14 pb-24 sm:pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Sacred Mantra Header Strip */}
        <div className="text-center space-y-2 border-b border-[#16130F]/10 pb-8">
          <span className="text-2xl text-temple-goldText font-serif select-none" aria-hidden="true">ॐ</span>
          <p className="font-devanagari text-lg sm:text-xl text-temple-charcoal font-medium tracking-wide">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
          <p className="text-xs text-temple-warmGrey italic max-w-xl mx-auto">
            O Lord with the curved trunk and immense aura like a million suns, remove all obstacles from all our undertakings forever.
          </p>
        </div>

        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Quick Links */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-temple-charcoal tracking-wide border-b border-[#16130F]/10 pb-2">
              Quick Links
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#about" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  About Temple &amp; Deity
                </Link>
              </li>
              <li>
                <Link href="/#timings" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  Darshan &amp; Aarti Timings
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  Schedule &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/#location" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  Location &amp; Directions
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  Temple Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/pooja" className="temple-link-hover text-temple-charcoal hover:text-temple-kumkum transition-colors">
                  Request a Pooja / Homam
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Visit Us */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-temple-charcoal tracking-wide border-b border-[#16130F]/10 pb-2">
              Visit Us
            </h2>
            <div className="space-y-3 text-sm text-temple-charcoal leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-temple-kumkum shrink-0 mt-1" aria-hidden="true" />
                <span>{SITE_CONFIG.location.fullAddress}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-temple-kumkum shrink-0 mt-1" aria-hidden="true" />
                <span>
                  Morning: {SITE_CONFIG.darshanSessions.morning.time}<br />
                  Evening: {SITE_CONFIG.darshanSessions.evening.time} (Daily)
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-temple-charcoal tracking-wide border-b border-[#16130F]/10 pb-2">
              Contact &amp; Support
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-xs text-temple-warmGrey">
                For Pooja inquiries, Sankalpa, and special darshan bookings:
              </p>

              <div className="pt-1">
                <a
                  href={SITE_CONFIG.contact.telHref}
                  className="inline-flex items-center gap-2 text-base font-bold text-temple-charcoal hover:text-temple-kumkum transition-colors"
                >
                  <Phone className="w-4 h-4 text-temple-kumkum" aria-hidden="true" />
                  <span>{SITE_CONFIG.contact.displayPhone}</span>
                </a>
              </div>

              <div>
                <a
                  href={SITE_CONFIG.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-900 font-semibold"
                >
                  <span>Inquire via WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>

              <div className="pt-3 border-t border-[#16130F]/10">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-temple-warmGrey hover:text-temple-charcoal transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Priest / Admin Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights Strip */}
        <div className="pt-8 border-t border-[#16130F]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-temple-warmGrey gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Dedicated to Shri Maha Ganapati.</p>
          <p className="text-center sm:text-right">
            Zero-Budget Community Heritage Initiative • Hosted on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
