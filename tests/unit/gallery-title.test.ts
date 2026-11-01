import { describe, it, expect } from "vitest";
import {
  isFilenameLike,
  getPublicPhotoTitle,
  getPublicPhotoAlt,
  getPublicPhotoCaption,
  getOptimizedCloudinaryUrl,
  FALLBACK_PHOTO_ALT,
} from "@/lib/gallery-title";

describe("Gallery Filename-Like Detection & Clean Public Presentation", () => {
  describe("isFilenameLike", () => {
    it("flags empty, null, and whitespace-only strings as filename-like", () => {
      expect(isFilenameLike(null)).toBe(true);
      expect(isFilenameLike(undefined)).toBe(true);
      expect(isFilenameLike("")).toBe(true);
      expect(isFilenameLike("   ")).toBe(true);
    });

    it("flags raw image file extensions (.jpg, .jpeg, .png, .webp, .avif, .gif, etc.)", () => {
      expect(isFilenameLike("temple_front.jpg")).toBe(true);
      expect(isFilenameLike("idol-darshan.JPEG")).toBe(true);
      expect(isFilenameLike("festive_decoration.png")).toBe(true);
      expect(isFilenameLike("photo.webp")).toBe(true);
      expect(isFilenameLike("sanctum.avif")).toBe(true);
      expect(isFilenameLike("banner.gif")).toBe(true);
    });

    it("flags device and screenshot prefixes (IMG_, DSC, PXL, WhatsApp Image, Screenshot)", () => {
      expect(isFilenameLike("WhatsApp Image 2026 10 30 at 20.24.47")).toBe(true);
      expect(isFilenameLike("WhatsApp Image 2026 10 30 at 10.52.03 AM")).toBe(true);
      expect(isFilenameLike("IMG_20261030_145904")).toBe(true);
      expect(isFilenameLike("IMG-99482")).toBe(true);
      expect(isFilenameLike("DSC_0042")).toBe(true);
      expect(isFilenameLike("DSC-8812")).toBe(true);
      expect(isFilenameLike("PXL_20261031_092011")).toBe(true);
      expect(isFilenameLike("Screenshot 2026-10-31 084422")).toBe(true);
    });

    it("flags strings containing URL indicators or paths", () => {
      expect(isFilenameLike("https://res.cloudinary.com/sample.jpg")).toBe(true);
      expect(isFilenameLike("http://example.com/photo")).toBe(true);
      expect(isFilenameLike("uploads/temple/image")).toBe(true);
      expect(isFilenameLike("/public/images/temple")).toBe(true);
    });

    it("flags strings that are predominantly digits or timestamps", () => {
      expect(isFilenameLike("20261030_105203")).toBe(true);
      expect(isFilenameLike("9876543210")).toBe(true);
      expect(isFilenameLike("12345 67890")).toBe(true);
    });

    it("allows legitimate human titles and event names", () => {
      expect(isFilenameLike("Shri Vinayaka Temple")).toBe(false);
      expect(isFilenameLike("Ganesh Chaturthi Utsavam")).toBe(false);
      expect(isFilenameLike("Evening Maha Aarti")).toBe(false);
      expect(isFilenameLike("Deepotsav Celebration")).toBe(false);
      expect(isFilenameLike("Navaratri 2026")).toBe(false);
      expect(isFilenameLike("Sanctum Sanctorum Decorated with Flowers")).toBe(false);
    });
  });

  describe("getPublicPhotoTitle", () => {
    it("returns null if photo title looks like a filename and no event is attached", () => {
      expect(
        getPublicPhotoTitle({
          title: "WhatsApp Image 2026 10 30 at 20.24.47",
          eventTitle: null,
        })
      ).toBeNull();
    });

    it("falls back to event title if photo title is filename-like", () => {
      expect(
        getPublicPhotoTitle({
          title: "WhatsApp Image 2026 10 30 at 20.24.47",
          eventTitle: "Ganesh Chaturthi 2026",
        })
      ).toBe("Ganesh Chaturthi 2026");
    });

    it("returns legitimate photo title when valid", () => {
      expect(
        getPublicPhotoTitle({
          title: "Flower Decoration at Sanctum",
          eventTitle: "Ganesh Chaturthi 2026",
        })
      ).toBe("Flower Decoration at Sanctum");
    });
  });

  describe("getPublicPhotoAlt", () => {
    it("prioritizes legitimate caption over title or fallback", () => {
      expect(
        getPublicPhotoAlt({
          title: "WhatsApp Image 2026 10 30 at 20.24.47",
          caption: "Devotees gathering for evening aarti",
          eventTitle: null,
        })
      ).toBe("Devotees gathering for evening aarti");
    });

    it("falls back to event title if title is a filename and caption is empty", () => {
      expect(
        getPublicPhotoAlt({
          title: "IMG_20261030_145904.jpg",
          caption: "",
          eventTitle: "Sankashti Chaturthi Special Pooja",
        })
      ).toBe("Sankashti Chaturthi Special Pooja");
    });

    it("falls back to default fallback if both title and caption are filename-like/empty", () => {
      expect(
        getPublicPhotoAlt({
          title: "WhatsApp Image 2026 10 30 at 10.52.03 AM",
          caption: null,
          eventTitle: null,
        })
      ).toBe(FALLBACK_PHOTO_ALT);
    });

    it("discards filename-like captions from alt text", () => {
      expect(
        getPublicPhotoAlt({
          title: "WhatsApp Image 2026 10 30 at 10.52.03 AM",
          caption: "IMG_9942.jpg",
          eventTitle: "Diwali Deepotsav",
        })
      ).toBe("Diwali Deepotsav");
    });
  });

  describe("getPublicPhotoCaption", () => {
    it("returns trimmed caption if valid and human-readable", () => {
      expect(
        getPublicPhotoCaption({
          caption: "  Sacred lamp lit during twilight prayer  ",
        })
      ).toBe("Sacred lamp lit during twilight prayer");
    });

    it("returns null if caption is null, empty, or filename-like", () => {
      expect(getPublicPhotoCaption({ caption: null })).toBeNull();
      expect(getPublicPhotoCaption({ caption: "" })).toBeNull();
      expect(getPublicPhotoCaption({ caption: "Screenshot_2026.png" })).toBeNull();
    });
  });

  describe("getOptimizedCloudinaryUrl", () => {
    it("injects f_auto, q_auto, and bounding width into standard Cloudinary upload URL", () => {
      const raw =
        "https://res.cloudinary.com/demo/image/upload/v1793372368/vinayaka_temple/sample.jpg";
      const optimized = getOptimizedCloudinaryUrl(raw, { width: 600 });
      expect(optimized).toBe(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600,c_limit/v1793372368/vinayaka_temple/sample.jpg"
      );
    });

    it("replaces existing transformations without duplicating segments", () => {
      const raw =
        "https://res.cloudinary.com/demo/image/upload/w_1200,c_fill/v1793372368/vinayaka_temple/sample.jpg";
      const optimized = getOptimizedCloudinaryUrl(raw, { width: 400 });
      expect(optimized).toBe(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_limit/v1793372368/vinayaka_temple/sample.jpg"
      );
    });

    it("returns local paths and non-Cloudinary URLs unchanged", () => {
      expect(getOptimizedCloudinaryUrl("/images/temple.jpg", { width: 600 })).toBe(
        "/images/temple.jpg"
      );
      expect(
        getOptimizedCloudinaryUrl("https://images.unsplash.com/photo-123", { width: 600 })
      ).toBe("https://images.unsplash.com/photo-123");
    });
  });
});
