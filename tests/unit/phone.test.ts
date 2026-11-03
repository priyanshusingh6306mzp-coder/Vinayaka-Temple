import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  validatePhoneNumber,
  formatTemplePhone,
  getTempleTelHref,
  getTempleWhatsAppNumber,
  getTempleWhatsAppLink,
  getTempleJsonLdPhone,
  DEFAULT_WHATSAPP_TEXT,
  formatDevoteePhone,
  getDevoteeTelHref,
  getDevoteeWhatsAppLink,
  getWhatsAppShareUrl,
  templeDisplayPhone,
  templeTelHref,
  templeWhatsAppNumber,
  templeWhatsAppLink,
  templeJsonLdPhone,
  COUNTRY_CODE_PREFIX,
} from "@/lib/phone";
import { SITE_CONFIG } from "@/content/site";

describe("Part 3: Phone Number Centralization & Helpers", () => {
  describe("Validation", () => {
    it("accepts valid 10-digit mobile numbers starting with 6-9", () => {
      expect(validatePhoneNumber("6306213986")).toBe("6306213986");
      expect(validatePhoneNumber("7012345678")).toBe("7012345678");
      expect(validatePhoneNumber("8123456789")).toBe("8123456789");
      expect(validatePhoneNumber("9876543210")).toBe("9876543210");
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
      expect(() => validatePhoneNumber("+916306213986")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("63062 13986")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("63062-13986")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("630621398")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber("63062139860")).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
    });

    it("rejects non-string values", () => {
      expect(() => validatePhoneNumber(null)).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber(undefined)).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
      expect(() => validatePhoneNumber(6306213986 as unknown)).toThrow(
        /SITE_CONFIG\.contact\.phone/
      );
    });
  });

  describe("Formatting and Derivation", () => {
    it("formats display phone as 5 digits, space, 5 digits", () => {
      expect(formatTemplePhone("6306213986")).toBe("63062 13986");
      expect(templeDisplayPhone).toBe("63062 13986");
    });

    it("derives tel: link in +91 form", () => {
      expect(getTempleTelHref("6306213986")).toBe("tel:+916306213986");
      expect(templeTelHref).toBe("tel:+916306213986");
    });

    it("derives WhatsApp number with 91 country code", () => {
      expect(getTempleWhatsAppNumber("6306213986")).toBe("916306213986");
      expect(templeWhatsAppNumber).toBe("916306213986");
    });

    it("derives WhatsApp link with default URL-encoded text", () => {
      const link = getTempleWhatsAppLink();
      expect(link).toBe(
        "https://wa.me/916306213986?text=Namaste%2C%20I%20would%20like%20to%20enquire%20about%20a%20pooja."
      );
      expect(templeWhatsAppLink).toBe(
        "https://wa.me/916306213986?text=Namaste%2C%20I%20would%20like%20to%20enquire%20about%20a%20pooja."
      );
      expect(DEFAULT_WHATSAPP_TEXT).toBe(
        "Namaste, I would like to enquire about a pooja."
      );
    });

    it("derives WhatsApp link with custom text", () => {
      const link = getTempleWhatsAppLink("Special Darshan Inquiry", "6306213986");
      expect(link).toBe(
        "https://wa.me/916306213986?text=Special%20Darshan%20Inquiry"
      );
    });

    it("derives JSON-LD telephone in +91 form", () => {
      expect(getTempleJsonLdPhone("6306213986")).toBe("+916306213986");
      expect(templeJsonLdPhone).toBe("+916306213986");
    });

    it("provides devotee phone helpers", () => {
      expect(formatDevoteePhone("9876543210")).toBe("+91 98765 43210");
      expect(getDevoteeTelHref("9876543210")).toBe("tel:9876543210");
      expect(getDevoteeWhatsAppLink("919876543210", "Hello")).toBe(
        "https://wa.me/919876543210?text=Hello"
      );
      expect(getWhatsAppShareUrl("Share text")).toBe(
        "https://wa.me/?text=Share%20text"
      );
      expect(COUNTRY_CODE_PREFIX).toBe("+91");
    });
  });

  describe("Repository Guard: src/ isolation check", () => {
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

    it("fails if any file under src other than site.ts and phone.ts contains 10-digit phone, 'tel:+91', or 'wa.me/91'", () => {
      const srcDir = path.resolve(process.cwd(), "src");
      const files = getAllFiles(srcDir);

      const violations: { file: string; match: string }[] = [];

      for (const filePath of files) {
        const relative = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
        if (relative === "src/content/site.ts" || relative === "src/lib/phone.ts") {
          continue;
        }

        const content = fs.readFileSync(filePath, "utf-8");

        // 1. Check for tel:+91
        if (content.includes("tel:+91")) {
          violations.push({ file: relative, match: "tel:+91" });
        }

        // 2. Check for wa.me/91
        if (content.includes("wa.me/91")) {
          violations.push({ file: relative, match: "wa.me/91" });
        }

        // 3. Check for 10-digit phone-like numbers starting with 6-9
        // (excluding timestamp numbers or obvious non-phone IDs)
        const phoneMatch = content.match(/\b[6-9]\d{9}\b/g);
        if (phoneMatch) {
          violations.push({
            file: relative,
            match: `10-digit phone number: ${phoneMatch.join(", ")}`,
          });
        }
      }

      expect(violations).toEqual([]);
    });
  });
});
