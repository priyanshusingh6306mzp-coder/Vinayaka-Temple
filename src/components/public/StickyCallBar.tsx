import { Phone, Calendar } from "lucide-react";

export function StickyCallBar() {
  return (
    <aside
      aria-label="Quick Actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-temple-charcoal border-t border-temple-gold/30 px-3 py-2 flex items-center gap-2 shadow-2xl backdrop-blur-lg bg-opacity-95"
    >
      {/* Tap-to-Call Link (Hard Requirement: Rendered as <a href="tel:+917982048559">) */}
      <a
        href="tel:+917982048559"
        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-temple-charcoalCard border border-temple-gold/40 text-white font-medium text-sm hover:bg-temple-gold/20 active:scale-95 transition-all select-none focus:outline-none focus:ring-2 focus:ring-temple-gold"
      >
        <Phone className="w-4 h-4 text-temple-goldLight" />
        <span>Call Priest</span>
      </a>

      {/* Book Pooja CTA */}
      <a
        href="#pooja-form"
        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-temple-kumkum text-white font-medium text-sm hover:bg-temple-kumkumHover active:scale-95 transition-all select-none shadow-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        <Calendar className="w-4 h-4" />
        <span>Book Pooja</span>
      </a>
    </aside>
  );
}
