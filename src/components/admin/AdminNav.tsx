"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Calendar, CalendarDays, Images, LogOut, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminNavProps {
  pendingCount?: number;
}

export function AdminNav({ pendingCount = 0 }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-temple-stoneBorder shadow-sm w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand / Title */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/requests"
            className="flex items-center gap-2 text-temple-charcoal hover:opacity-90 transition-opacity min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-temple-sandstone flex items-center justify-center text-temple-kumkum font-bold text-sm shrink-0">
              ॐ
            </div>
            <div className="truncate">
              <p className="font-serif font-bold text-sm sm:text-lg leading-tight truncate">
                Temple Portal
              </p>
              <p className="text-[10px] sm:text-[11px] text-temple-warmGrey font-devanagari truncate">
                श्री विनायक प्रबंधन
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            asChild
            variant={pathname.startsWith("/admin/requests") ? "default" : "ghost"}
            size="sm"
            className={
              pathname.startsWith("/admin/requests")
                ? "h-9 sm:h-10 px-2 sm:px-4 bg-temple-charcoal text-white hover:bg-temple-charcoalCard text-xs font-semibold"
                : "h-9 sm:h-10 px-2 sm:px-4 text-xs font-semibold text-temple-charcoal hover:bg-temple-sandstone/40"
            }
          >
            <Link
              href="/admin/requests"
              aria-label="Pooja Requests"
              className="inline-flex items-center gap-1 sm:gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-temple-goldText" aria-hidden="true" />
              <span className="hidden xs:inline">Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-temple-kumkum text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          </Button>

          <Button
            asChild
            variant={pathname.startsWith("/admin/events") ? "default" : "ghost"}
            size="sm"
            className={
              pathname.startsWith("/admin/events")
                ? "h-9 sm:h-10 px-2 sm:px-4 bg-temple-charcoal text-white hover:bg-temple-charcoalCard text-xs font-semibold"
                : "h-9 sm:h-10 px-2 sm:px-4 text-xs font-semibold text-temple-charcoal hover:bg-temple-sandstone/40"
            }
          >
            <Link
              href="/admin/events"
              aria-label="Temple Events"
              className="inline-flex items-center gap-1 sm:gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-temple-goldText" aria-hidden="true" />
              <span className="hidden xs:inline">Events</span>
            </Link>
          </Button>

          <Button
            asChild
            variant={pathname.startsWith("/admin/gallery") ? "default" : "ghost"}
            size="sm"
            className={
              pathname.startsWith("/admin/gallery")
                ? "h-9 sm:h-10 px-2 sm:px-4 bg-temple-charcoal text-white hover:bg-temple-charcoalCard text-xs font-semibold"
                : "h-9 sm:h-10 px-2 sm:px-4 text-xs font-semibold text-temple-charcoal hover:bg-temple-sandstone/40"
            }
          >
            <Link
              href="/admin/gallery"
              aria-label="Gallery Management"
              className="inline-flex items-center gap-1 sm:gap-1.5"
            >
              <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-temple-goldText" aria-hidden="true" />
              <span className="hidden xs:inline">Gallery</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-10 px-2 sm:px-3 text-xs font-semibold text-temple-warmGrey hover:bg-temple-sandstone/30 hidden md:inline-flex"
            title="Change Admin Password"
          >
            <Link
              href="/admin/change-password"
              aria-label="Change Admin Password"
              className="inline-flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden lg:inline">Password</span>
            </Link>
          </Button>

          {/* Visible Logout Button on Every Admin Page */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            aria-label="Logout of Admin Portal"
            className="h-9 sm:h-10 px-2 sm:px-3 text-xs font-semibold border-temple-stoneBorder text-temple-charcoal hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 sm:mr-1 text-temple-warmGrey" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
