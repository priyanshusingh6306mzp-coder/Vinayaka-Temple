/**
 * Canonical Site URL Helper
 *
 * Single source of truth for absolute URLs across the application:
 * - sitemap.xml
 * - robots.txt
 * - Schema.org JSON-LD structured data
 * - RFC 5545 iCalendar (.ics) downloads
 * - WhatsApp share URLs
 * - Open Graph and Twitter Card metadata
 *
 * Derives strictly from process.env.NEXT_PUBLIC_SITE_URL with a safe fallback
 * for local development (http://localhost:3000).
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
