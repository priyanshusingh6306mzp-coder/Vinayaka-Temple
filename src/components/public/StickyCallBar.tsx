import { Phone, Calendar } from "lucide-react";

export function StickyCallBar() {
  return (
    <aside
      aria-label="Quick Actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-temple-ivory/95 border-t border-[#16130F]/10 px-3 py-2 flex items-center gap-2 shadow-lg backdrop-blur-lg"
    >
      {/* Tap-to-Call Link (Hard Requirement: Rendered as <a href="tel:+917982048559">) */}
      <a
        href="tel:+917982048559"
        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg border border-temple-charcoal bg-white/70 text-temple-charcoal font-medium text-sm hover:bg-stone-100 active:scale-95 transition-all select-none focus:outline-none focus:ring-2 focus:ring-stone-700"
      >
        <Phone className="w-4 h-4 text-temple-kumkum" />
        <span>Call Priest</span>
      </a>

      {/* Book Pooja CTA */}
      <a
        href="#pooja-form"
        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-temple-kumkum text-white font-medium text-sm hover:bg-temple-kumkumHover active:scale-95 transition-all select-none shadow-md focus:outline-none focus:ring-2 focus:ring-stone-700"
      >
        <Calendar className="w-4 h-4" />
        <span>Book Pooja</span>
      </a>
    </aside>
  );
}
