import { SITE_CONFIG } from "@/content/site";

/**
 * Validates a 10-digit Indian mobile number.
 * Must be exactly 10 digits starting with 6, 7, 8, or 9.
 */
export function validatePhoneNumber(phone: unknown): string {
  if (typeof phone !== "string") {
    throw new Error(
      `Invalid SITE_CONFIG.contact.phone: expected string but received ${typeof phone}.`
    );
  }

  const trimmed = phone.trim();
  if (!/^[6-9]\d{9}$/.test(trimmed)) {
    throw new Error(
      `Invalid SITE_CONFIG.contact.phone: "${phone}". Expected exactly 10 digits starting with 6, 7, 8, or 9 without spaces or +91 prefix.`
    );
  }

  return trimmed;
}

// Validate temple phone at build and start time
validatePhoneNumber(SITE_CONFIG.contact.phone);

export const DEFAULT_WHATSAPP_TEXT =
  "Namaste, I would like to enquire about a pooja.";

/**
 * Derives display text in the format "70905 85186" (5 digits, space, 5 digits).
 */
export function formatTemplePhone(
  phone: string = SITE_CONFIG.contact.phone
): string {
  const valid = validatePhoneNumber(phone);
  return `${valid.slice(0, 5)} ${valid.slice(5)}`;
}

/**
 * Derives tel: href in the format "tel:+917090585186".
 */
export function getTempleTelHref(
  phone: string = SITE_CONFIG.contact.phone
): string {
  const valid = validatePhoneNumber(phone);
  return `tel:+91${valid}`;
}

/**
 * Derives WhatsApp number in the format "917090585186".
 */
export function getTempleWhatsAppNumber(
  phone: string = SITE_CONFIG.contact.phone
): string {
  const valid = validatePhoneNumber(phone);
  return `91${valid}`;
}

/**
 * Derives WhatsApp link in the format:
 * https://wa.me/917090585186?text=<URL-encoded text>
 * Default text: "Namaste, I would like to enquire about a pooja."
 */
export function getTempleWhatsAppLink(
  text: string = DEFAULT_WHATSAPP_TEXT,
  phone: string = SITE_CONFIG.contact.phone
): string {
  const valid = validatePhoneNumber(phone);
  return `https://wa.me/91${valid}?text=${encodeURIComponent(text)}`;
}

/**
 * Derives JSON-LD telephone in +91 form ("+917090585186").
 */
export function getTempleJsonLdPhone(
  phone: string = SITE_CONFIG.contact.phone
): string {
  const valid = validatePhoneNumber(phone);
  return `+91${valid}`;
}

// Named property exports for convenience
export const templePhone = SITE_CONFIG.contact.phone;
export const templeDisplayPhone = formatTemplePhone();
export const templeTelHref = getTempleTelHref();
export const templeWhatsAppNumber = getTempleWhatsAppNumber();
export const templeWhatsAppLink = getTempleWhatsAppLink();
export const templeJsonLdPhone = getTempleJsonLdPhone();

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
 * Creates generic WhatsApp share URL.
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
