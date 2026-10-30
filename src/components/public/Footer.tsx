import Link from "next/link";
import { Phone, MapPin, Clock, Lock, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-temple-charcoal text-temple-sandstone border-t border-temple-gold/30 pt-16 pb-24 sm:pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Sacred Mantra Header Strip */}
        <div className="text-center space-y-2 border-b border-temple-charcoalCard pb-8">
          <span className="text-2xl text-temple-gold font-serif select-none">ॐ</span>
          <p className="font-devanagari text-lg sm:text-xl text-temple-goldLight font-medium tracking-wide">
            वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
          </p>
          <p className="text-xs text-temple-sandstone/70 italic">
            O Lord with the curved trunk and immense aura like a million suns, remove all obstacles from all our undertakings forever.
          </p>
        </div>

        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Column 1: Quick Links */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-white tracking-wide border-b border-temple-gold/30 pb-2">
              Quick Links
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-temple-goldLight transition-colors">
                  About Temple &amp; Deity
                </a>
              </li>
              <li>
                <a href="#timings" className="hover:text-temple-goldLight transition-colors">
                  Darshan &amp; Aarti Timings
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-temple-goldLight transition-colors">
                  Location &amp; Directions
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-temple-goldLight transition-colors">
                  Temple Photo Gallery
                </a>
              </li>
              <li>
                <a href="#pooja-form" className="hover:text-temple-goldLight transition-colors">
                  Request a Pooja / Homam
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Visit Us */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-white tracking-wide border-b border-temple-gold/30 pb-2">
              Visit Us
            </h2>
            <div className="space-y-3 text-sm text-temple-sandstone/90 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-temple-gold shrink-0 mt-1" />
                <span>{SITE_CONFIG.location.fullAddress}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-temple-gold shrink-0 mt-1" />
                <span>
                  Morning: 6:00 AM – 11:30 AM<br />
                  Evening: 4:30 PM – 8:30 PM (Daily)
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Contact & Support */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-white tracking-wide border-b border-temple-gold/30 pb-2">
              Contact &amp; Support
            </h2>
            <div className="space-y-3 text-sm">
              <p className="text-xs text-temple-sandstone/70">
                For Pooja inquiries, Sankalpa, and special darshan bookings:
              </p>

              {/* Requirement: phone rendered as <a href="tel:+917982048559"> */}
              <div className="pt-1">
                <a
                  href="tel:+917982048559"
                  className="inline-flex items-center gap-2 text-base font-bold text-temple-goldLight hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-temple-kumkum" />
                  <span>079820 48559</span>
                </a>
              </div>

              <div>
                <a
                  href={SITE_CONFIG.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 font-medium"
                >
                  <span>Inquire via WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="pt-3 border-t border-temple-charcoalCard">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-xs text-temple-sandstone/60 hover:text-temple-goldLight transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Priest / Admin Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Rights Strip */}
        <div className="pt-8 border-t border-temple-charcoalCard flex flex-col sm:flex-row items-center justify-between text-xs text-temple-sandstone/60 gap-4">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. Dedicated to Shri Maha Ganapati.</p>
          <p className="text-center sm:text-right">
            Zero-Budget Community Heritage Initiative • Hosted on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
