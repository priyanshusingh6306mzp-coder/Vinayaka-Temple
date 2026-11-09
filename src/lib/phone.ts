import { SITE_CONFIG } from "@/content/site";

/**
 * Validates a 10-digit Indian mobile number when provided.
 * Must be exactly 10 digits starting with 6, 7, 8, or 9.
 * Returns null if the phone is null, undefined, or empty (intentionally unconfigured).
 * Throws an Error if a non-empty, invalid phone number is provided.
 */
export function validatePhoneNumber(phone: unknown): string | null {
  if (phone === null || phone === undefined || phone === "") {
    return null;
  }

  if (typeof phone !== "string") {
    throw new Error(
      `Invalid SITE_CONFIG.contact.phone: expected string or null but received ${typeof phone}.`
    );
  }

  const trimmed = phone.trim();
  if (trimmed === "") {
    return null;
  }

  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    throw new Error(
      `Invalid SITE_CONFIG.contact.phone: "${phone}". Expected exactly 10 digits starting with 6, 7, 8, or 9 without spaces or +91 prefix.`
    );
  }

  return trimmed;
}

// Validate temple phone at build and start time (validates when present; succeeds cleanly when null/empty)
validatePhoneNumber(SITE_CONFIG.contact.phone);

export const DEFAULT_WHATSAPP_TEXT =
  "Namaste, I would like to enquire about a pooja.";

/**
 * Derives display text in the format "98765 43210" (5 digits, space, 5 digits).
 * Returns null if no temple phone is configured.
 */
export function formatTemplePhone(
  phone: string | null | undefined = SITE_CONFIG.contact.phone
): string | null {
  const valid = validatePhoneNumber(phone);
  if (!valid) return null;
  return `${valid.slice(0, 5)} ${valid.slice(5)}`;
}

/**
 * Derives tel: href in the format "tel:+919876543210".
 * Returns null if no temple phone is configured.
 */
export function getTempleTelHref(
  phone: string | null | undefined = SITE_CONFIG.contact.phone
): string | null {
  const valid = validatePhoneNumber(phone);
  if (!valid) return null;
  return `tel:+91${valid}`;
}

/**
 * Derives WhatsApp number in the format "919876543210".
 * Returns null if no temple phone is configured.
 */
export function getTempleWhatsAppNumber(
  phone: string | null | undefined = SITE_CONFIG.contact.phone
): string | null {
  const valid = validatePhoneNumber(phone);
  if (!valid) return null;
  return `91${valid}`;
}

/**
 * Derives WhatsApp link in the format:
 * https://wa.me/919876543210?text=<URL-encoded text>
 * Returns null if no temple phone is configured.
 */
export function getTempleWhatsAppLink(
  text: string = DEFAULT_WHATSAPP_TEXT,
  phone: string | null | undefined = SITE_CONFIG.contact.phone
): string | null {
  const valid = validatePhoneNumber(phone);
  if (!valid) return null;
  return `https://wa.me/91${valid}?text=${encodeURIComponent(text)}`;
}

/**
 * Derives JSON-LD telephone in +91 form ("+919876543210").
 * Returns null if no temple phone is configured.
 */
export function getTempleJsonLdPhone(
  phone: string | null | undefined = SITE_CONFIG.contact.phone
): string | null {
  const valid = validatePhoneNumber(phone);
  if (!valid) return null;
  return `+91${valid}`;
}

// Named property exports (null when unconfigured)
export const templePhone: string | null = SITE_CONFIG.contact.phone
  ? validatePhoneNumber(SITE_CONFIG.contact.phone)
  : null;
export const templeDisplayPhone: string | null = formatTemplePhone();
export const templeTelHref: string | null = getTempleTelHref();
export const templeWhatsAppNumber: string | null = getTempleWhatsAppNumber();
export const templeWhatsAppLink: string | null = getTempleWhatsAppLink();
export const templeJsonLdPhone: string | null = getTempleJsonLdPhone();

// Generic / Devotee phone helpers
export const COUNTRY_CODE_PREFIX = "+91";

/**
 * Formats user/devotee phone numbers for display.
 */
export function formatDevoteePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Creates tel: link for devotee phone numbers.
 */
export function getDevoteeTelHref(phone: string): string {
  return `tel:${phone}`;
}

/**
 * Creates WhatsApp chat URL for devotee communications.
 */
export function getDevoteeWhatsAppLink(phone: string, text: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

/**
 * Creates generic WhatsApp share URL (no telephone number included).
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
