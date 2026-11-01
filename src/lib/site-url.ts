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
 * Derivation Priority Order:
 * 1. process.env.NEXT_PUBLIC_SITE_URL
 * 2. https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}
 * 3. In production (process.env.NODE_ENV === 'production'): throws an explicit, fail-fast Error
 * 4. In development and testing: falls back safely to http://localhost:3000
 */

export function getSiteUrl(): string {
  // 1. Explicit public site URL configured in environment
  const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (nextPublicSiteUrl && nextPublicSiteUrl.trim() !== "") {
    return nextPublicSiteUrl.trim().replace(/\/+$/, "");
  }

  // 2. Vercel project production URL
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProdUrl && vercelProdUrl.trim() !== "") {
    const formatted = vercelProdUrl.trim().replace(/\/+$/, "");
    return formatted.startsWith("http://") || formatted.startsWith("https://")
      ? formatted
      : `https://${formatted}`;
  }

  // 3. Fail fast in production instead of silently falling back to localhost
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL in production environment. " +
        "Please configure NEXT_PUBLIC_SITE_URL in your production deployment settings."
    );
  }

  // 4. Safe fallback for local development and unit tests
  return "http://localhost:3000";
}

export function getAbsoluteUrl(path: string): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
