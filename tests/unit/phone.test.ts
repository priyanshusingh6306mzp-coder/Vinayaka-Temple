import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import React from "react";

// Ensure React is available globally for JSX runtime in unit tests
(globalThis as any).React = React;

import { renderToStaticMarkup } from "react-dom/server";
import {
  validatePhoneNumber,
  formatTemplePhone,
  getTempleTelHref,
  getTempleWhatsAppNumber,
  getTempleWhatsAppLink,
  getTempleJsonLdPhone,
  formatDevoteePhone,
  getDevoteeTelHref,
  getDevoteeWhatsAppLink,
  getWhatsAppShareUrl,
  DEFAULT_WHATSAPP_TEXT,
  templePhone,
  templeDisplayPhone,
  templeTelHref,
  templeWhatsAppNumber,
  templeWhatsAppLink,
  templeJsonLdPhone,
  COUNTRY_CODE_PREFIX,
} from "@/lib/phone";
import { SITE_CONFIG } from "@/content/site";
import { Header } from "@/components/public/Header";
import { StickyCallBar } from "@/components/public/StickyCallBar";
import { Footer } from "@/components/public/Footer";
import { JsonLd } from "@/components/public/JsonLd";

describe("Phone Number Centralization, Conditional UI & Validation", () => {
  describe("Validation", () => {
    it("returns null when phone is null, undefined, or empty string", () => {
      expect(validatePhoneNumber(null)).toBeNull();
      expect(validatePhoneNumber(undefined)).toBeNull();
      expect(validatePhoneNumber("")).toBeNull();
      expect(validatePhoneNumber("   ")).toBeNull();
    });

    it("accepts valid fake 10-digit mobile numbers starting with 6-9", () => {
      expect(validatePhoneNumber("9876543210")).toBe("9876543210");
      expect(validatePhoneNumber("8123456789")).toBe("8123456789");
      expect(validatePhoneNumber("7123456789")).toBe("7123456789");
      expect(validatePhoneNumber("6123456789")).toBe("6123456789");
    });

    it("rejects numbers starting with digits 0-5", () => {
      expect(() => validatePhoneNumber("5123456789")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("1234567890")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("0987654321")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
    });

    it("rejects numbers with +91 prefix, spaces, dashes, or invalid lengths", () => {
      expect(() => validatePhoneNumber("+919876543210")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("98765 43210")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("98765-43210")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("987654321")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("98765432100")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
    });

    it("rejects non-string non-null values", () => {
      expect(() => validatePhoneNumber(9876543210 as unknown)).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber({ phone: "9876543210" } as unknown)).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
    });
  });

  describe("Default Behaviour: Phone Intentionally Hidden", () => {
    it("ensures SITE_CONFIG.contact.phone is null by default", () => {
      expect(SITE_CONFIG.contact.phone).toBeNull();
    });

    it("ensures all temple helpers return null when phone is null", () => {
      expect(formatTemplePhone()).toBeNull();
      expect(getTempleTelHref()).toBeNull();
      expect(getTempleWhatsAppNumber()).toBeNull();
      expect(getTempleWhatsAppLink()).toBeNull();
      expect(getTempleJsonLdPhone()).toBeNull();

      expect(templePhone).toBeNull();
      expect(templeDisplayPhone).toBeNull();
      expect(templeTelHref).toBeNull();
      expect(templeWhatsAppNumber).toBeNull();
      expect(templeWhatsAppLink).toBeNull();
      expect(templeJsonLdPhone).toBeNull();
    });

    it("renders Header without call buttons and with 'Request a Pooja'", () => {
      const html = renderToStaticMarkup(React.createElement(Header));
      expect(html).not.toContain("tel:");
      expect(html).not.toContain("Call:");
      expect(html).toContain("Request a Pooja");
    });

    it("renders StickyCallBar as a single full-width 'Request a Pooja' button", () => {
      const html = renderToStaticMarkup(React.createElement(StickyCallBar));
      expect(html).not.toContain("tel:");
      expect(html).not.toContain("Call Priest");
      expect(html).toContain("Request a Pooja");
      expect(html).toContain("href=\"/pooja\"");
    });

    it("renders Footer with 'Contact' heading, address, and 'Request a Pooja' button without phone number", () => {
      const html = renderToStaticMarkup(React.createElement(Footer));
      expect(html).not.toContain("tel:");
      expect(html).not.toContain("Inquire via WhatsApp");
      expect(html).toContain("Contact");
      expect(html).toContain("Request a Pooja");
      expect(html).toContain(SITE_CONFIG.location.fullAddress);
    });

    it("renders JsonLd without telephone property when unconfigured", () => {
      const html = renderToStaticMarkup(React.createElement(JsonLd));
      expect(html).not.toContain('"telephone"');
    });
  });

  describe("Re-enabling Phone: Valid Number Restores Elements", () => {
    const fakePhone = "9876543210";

    it("derives proper formatted phone strings when a valid number is provided", () => {
      expect(formatTemplePhone(fakePhone)).toBe("98765 43210");
      expect(getTempleTelHref(fakePhone)).toBe("tel:+919876543210");
      expect(getTempleWhatsAppNumber(fakePhone)).toBe("919876543210");
      expect(getTempleWhatsAppLink(DEFAULT_WHATSAPP_TEXT, fakePhone)).toBe(
        `https://wa.me/91${fakePhone}?text=${encodeURIComponent(DEFAULT_WHATSAPP_TEXT)}`
      );
      expect(getTempleJsonLdPhone(fakePhone)).toBe("+919876543210");
    });

    it("derives custom WhatsApp link text", () => {
      const link = getTempleWhatsAppLink("Special Darshan Inquiry", fakePhone);
      expect(link).toBe(`https://wa.me/91${fakePhone}?text=Special%20Darshan%20Inquiry`);
    });
  });

  describe("Devotee Phone Helpers (Always Preserved)", () => {
    it("formats devotee phone correctly", () => {
      expect(formatDevoteePhone("9876543210")).toBe("+91 98765 43210");
      expect(formatDevoteePhone("919876543210")).toBe("+91 98765 43210");
    });

    it("creates tel link for devotee phone", () => {
      expect(getDevoteeTelHref("9876543210")).toBe("tel:9876543210");
    });

    it("creates devotee WhatsApp link", () => {
      expect(getDevoteeWhatsAppLink("919876543210", "Hello Devotee")).toBe(
        "https://wa.me/919876543210?text=Hello%20Devotee"
      );
    });

    it("creates generic WhatsApp share URL without telephone number", () => {
      const shareUrl = getWhatsAppShareUrl("Festival Announcement at Shri Vinayaka Temple");
      expect(shareUrl).toBe(
        "https://wa.me/?text=Festival%20Announcement%20at%20Shri%20Vinayaka%20Temple"
      );
      expect(shareUrl).not.toMatch(/wa\.me\/\d+/);
    });

    it("exports COUNTRY_CODE_PREFIX as +91", () => {
      expect(COUNTRY_CODE_PREFIX).toBe("+91");
    });
  });

  describe("Repository Guard: src/ Isolation Check", () => {
    function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          arrayOfFiles.push(fullPath);
        }
      });
      return arrayOfFiles;
    }

    it("fails if any file under src contains hardcoded tel:+91, wa.me/91, or old phone numbers", () => {
      const srcDir = path.resolve(process.cwd(), "src");
      const files = getAllFiles(srcDir);

      const violations: { file: string; match: string }[] = [];

      for (const filePath of files) {
        const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
        // Skip phone.ts as it holds the library implementation and JSDoc examples
        if (relative === "src/lib/phone.ts") {
          continue;
        }

        const content = fs.readFileSync(filePath, "utf-8");

        // 1. Check for hardcoded tel:+91 (dynamic templeTelHref is permitted where imported)
        if (content.includes('"tel:+91"') || content.includes("'tel:+91'")) {
          violations.push({ file: relative, match: "hardcoded tel:+91" });
        }

        // 2. Check for hardcoded wa.me/91
        if (content.includes('"wa.me/91"') || content.includes("'wa.me/91'")) {
          violations.push({ file: relative, match: "hardcoded wa.me/91" });
        }

        // 3. Check for old test phone numbers
        if (content.includes("7090585186") || content.includes("70905 85186")) {
          violations.push({ file: relative, match: "old number 7090585186" });
        }
        if (content.includes("6306213986") || content.includes("63062 13986")) {
          violations.push({ file: relative, match: "old number 6306213986" });
        }
      }

      expect(violations).toEqual([]);
    });
  });
});
