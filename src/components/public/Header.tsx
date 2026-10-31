"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Menu, X, Calendar } from "lucide-react";
import { SITE_CONFIG } from "@/content/site";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "About", href: "/#about" },
    { label: "Darshan Timings", href: "/#timings" },
    { label: "Schedule", href: "/schedule" },
    { label: "Location & Directions", href: "/#location" },
    { label: "Gallery", href: "/gallery" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#16130F]/10 bg-temple-ivory/95 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 rounded-lg p-1">
          <span className="text-2xl sm:text-3xl text-temple-goldText font-serif select-none transition-transform group-hover:scale-105" aria-hidden="true">
            ॐ
          </span>
          <div>
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-temple-charcoal leading-none block">
              {SITE_CONFIG.name}
            </span>
            <span className="text-xs text-temple-goldText font-devanagari font-semibold block mt-0.5">
              {SITE_CONFIG.nameHindi}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-temple-charcoal hover:text-temple-kumkum transition-colors py-2 px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700 rounded"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={SITE_CONFIG.contact.telHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-temple-charcoal hover:text-temple-kumkum transition-colors h-11 px-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-700"
            aria-label={`Call temple at ${SITE_CONFIG.contact.displayPhone}`}
          >
            <Phone className="w-4 h-4 text-temple-kumkum" />
            <span>{SITE_CONFIG.contact.displayPhone}</span>
          </a>

          <Button asChild variant="default" size="default" className="bg-temple-kumkum hover:bg-temple-kumkum/90 text-white font-medium shadow-sm h-11 px-5">
            <Link href="/pooja">
              <Calendar className="w-4 h-4 mr-1.5" />
              Request Pooja
            </Link>
          </Button>
        </div>

        {/* Mobile / Tablet Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="text-temple-charcoal"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile / Tablet Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#16130F]/10 bg-temple-ivory px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-temple-charcoal hover:text-temple-kumkum py-2.5 px-3 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#16130F]/10 space-y-2">
            <a
              href={SITE_CONFIG.contact.telHref}
              className="flex items-center gap-3 w-full h-12 px-3 rounded-lg bg-stone-100 font-medium text-sm text-temple-charcoal"
            >
              <Phone className="w-4 h-4 text-temple-kumkum" />
              <span>Call: {SITE_CONFIG.contact.displayPhone}</span>
            </a>

            <Button asChild variant="default" className="w-full h-12 text-base bg-temple-kumkum hover:bg-temple-kumkum/90 text-white font-medium">
              <Link href="/pooja" onClick={() => setMobileMenuOpen(false)}>
                <Calendar className="w-4 h-4 mr-2" />
                Request a Pooja
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}